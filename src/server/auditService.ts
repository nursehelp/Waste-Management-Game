import fs from 'fs';
import path from 'path';
import { 
  AuditRecord, 
  AnalyticsSummary,
  AttemptMetrics 
} from '../types/audit';

export const AUDIT_ACCESS_PIN = '42774252';

const DATA_DIR = process.env.VERCEL 
  ? path.resolve('/tmp', 'data') 
  : path.resolve(process.cwd(), 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'audit_records.json');

export function initAuditStorage(): AuditRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error initializing audit storage:', err);
    return [];
  }
}

export function getAllAuditRecords(): AuditRecord[] {
  return initAuditStorage();
}

export function saveAllAuditRecords(records: AuditRecord[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save audit records:', err);
  }
}

export function addAuditRecord(entry: Omit<AuditRecord, 'id' | 'timestamp'>): AuditRecord {
  const records = getAllAuditRecords();
  const newRecord: AuditRecord = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  records.unshift(newRecord);
  saveAllAuditRecords(records);
  return newRecord;
}

export function resetAuditRecords(): AuditRecord[] {
  saveAllAuditRecords([]);
  return [];
}

export function calculateAnalytics(records: AuditRecord[]): AnalyticsSummary {
  const totalAudited = records.length;
  if (totalAudited === 0) {
    return {
      totalAudited: 0,
      avgAccuracy: 0,
      avgWastedCost: 0,
      firstAttempt: { count: 0, avgAccuracy: 0, avgWastedCost: 0, avgScore: 0 },
      secondAttempt: { count: 0, avgAccuracy: 0, avgWastedCost: 0, avgScore: 0 },
      accuracyImprovement: 0,
      costReduction: 0,
      progressionByAttempt: [
        { attempt: '1st Attempt', avgAccuracy: 0, avgWastedCost: 0, count: 0 },
        { attempt: '2nd Attempt', avgAccuracy: 0, avgWastedCost: 0, count: 0 }
      ],
      topMisclassifiedItems: [],
      recentRecords: []
    };
  }

  const avgAccuracy = Math.round(records.reduce((acc, r) => acc + r.accuracyPercent, 0) / totalAudited);
  const avgWastedCost = Math.round(records.reduce((acc, r) => acc + r.wastedCost, 0) / totalAudited);

  // Group by attempt type specifically
  const firsts = records.filter(r => r.attemptType === '1st Attempt');
  const seconds = records.filter(r => r.attemptType === '2nd Attempt');

  const firstAttempt: AttemptMetrics = {
    count: firsts.length,
    avgAccuracy: firsts.length > 0 ? Math.round(firsts.reduce((s, r) => s + r.accuracyPercent, 0) / firsts.length) : 0,
    avgWastedCost: firsts.length > 0 ? Math.round(firsts.reduce((s, r) => s + r.wastedCost, 0) / firsts.length) : 0,
    avgScore: firsts.length > 0 ? Number((firsts.reduce((s, r) => s + r.score, 0) / firsts.length).toFixed(1)) : 0
  };

  const secondAttempt: AttemptMetrics = {
    count: seconds.length,
    avgAccuracy: seconds.length > 0 ? Math.round(seconds.reduce((s, r) => s + r.accuracyPercent, 0) / seconds.length) : 0,
    avgWastedCost: seconds.length > 0 ? Math.round(seconds.reduce((s, r) => s + r.wastedCost, 0) / seconds.length) : 0,
    avgScore: seconds.length > 0 ? Number((seconds.reduce((s, r) => s + r.score, 0) / seconds.length).toFixed(1)) : 0
  };

  const accuracyImprovement = (seconds.length > 0 && firsts.length > 0)
    ? secondAttempt.avgAccuracy - firstAttempt.avgAccuracy
    : 0;

  const costReduction = (seconds.length > 0 && firsts.length > 0)
    ? firstAttempt.avgWastedCost - secondAttempt.avgWastedCost
    : 0;

  const progressionByAttempt = [
    {
      attempt: '1st Attempt',
      avgAccuracy: firstAttempt.avgAccuracy,
      avgWastedCost: firstAttempt.avgWastedCost,
      count: firstAttempt.count
    },
    {
      attempt: '2nd Attempt',
      avgAccuracy: secondAttempt.avgAccuracy,
      avgWastedCost: secondAttempt.avgWastedCost,
      count: secondAttempt.count
    }
  ];

  const itemMistakeMap: Record<string, { count: number; wrongBins: Record<string, number>; correctBin: string; totalCost: number }> = {};
  records.forEach(r => {
    if (r.mistakes && Array.isArray(r.mistakes)) {
      r.mistakes.forEach(m => {
        if (!itemMistakeMap[m.itemName]) itemMistakeMap[m.itemName] = { count: 0, wrongBins: {}, correctBin: m.correctBin, totalCost: 0 };
        itemMistakeMap[m.itemName].count++;
        itemMistakeMap[m.itemName].totalCost += (m.penalty || 500);
        itemMistakeMap[m.itemName].wrongBins[m.chosenBin] = (itemMistakeMap[m.itemName].wrongBins[m.chosenBin] || 0) + 1;
      });
    }
  });

  const topMisclassifiedItems = Object.entries(itemMistakeMap)
    .map(([itemName, data]) => {
      const topWrong = Object.entries(data.wrongBins).sort((a, b) => b[1] - a[1])[0];
      return {
        itemName,
        mistakeCount: data.count,
        commonWrongBin: topWrong ? topWrong[0] : 'Unknown',
        correctBin: data.correctBin,
        totalRiskCost: data.totalCost
      };
    })
    .sort((a, b) => b.mistakeCount - a.mistakeCount)
    .slice(0, 8);

  return {
    totalAudited,
    avgAccuracy,
    avgWastedCost,
    firstAttempt,
    secondAttempt,
    accuracyImprovement,
    costReduction,
    progressionByAttempt,
    topMisclassifiedItems,
    recentRecords: records.slice(0, 50)
  };
}

export function generateCsvReport(records: AuditRecord[]): string {
  const headers = ['Audit ID', 'Date / Time', 'Session ID', 'Scenario', 'Attempt Stage', 'Score (out of 10)', 'Accuracy (%)', 'Financial Risk (£/tonne)', 'Mistakes Count'];
  const rows = records.map(r => [
    `"${r.id}"`,
    `"${new Date(r.timestamp).toLocaleString('en-GB')}"`,
    `"${r.sessionId || ''}"`,
    `"${r.scenario || 'All'}"`,
    `"${r.attemptType}"`,
    r.score,
    `"${r.accuracyPercent}%"`,
    `"£${r.wastedCost}"`,
    r.mistakes ? r.mistakes.length : 0
  ].join(','));
  return [headers.join(','), ...rows].join('\n');
}
