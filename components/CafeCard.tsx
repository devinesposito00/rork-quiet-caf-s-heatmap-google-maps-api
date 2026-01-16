import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { MapPin, Bookmark, ChevronRight } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { CafeWithScore, NOISE_ICONS } from '@/types';
import { getScoreLabel, getScoreColor, formatDistance } from '@/utils/scoring';

interface CafeCardProps {
  cafe: CafeWithScore;
  units: 'km' | 'mi';
  onPress: () => void;
  onBookmark: () => void;
  compact?: boolean;
}

export default function CafeCard({ cafe, units, onPress, onBookmark, compact }: CafeCardProps) {
  const scoreColor = getScoreColor(cafe.quietScore);
  const scoreLabel = getScoreLabel(cafe.quietScore);
  
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

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactContainer} onPress={onPress}>
        <View style={[styles.scoreBadgeCompact, { backgroundColor: bgColorMap[scoreColor] }]}>
          <Text style={[styles.scoreBadgeText, { color: colorMap[scoreColor] }]}>
            {cafe.quietScore !== null ? cafe.quietScore : '?'}
          </Text>
        </View>
        <View style={styles.compactInfo}>
          <Text style={styles.compactName} numberOfLines={1}>{cafe.name}</Text>
          {cafe.distance !== undefined && (
            <Text style={styles.compactDistance}>
              {formatDistance(cafe.distance, units)}
            </Text>
          )}
        </View>
        <ChevronRight size={18} color={Colors.textTertiary} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{ uri: cafe.imageUrl }}
        style={styles.image}
        contentFit="cover"
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={1}>{cafe.name}</Text>
            <View style={styles.locationRow}>
              <MapPin size={12} color={Colors.textTertiary} />
              <Text style={styles.address} numberOfLines={1}>{cafe.address}</Text>
            </View>
          </View>
          
          <TouchableOpacity onPress={onBookmark} style={styles.bookmarkButton}>
            <Bookmark
              size={22}
              color={cafe.isBookmarked ? Colors.primary : Colors.textTertiary}
              fill={cafe.isBookmarked ? Colors.primary : 'transparent'}
            />
          </TouchableOpacity>
        </View>
        
        <View style={styles.footer}>
          <View style={[styles.scoreBadge, { backgroundColor: bgColorMap[scoreColor] }]}>
            <Text style={styles.scoreEmoji}>
              {cafe.quietScore !== null
                ? NOISE_ICONS[cafe.quietScore >= 70 ? 0 : cafe.quietScore >= 40 ? 1 : 2]
                : '❓'}
            </Text>
            <Text style={[styles.scoreText, { color: colorMap[scoreColor] }]}>
              {scoreLabel}
            </Text>
            {cafe.quietScore !== null && (
              <Text style={[styles.scoreNumber, { color: colorMap[scoreColor] }]}>
                {cafe.quietScore}
              </Text>
            )}
          </View>
          
          <View style={styles.metaInfo}>
            {cafe.distance !== undefined && (
              <Text style={styles.distance}>{formatDistance(cafe.distance, units)}</Text>
            )}
            <Text style={styles.sampleCount}>
              {cafe.sampleCount} check-in{cafe.sampleCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 140,
  },
  content: {
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nameContainer: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  address: {
    fontSize: 13,
    color: Colors.textTertiary,
    flex: 1,
  },
  bookmarkButton: {
    padding: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  scoreEmoji: {
    fontSize: 14,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  scoreNumber: {
    fontSize: 13,
    fontWeight: '700' as const,
  },
  metaInfo: {
    alignItems: 'flex-end',
  },
  distance: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  sampleCount: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  scoreBadgeCompact: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreBadgeText: {
    fontSize: 15,
    fontWeight: '700' as const,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  compactDistance: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
