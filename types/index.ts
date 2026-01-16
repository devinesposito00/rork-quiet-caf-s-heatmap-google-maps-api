export type NoiseLevel = 0 | 1 | 2;

export type TimeBucket = 'morning' | 'midday' | 'afternoon' | 'evening' | 'late';
export type DayType = 'weekday' | 'weekend';

export interface Cafe {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category?: string;
  imageUrl?: string;
}

export interface CheckIn {
  id: string;
  cafeId: string;
  timestamp: number;
  timeBucket: TimeBucket;
  dayType: DayType;
  noiseLevel: NoiseLevel;
  tags: string[];
  deviceAnonId: string;
}

export interface AggregatedScore {
  cafeId: string;
  timeBucket: TimeBucket;
  dayType: DayType;
  quietScore: number;
  sampleCount: number;
  lastUpdated: number;
}

export interface CafeWithScore extends Cafe {
  quietScore: number | null;
  sampleCount: number;
  distance?: number;
  isBookmarked?: boolean;
}

export interface FilterState {
  timeBucket: TimeBucket | 'now';
  dayType: DayType | 'all';
  laptopFriendly: boolean;
}

export interface AppSettings {
  units: 'km' | 'mi';
  shareAnonymously: boolean;
  quietAlerts: boolean;
  alertTimeBuckets: TimeBucket[];
  alertRadius: number;
}

export const TIME_BUCKETS: { key: TimeBucket | 'now'; label: string; hours?: [number, number] }[] = [
  { key: 'now', label: 'Now' },
  { key: 'morning', label: 'Morning', hours: [6, 11] },
  { key: 'midday', label: 'Midday', hours: [11, 14] },
  { key: 'afternoon', label: 'Afternoon', hours: [14, 17] },
  { key: 'evening', label: 'Evening', hours: [17, 21] },
  { key: 'late', label: 'Late', hours: [21, 24] },
];

export const NOISE_LABELS: Record<NoiseLevel, string> = {
  0: 'Quiet',
  1: 'Medium',
  2: 'Loud',
};

export const NOISE_ICONS: Record<NoiseLevel, string> = {
  0: '🤫',
  1: '💬',
  2: '📢',
};

export const CHECKIN_TAGS = [
  'music',
  'crowded',
  'lots of calls',
  'good for laptop',
  'outlets',
  'wifi ok',
  'cozy',
  'spacious',
  'good coffee',
];
