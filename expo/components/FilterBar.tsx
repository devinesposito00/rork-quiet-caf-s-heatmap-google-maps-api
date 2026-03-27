import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Laptop } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { FilterState, TIME_BUCKETS, TimeBucket } from '@/types';

interface FilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export default function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {TIME_BUCKETS.map((bucket) => (
          <TouchableOpacity
            key={bucket.key}
            style={[
              styles.chip,
              filters.timeBucket === bucket.key && styles.chipActive,
            ]}
            onPress={() =>
              onFiltersChange({ ...filters, timeBucket: bucket.key as TimeBucket | 'now' })
            }
          >
            <Text
              style={[
                styles.chipText,
                filters.timeBucket === bucket.key && styles.chipTextActive,
              ]}
            >
              {bucket.label}
            </Text>
          </TouchableOpacity>
        ))}
        
        <View style={styles.divider} />
        
        <TouchableOpacity
          style={[
            styles.chip,
            filters.dayType === 'weekday' && styles.chipActive,
          ]}
          onPress={() =>
            onFiltersChange({
              ...filters,
              dayType: filters.dayType === 'weekday' ? 'all' : 'weekday',
            })
          }
        >
          <Text
            style={[
              styles.chipText,
              filters.dayType === 'weekday' && styles.chipTextActive,
            ]}
          >
            Weekday
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.chip,
            filters.dayType === 'weekend' && styles.chipActive,
          ]}
          onPress={() =>
            onFiltersChange({
              ...filters,
              dayType: filters.dayType === 'weekend' ? 'all' : 'weekend',
            })
          }
        >
          <Text
            style={[
              styles.chipText,
              filters.dayType === 'weekend' && styles.chipTextActive,
            ]}
          >
            Weekend
          </Text>
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        <TouchableOpacity
          style={[
            styles.chip,
            styles.iconChip,
            filters.laptopFriendly && styles.chipActive,
          ]}
          onPress={() =>
            onFiltersChange({ ...filters, laptopFriendly: !filters.laptopFriendly })
          }
        >
          <Laptop
            size={16}
            color={filters.laptopFriendly ? Colors.white : Colors.textSecondary}
          />
          <Text
            style={[
              styles.chipText,
              filters.laptopFriendly && styles.chipTextActive,
            ]}
          >
            Laptop
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundDark,
  },
  chipActive: {
    backgroundColor: Colors.primary,
  },
  iconChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.white,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
    marginHorizontal: 4,
  },
});
