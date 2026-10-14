import { AuditRecord, AnalyticsSummary } from '../types/audit';
import { calculateClientAnalytics } from './clientAnalytics';
import { db } from './firebase';
import { collection, doc, setDoc, getDocs, deleteDoc, writeBatch } from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'waste_segregation_audit_records';
const AUDIT_COLLECTION = 'audit_records';

function getLocalAuditRecords(): AuditRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalAuditRecords(records: AuditRecord[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

export async function verifyAuditPin(pin: string): Promise<boolean> {
  const cleanPin = pin.trim();
  try {
    const res = await fetch('/api/audit/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: cleanPin })
    });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data && typeof data.success === 'boolean') {
        return data.success;
      }
    }
  } catch (err) {
    console.warn('Backend API PIN check not available; using authorized PIN verification:', err);
  }

  // Consistent authorized manager PIN
  return cleanPin === '42774252';
}

export async function fetchAuditRecords(_pin: string): Promise<AuditRecord[]> {
  // 1. Try Google Cloud Firestore
  try {
    const colRef = collection(db, AUDIT_COLLECTION);
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const firestoreRecords: AuditRecord[] = [];
      snapshot.forEach((docSnap) => {
        firestoreRecords.push(docSnap.data() as AuditRecord);
      });
      // Sort newest first
      firestoreRecords.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      // Sync to local cache
      saveLocalAuditRecords(firestoreRecords);
      return firestoreRecords;
    }
  } catch (firestoreErr) {
    console.warn('Firestore fetch failed, checking server API / local store:', firestoreErr);
  }

  // 2. Try Node server API
  try {
    const res = await fetch('/api/audit/records', {
      headers: { 'x-audit-pin': _pin }
    });
    if (res.ok) {
      const serverRecords = await res.json();
      if (Array.isArray(serverRecords) && serverRecords.length > 0) {
        saveLocalAuditRecords(serverRecords);
        return serverRecords;
      }
    }
  } catch (err) {
    console.warn('Backend records API not available, loading local records:', err);
  }

  // 3. Fallback to localStorage
  return getLocalAuditRecords();
}

export async function fetchAuditAnalytics(pin: string): Promise<AnalyticsSummary> {
  // Always query latest records (from Firestore, server, or local)
  const records = await fetchAuditRecords(pin);
  return calculateClientAnalytics(records);
}

export async function submitAuditRecord(
  data: Omit<AuditRecord, 'id' | 'timestamp'>
): Promise<{ success: boolean; record: AuditRecord }> {
  const newRecord: AuditRecord = {
    ...data,
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString()
  };

  // 1. Always cache in localStorage
  const current = getLocalAuditRecords();
  current.unshift(newRecord);
  saveLocalAuditRecords(current);

  // 2. Persist to Google Cloud Firestore
  try {
    const docRef = doc(db, AUDIT_COLLECTION, newRecord.id);
    const sanitized = JSON.parse(JSON.stringify(newRecord));
    await setDoc(docRef, sanitized);
    console.log('Audit record securely backed up to Google Cloud Firestore:', newRecord.id);
  } catch (firestoreErr) {
    console.warn('Error saving to Google Cloud Firestore:', firestoreErr);
  }

  // 3. Also notify Node backend if running
  try {
    await fetch('/api/audit/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (err) {
    // Expected on static Vercel
  }

  return { success: true, record: newRecord };
}

export async function resetAuditData(pin: string): Promise<boolean> {
  // 1. Clear localStorage
  saveLocalAuditRecords([]);

  // 2. Wipe from Google Cloud Firestore
  try {
    const colRef = collection(db, AUDIT_COLLECTION);
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const batch = writeBatch(db);
      snapshot.docs.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
      console.log('Google Cloud Firestore audit records cleared successfully.');
    }
  } catch (firestoreErr) {
    console.warn('Error clearing Firestore audit records:', firestoreErr);
  }

  // 3. Wipe from server if server is running
  try {
    await fetch('/api/audit/reset', { 
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-audit-pin': pin 
      },
      body: JSON.stringify({ pin })
    });
  } catch (err) {
    // Expected on static host
  }

  return true;
}

export function getAuditCsvDownloadUrl(_pin: string): string {
  const records = getLocalAuditRecords();
  if (records.length === 0) {
    return '';
  }

  const headers = ['ID', 'Date', 'Scenario', 'Attempt Stage', 'Score', 'Total Items', 'Accuracy %', 'Wasted Cost (£)'];
  const rows = records.map(r => [
    r.id,
    new Date(r.timestamp).toISOString(),
    `"${(r.scenario || '').replace(/"/g, '""')}"`,
    r.attemptType,
    r.score,
    r.totalItems,
    r.accuracyPercent,
    r.wastedCost
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  return `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
}
