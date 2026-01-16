import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Cafe,
  CheckIn,
  CafeWithScore,
  FilterState,
  AppSettings,
} from '@/types';
import { MOCK_CAFES, MOCK_CHECKINS } from '@/mocks/cafes';
import {
  calculateQuietScore,
  getCurrentTimeBucket,
  getCurrentDayType,
  calculateDistance,
} from '@/utils/scoring';

const STORAGE_KEYS = {
  CHECKINS: 'quiet_cafes_checkins',
  BOOKMARKS: 'quiet_cafes_bookmarks',
  SETTINGS: 'quiet_cafes_settings',
  DEVICE_ID: 'quiet_cafes_device_id',
  LAST_CHECKIN_TIMES: 'quiet_cafes_last_checkin',
};

const DEFAULT_SETTINGS: AppSettings = {
  units: 'mi',
  shareAnonymously: true,
  quietAlerts: false,
  alertTimeBuckets: [],
  alertRadius: 1,
};

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const [AppProvider, useApp] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [deviceId, setDeviceId] = useState<string>('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    timeBucket: 'now',
    dayType: 'all',
    laptopFriendly: false,
  });

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID).then((id) => {
      if (id) {
        setDeviceId(id);
      } else {
        const newId = generateUUID();
        AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, newId);
        setDeviceId(newId);
      }
    });
  }, []);

  const checkInsQuery = useQuery({
    queryKey: ['checkIns'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CHECKINS);
      const userCheckIns: CheckIn[] = stored ? JSON.parse(stored) : [];
      return [...MOCK_CHECKINS, ...userCheckIns];
    },
  });

  const bookmarksQuery = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return stored ? (JSON.parse(stored) as string[]) : [];
    },
  });

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    },
  });

  const lastCheckInTimesQuery = useQuery({
    queryKey: ['lastCheckInTimes'],
    queryFn: async () => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.LAST_CHECKIN_TIMES);
      return stored ? (JSON.parse(stored) as Record<string, number>) : {};
    },
  });

  const addCheckInMutation = useMutation({
    mutationFn: async (checkIn: Omit<CheckIn, 'id' | 'deviceAnonId' | 'timestamp' | 'timeBucket' | 'dayType'>) => {
      const newCheckIn: CheckIn = {
        ...checkIn,
        id: generateUUID(),
        deviceAnonId: deviceId,
        timestamp: Date.now(),
        timeBucket: getCurrentTimeBucket(),
        dayType: getCurrentDayType(),
      };
      
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.CHECKINS);
      const existing: CheckIn[] = stored ? JSON.parse(stored) : [];
      const updated = [...existing, newCheckIn];
      await AsyncStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(updated));
      
      const lastTimes = await AsyncStorage.getItem(STORAGE_KEYS.LAST_CHECKIN_TIMES);
      const times: Record<string, number> = lastTimes ? JSON.parse(lastTimes) : {};
      times[checkIn.cafeId] = Date.now();
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_CHECKIN_TIMES, JSON.stringify(times));
      
      return newCheckIn;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkIns'] });
      queryClient.invalidateQueries({ queryKey: ['lastCheckInTimes'] });
    },
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: async (cafeId: string) => {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      const bookmarks: string[] = stored ? JSON.parse(stored) : [];
      const updated = bookmarks.includes(cafeId)
        ? bookmarks.filter((id) => id !== cafeId)
        : [...bookmarks, cafeId];
      await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<AppSettings>) => {
      const current = settingsQuery.data || DEFAULT_SETTINGS;
      const updated = { ...current, ...newSettings };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const canCheckIn = useCallback(
    (cafeId: string): boolean => {
      const lastTimes = lastCheckInTimesQuery.data || {};
      const lastTime = lastTimes[cafeId];
      if (!lastTime) return true;
      return Date.now() - lastTime > 30 * 60 * 1000;
    },
    [lastCheckInTimesQuery.data]
  );

  const getTimeUntilNextCheckIn = useCallback(
    (cafeId: string): number => {
      const lastTimes = lastCheckInTimesQuery.data || {};
      const lastTime = lastTimes[cafeId];
      if (!lastTime) return 0;
      const remaining = 30 * 60 * 1000 - (Date.now() - lastTime);
      return Math.max(0, remaining);
    },
    [lastCheckInTimesQuery.data]
  );

  const cafesWithScores = useMemo((): CafeWithScore[] => {
    const checkIns = checkInsQuery.data || [];
    const bookmarks = bookmarksQuery.data || [];
    const currentTimeBucket = filters.timeBucket === 'now' ? getCurrentTimeBucket() : filters.timeBucket;
    const currentDayType = filters.dayType === 'all' ? getCurrentDayType() : filters.dayType;

    const results: CafeWithScore[] = [];
    
    for (const cafe of MOCK_CAFES) {
      let relevantCheckIns = checkIns.filter((c) => c.cafeId === cafe.id);
      
      if (filters.timeBucket !== 'now' || filters.dayType !== 'all') {
        relevantCheckIns = relevantCheckIns.filter((c) => {
          const matchesTime = filters.timeBucket === 'now' || c.timeBucket === currentTimeBucket;
          const matchesDay = filters.dayType === 'all' || c.dayType === currentDayType;
          return matchesTime && matchesDay;
        });
      }

      if (filters.laptopFriendly) {
        const cafeCheckIns = checkIns.filter((c) => c.cafeId === cafe.id);
        const hasLaptopTag = cafeCheckIns.some((c) => c.tags.includes('good for laptop'));
        if (!hasLaptopTag && cafeCheckIns.length > 0) {
          continue;
        }
      }

      const quietScore = calculateQuietScore(relevantCheckIns);
      const distance = userLocation
        ? calculateDistance(userLocation.lat, userLocation.lng, cafe.latitude, cafe.longitude)
        : undefined;

      results.push({
        ...cafe,
        quietScore,
        sampleCount: relevantCheckIns.length,
        distance,
        isBookmarked: bookmarks.includes(cafe.id),
      });
    }
    
    return results;
  }, [checkInsQuery.data, bookmarksQuery.data, filters, userLocation]);

  const getCheckInsForCafe = useCallback(
    (cafeId: string): CheckIn[] => {
      return (checkInsQuery.data || [])
        .filter((c) => c.cafeId === cafeId)
        .sort((a, b) => b.timestamp - a.timestamp);
    },
    [checkInsQuery.data]
  );

  return {
    cafes: MOCK_CAFES,
    cafesWithScores,
    checkIns: checkInsQuery.data || [],
    bookmarks: bookmarksQuery.data || [],
    settings: settingsQuery.data || DEFAULT_SETTINGS,
    isLoading: checkInsQuery.isLoading || bookmarksQuery.isLoading,
    
    userLocation,
    setUserLocation,
    selectedCafe,
    setSelectedCafe,
    filters,
    setFilters,
    
    addCheckIn: addCheckInMutation.mutate,
    isAddingCheckIn: addCheckInMutation.isPending,
    toggleBookmark: toggleBookmarkMutation.mutate,
    updateSettings: updateSettingsMutation.mutate,
    
    canCheckIn,
    getTimeUntilNextCheckIn,
    getCheckInsForCafe,
  };
});

export function useBookmarkedCafes() {
  const { cafesWithScores, bookmarks } = useApp();
  return useMemo(
    () => cafesWithScores.filter((c) => bookmarks.includes(c.id)),
    [cafesWithScores, bookmarks]
  );
}

export function useSortedCafes(sortBy: 'distance' | 'quietScore') {
  const { cafesWithScores } = useApp();
  return useMemo(() => {
    return [...cafesWithScores].sort((a, b) => {
      if (sortBy === 'distance') {
        if (!a.distance) return 1;
        if (!b.distance) return -1;
        return a.distance - b.distance;
      }
      if (a.quietScore === null) return 1;
      if (b.quietScore === null) return -1;
      return b.quietScore - a.quietScore;
    });
  }, [cafesWithScores, sortBy]);
}
