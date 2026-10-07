export function calculateStreak(depositDates: string[]): number {
  if (depositDates.length === 0) return 0;
  return depositDates.length;
}

export function requiresCoolingOffWalk(action: 'sell', holdingDurationDays: number): boolean {
  if (action === 'sell' && holdingDurationDays < 90) {
    return true;
  }
  return false;
}
