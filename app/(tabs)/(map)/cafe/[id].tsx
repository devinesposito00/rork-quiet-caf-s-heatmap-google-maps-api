import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  MapPin,
  Bookmark,
  ExternalLink,
  Volume2,
  Wifi,
  Plug,
  Laptop,
  Users,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { TIME_BUCKETS, NOISE_LABELS, TimeBucket } from '@/types';
import { getScoreLabel, getScoreColor, formatDistance, calculateQuietScore } from '@/utils/scoring';

const TAG_ICONS: Record<string, React.ReactNode> = {
  'wifi ok': <Wifi size={14} color={Colors.textSecondary} />,
  'outlets': <Plug size={14} color={Colors.textSecondary} />,
  'good for laptop': <Laptop size={14} color={Colors.textSecondary} />,
  'crowded': <Users size={14} color={Colors.textSecondary} />,
};

export default function CafeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { cafesWithScores, toggleBookmark, getCheckInsForCafe, settings, canCheckIn } = useApp();

  const cafe = cafesWithScores.find((c) => c.id === id);
  const checkIns = getCheckInsForCafe(id || '');

  const trendData = useMemo(() => {
    const buckets: TimeBucket[] = ['morning', 'midday', 'afternoon', 'evening', 'late'];
    return buckets.map((bucket) => {
      const bucketCheckIns = checkIns.filter((c) => c.timeBucket === bucket);
      const score = calculateQuietScore(bucketCheckIns);
      return {
        bucket,
        label: TIME_BUCKETS.find((t) => t.key === bucket)?.label || bucket,
        score,
        count: bucketCheckIns.length,
      };
    });
  }, [checkIns]);

  const topTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    checkIns.forEach((c) => {
      c.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
  }, [checkIns]);

  const recentCheckIns = checkIns.slice(0, 20);

  if (!cafe) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Café not found</Text>
      </View>
    );
  }

  const openInMaps = () => {
    const url = Platform.select({
      ios: `maps:?q=${cafe.name}&ll=${cafe.latitude},${cafe.longitude}`,
      android: `geo:${cafe.latitude},${cafe.longitude}?q=${cafe.name}`,
      default: `https://maps.google.com/?q=${cafe.latitude},${cafe.longitude}`,
    });
    Linking.openURL(url);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const scoreColor = getScoreColor(cafe.quietScore);
  const colorMap = {
    quiet: Colors.quiet,
    medium: Colors.medium,
    loud: Colors.loud,
    unknown: Colors.textTertiary,
  };
  const bgColorMap = {
    quiet: Colors.quietBg,
    medium: Colors.mediumBg,
    loud: Colors.loudBg,
    unknown: Colors.backgroundDark,
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: cafe.name,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                toggleBookmark(cafe.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              style={styles.headerButton}
            >
              <Bookmark
                size={22}
                color={cafe.isBookmarked ? Colors.primary : Colors.textSecondary}
                fill={cafe.isBookmarked ? Colors.primary : 'transparent'}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Image source={{ uri: cafe.imageUrl }} style={styles.heroImage} contentFit="cover" />

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <Text style={styles.name}>{cafe.name}</Text>
              <TouchableOpacity style={styles.addressRow} onPress={openInMaps}>
                <MapPin size={14} color={Colors.textTertiary} />
                <Text style={styles.address}>{cafe.address}</Text>
                <ExternalLink size={12} color={Colors.primary} />
              </TouchableOpacity>
              {cafe.distance !== undefined && (
                <Text style={styles.distance}>{formatDistance(cafe.distance, settings.units)} away</Text>
              )}
            </View>

            <View style={[styles.scoreBadgeLarge, { backgroundColor: bgColorMap[scoreColor] }]}>
              <Text style={[styles.scoreNumber, { color: colorMap[scoreColor] }]}>
                {cafe.quietScore !== null ? cafe.quietScore : '?'}
              </Text>
              <Text style={[styles.scoreLabel, { color: colorMap[scoreColor] }]}>
                {getScoreLabel(cafe.quietScore)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.checkInButton, !canCheckIn(cafe.id) && styles.checkInButtonDisabled]}
            onPress={() => {
              if (canCheckIn(cafe.id)) {
                router.push({
                  pathname: '/(tabs)/checkin',
                  params: { cafeId: cafe.id },
                });
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
            }}
            disabled={!canCheckIn(cafe.id)}
          >
            <Volume2 size={20} color={Colors.white} />
            <Text style={styles.checkInButtonText}>
              {canCheckIn(cafe.id) ? 'Report Noise Level' : 'Check-in available soon'}
            </Text>
          </TouchableOpacity>

          {topTags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Tags</Text>
              <View style={styles.tagsContainer}>
                {topTags.map(({ tag, count }) => (
                  <View key={tag} style={styles.tagBadge}>
                    {TAG_ICONS[tag]}
                    <Text style={styles.tagText}>{tag}</Text>
                    <Text style={styles.tagCount}>{count}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quietness by Time</Text>
            <View style={styles.trendChart}>
              {trendData.map((item) => (
                <View key={item.bucket} style={styles.trendItem}>
                  <View style={styles.trendBarContainer}>
                    <View
                      style={[
                        styles.trendBar,
                        {
                          height: item.score !== null ? `${item.score}%` : '10%',
                          backgroundColor:
                            item.score !== null ? colorMap[getScoreColor(item.score)] : Colors.backgroundDark,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.trendLabel}>{item.label.slice(0, 3)}</Text>
                  <Text style={styles.trendScore}>
                    {item.score !== null ? item.score : '-'}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Check-ins ({recentCheckIns.length})</Text>
            {recentCheckIns.length === 0 ? (
              <Text style={styles.emptyText}>No check-ins yet. Be the first!</Text>
            ) : (
              <View style={styles.checkInsList}>
                {recentCheckIns.map((checkIn) => (
                  <View key={checkIn.id} style={styles.checkInItem}>
                    <View
                      style={[
                        styles.checkInLevel,
                        { backgroundColor: colorMap[getScoreColor(checkIn.noiseLevel === 0 ? 100 : checkIn.noiseLevel === 1 ? 50 : 0)] },
                      ]}
                    >
                      <Text style={styles.checkInLevelText}>
                        {NOISE_LABELS[checkIn.noiseLevel]}
                      </Text>
                    </View>
                    <View style={styles.checkInMeta}>
                      <Text style={styles.checkInTime}>{formatTime(checkIn.timestamp)}</Text>
                      <Text style={styles.checkInBucket}>
                        {TIME_BUCKETS.find((t) => t.key === checkIn.timeBucket)?.label} • {checkIn.dayType}
                      </Text>
                    </View>
                    {checkIn.tags.length > 0 && (
                      <View style={styles.checkInTags}>
                        {checkIn.tags.slice(0, 2).map((tag) => (
                          <Text key={tag} style={styles.checkInTag}>{tag}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  heroImage: {
    width: '100%',
    height: 220,
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  titleSection: {
    flex: 1,
    marginRight: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  distance: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginTop: 4,
  },
  scoreBadgeLarge: {
    width: 72,
    height: 72,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: '700' as const,
  },
  scoreLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    marginTop: 2,
  },
  headerButton: {
    padding: 8,
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: 24,
  },
  checkInButtonDisabled: {
    backgroundColor: Colors.textTertiary,
  },
  checkInButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.backgroundDark,
    borderRadius: 20,
    gap: 6,
  },
  tagText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  tagCount: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary,
    backgroundColor: Colors.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  trendChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  trendItem: {
    alignItems: 'center',
    flex: 1,
  },
  trendBarContainer: {
    height: 80,
    width: 32,
    backgroundColor: Colors.backgroundDark,
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  trendBar: {
    width: '100%',
    borderRadius: 8,
  },
  trendLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  trendScore: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  checkInsList: {
    gap: 10,
  },
  checkInItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  checkInLevel: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  checkInLevelText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  checkInMeta: {
    flex: 1,
  },
  checkInTime: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  checkInBucket: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  checkInTags: {
    flexDirection: 'row',
    gap: 4,
  },
  checkInTag: {
    fontSize: 10,
    color: Colors.textSecondary,
    backgroundColor: Colors.backgroundDark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 40,
  },
});
