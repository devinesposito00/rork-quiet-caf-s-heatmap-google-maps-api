import { CheckIn, NoiseLevel, TimeBucket, DayType, AggregatedScore } from '@/types';

const NOISE_POINTS: Record<NoiseLevel, number> = {
  0: 100,
  1: 50,
  2: 0,
};

const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;

export function calculateQuietScore(checkIns: CheckIn[]): number | null {
  if (checkIns.length < 3) return null;
  
  const now = Date.now();
  const recentCheckIns = checkIns.filter(
    (c) => now - c.timestamp < NINETY_DAYS_MS
  );
  
  if (recentCheckIns.length < 3) return null;
  
  let weightedSum = 0;
  let totalWeight = 0;
  
  recentCheckIns.forEach((checkIn) => {
    const ageMs = now - checkIn.timestamp;
    const weight = Math.exp(-ageMs / (30 * 24 * 60 * 60 * 1000));
    weightedSum += NOISE_POINTS[checkIn.noiseLevel] * weight;
    totalWeight += weight;
  });
  
  return Math.round(weightedSum / totalWeight);
}

export function calculateAggregatedScores(
  cafeId: string,
  checkIns: CheckIn[]
): AggregatedScore[] {
  const scores: AggregatedScore[] = [];
  const timeBuckets: TimeBucket[] = ['morning', 'midday', 'afternoon', 'evening', 'late'];
  const dayTypes: DayType[] = ['weekday', 'weekend'];
  
  timeBuckets.forEach((timeBucket) => {
    dayTypes.forEach((dayType) => {
      const filtered = checkIns.filter(
        (c) => c.timeBucket === timeBucket && c.dayType === dayType
      );
      
      const score = calculateQuietScore(filtered);
      
      scores.push({
        cafeId,
        timeBucket,
        dayType,
        quietScore: score ?? -1,
        sampleCount: filtered.length,
        lastUpdated: Date.now(),
      });
    });
  });
  
  return scores;
}

export function getCurrentTimeBucket(): TimeBucket {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 14) return 'midday';
  if (hour >= 14 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'late';
}

export function getCurrentDayType(): DayType {
  const day = new Date().getDay();
  return day === 0 || day === 6 ? 'weekend' : 'weekday';
}

export function getScoreLabel(score: number | null): string {
  if (score === null) return 'No data';
  if (score >= 70) return 'Quiet';
  if (score >= 40) return 'Medium';
  return 'Loud';
}

export function getScoreColor(score: number | null): 'quiet' | 'medium' | 'loud' | 'unknown' {
  if (score === null) return 'unknown';
  if (score >= 70) return 'quiet';
  if (score >= 40) return 'medium';
  return 'loud';
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function formatDistance(km: number, units: 'km' | 'mi'): string {
  if (units === 'mi') {
    const mi = km * 0.621371;
    return mi < 0.1 ? `${Math.round(mi * 5280)} ft` : `${mi.toFixed(1)} mi`;
  }
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}
