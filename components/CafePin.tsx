import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { getScoreColor } from '@/utils/scoring';

interface CafePinProps {
  score: number | null;
  isSelected?: boolean;
}

export default function CafePin({ score, isSelected }: CafePinProps) {
  const colorType = getScoreColor(score);
  
  const pinColor = {
    quiet: Colors.quiet,
    medium: Colors.medium,
    loud: Colors.loud,
    unknown: Colors.textTertiary,
  }[colorType];

  const label = score !== null ? Math.round(score) : '?';

  return (
    <View style={[styles.container, isSelected && styles.selected]}>
      <View style={[styles.pin, { backgroundColor: pinColor }]}>
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={[styles.arrow, { borderTopColor: pinColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  selected: {
    transform: [{ scale: 1.2 }],
  },
  pin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  label: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
});
