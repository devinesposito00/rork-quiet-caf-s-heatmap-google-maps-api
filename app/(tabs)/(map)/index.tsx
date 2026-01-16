import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { MapPin, List, X, Navigation } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import FilterBar from '@/components/FilterBar';
import CafeCard from '@/components/CafeCard';
import { CafeWithScore } from '@/types';
import { getScoreColor } from '@/utils/scoring';



const SF_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export default function MapScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const slideAnim = useRef(new Animated.Value(300)).current;
  
  const {
    cafesWithScores,
    settings,
    filters,
    setFilters,
    setUserLocation,
    toggleBookmark,
    isLoading,
  } = useApp();

  const [locationGranted, setLocationGranted] = useState(false);
  const [selectedCafe, setSelectedCafe] = useState<CafeWithScore | null>(null);
  const [showList, setShowList] = useState(Platform.OS === 'web');
  const [region, setRegion] = useState(SF_REGION);

  const requestLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationGranted(true);
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
    } catch (error) {
      console.log('Location error:', error);
    }
  }, [setUserLocation]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  useEffect(() => {
    if (selectedCafe) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 9,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 300,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedCafe, slideAnim]);

  const centerOnUser = useCallback(async () => {
    if (locationGranted) {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [locationGranted]);

  const handleMarkerPress = useCallback((cafe: CafeWithScore) => {
    setSelectedCafe(cafe);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    mapRef.current?.animateToRegion({
      latitude: cafe.latitude,
      longitude: cafe.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  }, []);

  const getMarkerColor = (score: number | null) => {
    const colorType = getScoreColor(score);
    return {
      quiet: Colors.quiet,
      medium: Colors.medium,
      loud: Colors.loud,
      unknown: Colors.textTertiary,
    }[colorType];
  };

  const getHeatmapColor = (score: number | null) => {
    const colorType = getScoreColor(score);
    return {
      quiet: 'rgba(74, 124, 89, 0.2)',
      medium: 'rgba(212, 165, 116, 0.2)',
      loud: 'rgba(199, 91, 57, 0.2)',
      unknown: 'rgba(156, 139, 120, 0.1)',
    }[colorType];
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading cafés...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FilterBar filters={filters} onFiltersChange={setFilters} />
      
      {!showList && Platform.OS !== 'web' ? (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={PROVIDER_DEFAULT}
            initialRegion={region}
            showsUserLocation={locationGranted}
            showsMyLocationButton={false}
            showsCompass={false}
          >
            {cafesWithScores.map((cafe) => (
              <React.Fragment key={cafe.id}>
                <Circle
                  center={{ latitude: cafe.latitude, longitude: cafe.longitude }}
                  radius={Math.min(300, 100 + cafe.sampleCount * 20)}
                  fillColor={getHeatmapColor(cafe.quietScore)}
                  strokeColor="transparent"
                />
                <Marker
                  coordinate={{ latitude: cafe.latitude, longitude: cafe.longitude }}
                  onPress={() => handleMarkerPress(cafe)}
                >
                  <View style={styles.markerContainer}>
                    <View
                      style={[
                        styles.marker,
                        { backgroundColor: getMarkerColor(cafe.quietScore) },
                        selectedCafe?.id === cafe.id && styles.markerSelected,
                      ]}
                    >
                      <Text style={styles.markerText}>
                        {cafe.quietScore !== null ? Math.round(cafe.quietScore) : '?'}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.markerArrow,
                        { borderTopColor: getMarkerColor(cafe.quietScore) },
                      ]}
                    />
                  </View>
                </Marker>
              </React.Fragment>
            ))}
          </MapView>

          <TouchableOpacity style={styles.locationButton} onPress={centerOnUser}>
            <Navigation size={20} color={Colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.listToggle}
            onPress={() => {
              setShowList(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <List size={20} color={Colors.text} />
            <Text style={styles.listToggleText}>List</Text>
          </TouchableOpacity>

          {selectedCafe && (
            <Animated.View
              style={[
                styles.bottomSheet,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedCafe(null)}
              >
                <X size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
              <CafeCard
                cafe={selectedCafe}
                units={settings.units}
                onPress={() => router.push(`/(tabs)/(map)/cafe/${selectedCafe.id}`)}
                onBookmark={() => toggleBookmark(selectedCafe.id)}
              />
              <TouchableOpacity
                style={styles.checkInButton}
                onPress={() => {
                  router.push({
                    pathname: '/(tabs)/checkin',
                    params: { cafeId: selectedCafe.id },
                  });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
              >
                <Text style={styles.checkInButtonText}>Check In</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      ) : (
        <View style={styles.listContainer}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>{cafesWithScores.length} Cafés</Text>
            {Platform.OS !== 'web' && (
              <TouchableOpacity
                style={styles.mapToggle}
                onPress={() => {
                  setShowList(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <MapPin size={20} color={Colors.text} />
                <Text style={styles.mapToggleText}>Map</Text>
              </TouchableOpacity>
            )}
          </View>
          <Animated.ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {cafesWithScores
              .sort((a, b) => {
                if (a.quietScore === null) return 1;
                if (b.quietScore === null) return -1;
                return b.quietScore - a.quietScore;
              })
              .map((cafe) => (
                <View key={cafe.id} style={styles.listItem}>
                  <CafeCard
                    cafe={cafe}
                    units={settings.units}
                    onPress={() => router.push(`/(tabs)/(map)/cafe/${cafe.id}`)}
                    onBookmark={() => toggleBookmark(cafe.id)}
                  />
                </View>
              ))}
          </Animated.ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  markerSelected: {
    transform: [{ scale: 1.15 }],
    borderWidth: 3,
  },
  markerText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  locationButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  listToggle: {
    position: 'absolute',
    left: 16,
    top: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    gap: 6,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  listToggleText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkInButton: {
    marginTop: 16,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkInButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  listContainer: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  mapToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.backgroundDark,
    gap: 6,
  },
  mapToggleText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  listItem: {
    marginBottom: 16,
  },
});
