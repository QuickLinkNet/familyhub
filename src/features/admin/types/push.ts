export interface PushAdministration {
  active: number;
  lastSuccessAt: string | null;
  lastErrorAt: string | null;
  schedulerUrl: string;
  lastDispatchAt: string | null;
  recommendedIntervalMinutes: number;
}

export interface PushDispatchResult {
  members: number;
  delivered: number;
  failed: number;
}
