export interface AuditMistake {
  itemName: string;
  chosenBin: string;
  correctBin: string;
  penalty: number;
}

export interface AuditRecord {
  id: string;
  sessionId: string;
  timestamp: string;
  scenario: string;
  attemptType: '1st Attempt' | '2nd Attempt';

  // Performance
  score: number;
  totalItems: number;
  accuracyPercent: number;
  wastedCost: number;
  correctCount: number;
  incorrectCount: number;
  timeSpentSeconds: number;
  mistakes: AuditMistake[];
}

export interface AttemptMetrics {
  count: number;
  avgAccuracy: number;
  avgWastedCost: number;
  avgScore: number;
}

export interface AnalyticsSummary {
  totalAudited: number;
  avgAccuracy: number;
  avgWastedCost: number;
  
  // Specific data for 1st attempt vs 2nd attempt
  firstAttempt: AttemptMetrics;
  secondAttempt: AttemptMetrics;
  accuracyImprovement: number;
  costReduction: number;

  // Progression (Improvement)
  progressionByAttempt: {
    attempt: string;
    avgAccuracy: number;
    avgWastedCost: number;
    count: number;
  }[];

  // Top Mistake Items
  topMisclassifiedItems: {
    itemName: string;
    mistakeCount: number;
    commonWrongBin: string;
    correctBin: string;
    totalRiskCost: number;
  }[];

  recentRecords: AuditRecord[];
}
