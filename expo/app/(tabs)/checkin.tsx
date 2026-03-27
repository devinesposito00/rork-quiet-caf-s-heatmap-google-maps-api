import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Volume, Volume1, Volume2, Check, Search } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { NoiseLevel, CHECKIN_TAGS, NOISE_LABELS } from '@/types';

export default function CheckInScreen() {
  const { cafeId } = useLocalSearchParams<{ cafeId?: string }>();
  const router = useRouter();
  const { cafes, addCheckIn, isAddingCheckIn, canCheckIn, getTimeUntilNextCheckIn } = useApp();

  const [selectedCafeId, setSelectedCafeId] = useState<string | null>(cafeId || null);
  const [noiseLevel, setNoiseLevel] = useState<NoiseLevel | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedCafe = cafes.find((c) => c.id === selectedCafeId);
  
  const filteredCafes = cafes.filter((cafe) =>
    cafe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cafe.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canSubmit = selectedCafeId && noiseLevel !== null && canCheckIn(selectedCafeId);
  const waitTime = selectedCafeId ? getTimeUntilNextCheckIn(selectedCafeId) : 0;

  const formatWaitTime = (ms: number) => {
    const minutes = Math.ceil(ms / 60000);
    return `${minutes} min`;
  };

  const handleSubmit = () => {
    if (!canSubmit || !selectedCafeId || noiseLevel === null) return;

    addCheckIn({
      cafeId: selectedCafeId,
      noiseLevel,
      tags: selectedTags,
    });

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSuccess(true);
    
    setTimeout(() => {
      router.back();
    }, 1500);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const noiseLevelOptions: { level: NoiseLevel; icon: React.ReactNode; color: string; bgColor: string }[] = [
    { level: 0, icon: <Volume size={28} color={Colors.quiet} />, color: Colors.quiet, bgColor: Colors.quietBg },
    { level: 1, icon: <Volume1 size={28} color={Colors.medium} />, color: Colors.medium, bgColor: Colors.mediumBg },
    { level: 2, icon: <Volume2 size={28} color={Colors.loud} />, color: Colors.loud, bgColor: Colors.loudBg },
  ];

  if (showSuccess) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <Check size={48} color={Colors.quiet} />
        </View>
        <Text style={styles.successTitle}>Thanks for checking in!</Text>
        <Text style={styles.successSubtitle}>Your report helps others find quiet spots</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Check In', headerBackTitle: 'Back' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {!selectedCafe ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select a Café</Text>
            <View style={styles.searchContainer}>
              <Search size={20} color={Colors.textTertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search cafés..."
                placeholderTextColor={Colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <View style={styles.cafeList}>
              {filteredCafes.map((cafe) => (
                <TouchableOpacity
                  key={cafe.id}
                  style={styles.cafeItem}
                  onPress={() => {
                    setSelectedCafeId(cafe.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={styles.cafeName}>{cafe.name}</Text>
                  <Text style={styles.cafeAddress} numberOfLines={1}>{cafe.address}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <>
            <View style={styles.selectedCafeCard}>
              <Text style={styles.selectedCafeName}>{selectedCafe.name}</Text>
              <Text style={styles.selectedCafeAddress}>{selectedCafe.address}</Text>
              <TouchableOpacity
                style={styles.changeCafeButton}
                onPress={() => setSelectedCafeId(null)}
              >
                <Text style={styles.changeCafeText}>Change</Text>
              </TouchableOpacity>
            </View>

            {waitTime > 0 && (
              <View style={styles.waitNotice}>
                <Text style={styles.waitNoticeText}>
                  You can check in again in {formatWaitTime(waitTime)}
                </Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How is the noise level?</Text>
              <View style={styles.noiseLevelGrid}>
                {noiseLevelOptions.map((option) => (
                  <TouchableOpacity
                    key={option.level}
                    style={[
                      styles.noiseLevelOption,
                      { backgroundColor: option.bgColor },
                      noiseLevel === option.level && styles.noiseLevelSelected,
                      noiseLevel === option.level && { borderColor: option.color },
                    ]}
                    onPress={() => {
                      setNoiseLevel(option.level);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }}
                  >
                    {option.icon}
                    <Text style={[styles.noiseLevelLabel, { color: option.color }]}>
                      {NOISE_LABELS[option.level]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Add tags (optional)</Text>
              <View style={styles.tagsGrid}>
                {CHECKIN_TAGS.map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.tagOption,
                      selectedTags.includes(tag) && styles.tagSelected,
                    ]}
                    onPress={() => toggleTag(tag)}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        selectedTags.includes(tag) && styles.tagTextSelected,
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={!canSubmit || isAddingCheckIn}
            >
              <Text style={styles.submitButtonText}>
                {isAddingCheckIn ? 'Submitting...' : 'Submit Check-in'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 14,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: Colors.text,
  },
  cafeList: {
    gap: 8,
  },
  cafeItem: {
    backgroundColor: Colors.surface,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cafeName: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  cafeAddress: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  selectedCafeCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectedCafeName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  selectedCafeAddress: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  changeCafeButton: {
    alignSelf: 'flex-start',
  },
  changeCafeText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.primary,
  },
  waitNotice: {
    backgroundColor: Colors.mediumBg,
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  waitNoticeText: {
    fontSize: 14,
    color: Colors.medium,
    textAlign: 'center',
  },
  noiseLevelGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  noiseLevelOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  noiseLevelSelected: {
    borderWidth: 2,
  },
  noiseLevelLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginTop: 10,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagOption: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.backgroundDark,
  },
  tagSelected: {
    backgroundColor: Colors.primary,
  },
  tagText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  tagTextSelected: {
    color: Colors.white,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: Colors.textTertiary,
  },
  submitButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  successContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.quietBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
