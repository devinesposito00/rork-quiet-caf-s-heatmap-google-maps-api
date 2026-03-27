import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Bookmark, Settings, ChevronRight, Shield, Bell, Ruler } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useApp, useBookmarkedCafes } from '@/contexts/AppContext';
import CafeCard from '@/components/CafeCard';

type TabType = 'saved' | 'settings';

export default function SavedSettingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('saved');
  const { settings, updateSettings, toggleBookmark } = useApp();
  const bookmarkedCafes = useBookmarkedCafes();

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {activeTab === 'saved' ? 'Saved Cafés' : 'Settings'}
          </Text>
        </View>

        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'saved' && styles.tabActive]}
            onPress={() => handleTabChange('saved')}
          >
            <Bookmark
              size={18}
              color={activeTab === 'saved' ? Colors.primary : Colors.textTertiary}
            />
            <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
              Saved
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'settings' && styles.tabActive]}
            onPress={() => handleTabChange('settings')}
          >
            <Settings
              size={18}
              color={activeTab === 'settings' ? Colors.primary : Colors.textTertiary}
            />
            <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'saved' ? (
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.savedContent}
            showsVerticalScrollIndicator={false}
          >
            {bookmarkedCafes.length === 0 ? (
              <View style={styles.emptyState}>
                <Bookmark size={48} color={Colors.textTertiary} />
                <Text style={styles.emptyTitle}>No saved cafés</Text>
                <Text style={styles.emptySubtitle}>
                  Tap the bookmark icon on any café to save it here
                </Text>
              </View>
            ) : (
              bookmarkedCafes.map((cafe) => (
                <View key={cafe.id} style={styles.cafeItem}>
                  <CafeCard
                    cafe={cafe}
                    units={settings.units}
                    onPress={() => router.push(`/(tabs)/(map)/cafe/${cafe.id}`)}
                    onBookmark={() => toggleBookmark(cafe.id)}
                  />
                </View>
              ))
            )}
          </ScrollView>
        ) : (
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Preferences</Text>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ruler size={20} color={Colors.textSecondary} />
                  <Text style={styles.settingLabel}>Distance Units</Text>
                </View>
                <View style={styles.segmentedControl}>
                  <TouchableOpacity
                    style={[
                      styles.segmentOption,
                      settings.units === 'mi' && styles.segmentOptionActive,
                    ]}
                    onPress={() => updateSettings({ units: 'mi' })}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        settings.units === 'mi' && styles.segmentTextActive,
                      ]}
                    >
                      Miles
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.segmentOption,
                      settings.units === 'km' && styles.segmentOptionActive,
                    ]}
                    onPress={() => updateSettings({ units: 'km' })}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        settings.units === 'km' && styles.segmentTextActive,
                      ]}
                    >
                      Kilometers
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Privacy</Text>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Shield size={20} color={Colors.textSecondary} />
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingLabel}>Share Check-ins Anonymously</Text>
                    <Text style={styles.settingDescription}>
                      Your check-ins help others find quiet spots
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.shareAnonymously}
                  onValueChange={(value) => updateSettings({ shareAnonymously: value })}
                  trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                  thumbColor={Colors.white}
                />
              </View>
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>Notifications</Text>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Bell size={20} color={Colors.textSecondary} />
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingLabel}>Quiet Hour Alerts</Text>
                    <Text style={styles.settingDescription}>
                      Get notified when cafés near you are quiet
                    </Text>
                  </View>
                </View>
                <Switch
                  value={settings.quietAlerts}
                  onValueChange={(value) => {
                    if (value) {
                      Alert.alert(
                        'Enable Notifications',
                        'We\'ll send you alerts when cafés near you report as quiet during your selected times.',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Enable',
                            onPress: () => updateSettings({ quietAlerts: true }),
                          },
                        ]
                      );
                    } else {
                      updateSettings({ quietAlerts: false });
                    }
                  }}
                  trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                  thumbColor={Colors.white}
                />
              </View>
            </View>

            <View style={styles.settingsSection}>
              <Text style={styles.settingsSectionTitle}>About</Text>

              <TouchableOpacity style={styles.settingItemLink}>
                <Text style={styles.settingLabel}>Privacy Policy</Text>
                <ChevronRight size={18} color={Colors.textTertiary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingItemLink}>
                <Text style={styles.settingLabel}>Terms of Service</Text>
                <ChevronRight size={18} color={Colors.textTertiary} />
              </TouchableOpacity>

              <View style={styles.versionInfo}>
                <Text style={styles.versionText}>Quiet Cafés v1.0.0</Text>
                <Text style={styles.versionSubtext}>
                  Made with ☕ for coffee lovers
                </Text>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: Colors.surface,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.backgroundDark,
    gap: 6,
  },
  tabActive: {
    backgroundColor: Colors.primaryLight + '20',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.textTertiary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  content: {
    flex: 1,
  },
  savedContent: {
    padding: 16,
  },
  cafeItem: {
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  settingsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  settingsSectionTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textTertiary,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  settingItemLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundDark,
    borderRadius: 8,
    padding: 3,
  },
  segmentOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  segmentOptionActive: {
    backgroundColor: Colors.surface,
  },
  segmentText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  segmentTextActive: {
    color: Colors.text,
    fontWeight: '500' as const,
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  versionSubtext: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
  },
});
