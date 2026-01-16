import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { getScoreColor } from '@/utils/scoring';

interface HeatmapCircleProps {
  score: number | null;
  sampleCount: number;
}

export default function HeatmapCircle({ score, sampleCount }: HeatmapCircleProps) {
  const colorType = getScoreColor(score);
  
  const baseColor = {
    quiet: Colors.quiet,
    medium: Colors.medium,
    loud: Colors.loud,
    unknown: Colors.textTertiary,
  }[colorType];

  const size = Math.min(120, 40 + sampleCount * 8);
  const opacity = Math.min(0.4, 0.15 + sampleCount * 0.025);

  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: baseColor,
          opacity,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  circle: {
    position: 'absolute',
  },
});
