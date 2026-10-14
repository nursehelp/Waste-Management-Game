import { AuditRecord, AnalyticsSummary, AttemptMetrics } from '../types/audit';

export function calculateClientAnalytics(records: AuditRecord[]): AnalyticsSummary {
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
        if (!itemMistakeMap[m.itemName]) {
          itemMistakeMap[m.itemName] = { count: 0, wrongBins: {}, correctBin: m.correctBin, totalCost: 0 };
        }
        itemMistakeMap[m.itemName].count++;
        itemMistakeMap[m.itemName].totalCost += (m.penalty || 500);
        itemMistakeMap[m.itemName].wrongBins[m.chosenBin] = (itemMistakeMap[m.itemName].wrongBins[m.chosenBin] || 0) + 1;
      });
    }
  });

  const topMisclassifiedItems = Object.entries(itemMistakeMap)
    .map(([itemName, data]) => {
      let topWrongBin = 'General';
      let maxCount = 0;
      Object.entries(data.wrongBins).forEach(([bin, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topWrongBin = bin;
        }
      });

      return {
        itemName,
        mistakeCount: data.count,
        commonWrongBin: topWrongBin,
        correctBin: data.correctBin,
        totalRiskCost: data.totalCost
      };
    })
    .sort((a, b) => b.mistakeCount - a.mistakeCount)
    .slice(0, 5);

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
    recentRecords: records.slice(0, 15)
  };
}
