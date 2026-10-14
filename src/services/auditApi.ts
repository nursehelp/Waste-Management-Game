import { AuditRecord, AnalyticsSummary } from '../types/audit';

export async function verifyAuditPin(pin: string): Promise<boolean> {
  try {
    const res = await fetch('/api/audit/verify-pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin })
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to verify PIN', err);
    return false;
  }
}

export async function fetchAuditAnalytics(pin: string): Promise<AnalyticsSummary> {
  const res = await fetch('/api/audit/analytics', {
    headers: { 'x-audit-pin': pin }
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('UNAUTHORIZED_PIN');
    throw new Error('Failed to fetch analytics from backend server');
  }
  return await res.json();
}

export async function fetchAuditRecords(pin: string): Promise<AuditRecord[]> {
  const res = await fetch('/api/audit/records', {
    headers: { 'x-audit-pin': pin }
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('UNAUTHORIZED_PIN');
    throw new Error('Failed to fetch audit records from backend server');
  }
  return await res.json();
}

export async function submitAuditRecord(
  data: Omit<AuditRecord, 'id' | 'timestamp'>
): Promise<{ success: boolean; record: AuditRecord }> {
  const res = await fetch('/api/audit/scores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    throw new Error('Failed to submit score to backend server');
  }

  const result = await res.json();
  return { success: true, record: result.record };
}

export async function resetAuditData(pin: string): Promise<boolean> {
  const res = await fetch('/api/audit/reset', { 
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'x-audit-pin': pin 
    },
    body: JSON.stringify({ pin })
  });
  if (!res.ok) {
    throw new Error('Failed to clear audit data on server');
  }
  return true;
}

export function getAuditCsvDownloadUrl(pin: string): string {
  return `/api/audit/export.csv?pin=${encodeURIComponent(pin)}`;
}
