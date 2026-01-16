import { Cafe, CheckIn, TimeBucket, DayType, NoiseLevel } from '@/types';

export const MOCK_CAFES: Cafe[] = [
  {
    id: 'cafe_1',
    name: 'The Quiet Bean',
    address: '123 Valencia St, San Francisco, CA',
    latitude: 37.7649,
    longitude: -122.4214,
    category: 'Coffee Shop',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
  },
  {
    id: 'cafe_2',
    name: 'Ritual Coffee Roasters',
    address: '1026 Valencia St, San Francisco, CA',
    latitude: 37.7567,
    longitude: -122.4211,
    category: 'Coffee Shop',
    imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400',
  },
  {
    id: 'cafe_3',
    name: 'Sightglass Coffee',
    address: '270 7th St, San Francisco, CA',
    latitude: 37.7767,
    longitude: -122.4067,
    category: 'Coffee Shop',
    imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
  },
  {
    id: 'cafe_4',
    name: 'Blue Bottle Coffee',
    address: '66 Mint St, San Francisco, CA',
    latitude: 37.7827,
    longitude: -122.4027,
    category: 'Coffee Shop',
    imageUrl: 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=400',
  },
  {
    id: 'cafe_5',
    name: 'Philz Coffee',
    address: '3101 24th St, San Francisco, CA',
    latitude: 37.7527,
    longitude: -122.4147,
    category: 'Coffee Shop',
    imageUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400',
  },
  {
    id: 'cafe_6',
    name: 'Four Barrel Coffee',
    address: '375 Valencia St, San Francisco, CA',
    latitude: 37.7667,
    longitude: -122.4217,
    category: 'Coffee Shop',
    imageUrl: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=400',
  },
  {
    id: 'cafe_7',
    name: 'Equator Coffees',
    address: '986 Market St, San Francisco, CA',
    latitude: 37.7827,
    longitude: -122.4107,
    category: 'Coffee Shop',
    imageUrl: 'https://images.unsplash.com/photo-1511081692775-05d0f180a065?w=400',
  },
  {
    id: 'cafe_8',
    name: 'Réveille Coffee Co',
    address: '200 Columbus Ave, San Francisco, CA',
    latitude: 37.7967,
    longitude: -122.4047,
    category: 'Coffee Shop',
    imageUrl: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=400',
  },
  {
    id: 'cafe_9',
    name: 'Mazarine Coffee',
    address: '720 Market St, San Francisco, CA',
    latitude: 37.7867,
    longitude: -122.4047,
    category: 'Coffee Shop',
    imageUrl: 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400',
  },
  {
    id: 'cafe_10',
    name: 'The Mill',
    address: '736 Divisadero St, San Francisco, CA',
    latitude: 37.7767,
    longitude: -122.4377,
    category: 'Coffee Shop',
    imageUrl: 'https://images.unsplash.com/photo-1463797221720-6b07e6426c24?w=400',
  },
  {
    id: 'cafe_11',
    name: 'Flywheel Coffee',
    address: '672 Stanyan St, San Francisco, CA',
    latitude: 37.7687,
    longitude: -122.4537,
    category: 'Coffee Shop',
    imageUrl: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400',
  },
  {
    id: 'cafe_12',
    name: 'Andytown Coffee',
    address: '3655 Lawton St, San Francisco, CA',
    latitude: 37.7557,
    longitude: -122.5017,
    category: 'Coffee Shop',
    imageUrl: 'https://images.unsplash.com/photo-1485182708500-e8f1f318ba72?w=400',
  },
];

function generateMockCheckIns(): CheckIn[] {
  const checkIns: CheckIn[] = [];
  const timeBuckets: TimeBucket[] = ['morning', 'midday', 'afternoon', 'evening', 'late'];
  const dayTypes: DayType[] = ['weekday', 'weekend'];
  const tags = ['music', 'good for laptop', 'outlets', 'wifi ok', 'cozy', 'crowded'];
  
  const cafeProfiles: Record<string, { baseNoise: number; variance: number }> = {
    cafe_1: { baseNoise: 0, variance: 0.3 },
    cafe_2: { baseNoise: 1, variance: 0.4 },
    cafe_3: { baseNoise: 0, variance: 0.2 },
    cafe_4: { baseNoise: 1, variance: 0.5 },
    cafe_5: { baseNoise: 2, variance: 0.3 },
    cafe_6: { baseNoise: 1, variance: 0.4 },
    cafe_7: { baseNoise: 0, variance: 0.3 },
    cafe_8: { baseNoise: 1, variance: 0.3 },
    cafe_9: { baseNoise: 0, variance: 0.2 },
    cafe_10: { baseNoise: 1, variance: 0.5 },
    cafe_11: { baseNoise: 0, variance: 0.2 },
    cafe_12: { baseNoise: 0, variance: 0.1 },
  };
  
  MOCK_CAFES.forEach((cafe) => {
    const profile = cafeProfiles[cafe.id] || { baseNoise: 1, variance: 0.5 };
    const checkInCount = Math.floor(Math.random() * 20) + 10;
    
    for (let i = 0; i < checkInCount; i++) {
      const daysAgo = Math.floor(Math.random() * 60);
      const timestamp = Date.now() - daysAgo * 24 * 60 * 60 * 1000;
      
      const randomOffset = (Math.random() - 0.5) * 2 * profile.variance;
      let noise = Math.round(profile.baseNoise + randomOffset);
      noise = Math.max(0, Math.min(2, noise)) as NoiseLevel;
      
      const selectedTags = tags
        .filter(() => Math.random() > 0.7)
        .slice(0, 3);
      
      checkIns.push({
        id: `checkin_${cafe.id}_${i}`,
        cafeId: cafe.id,
        timestamp,
        timeBucket: timeBuckets[Math.floor(Math.random() * timeBuckets.length)],
        dayType: dayTypes[Math.floor(Math.random() * dayTypes.length)],
        noiseLevel: noise as NoiseLevel,
        tags: selectedTags,
        deviceAnonId: `device_${Math.floor(Math.random() * 100)}`,
      });
    }
  });
  
  return checkIns;
}

export const MOCK_CHECKINS = generateMockCheckIns();
