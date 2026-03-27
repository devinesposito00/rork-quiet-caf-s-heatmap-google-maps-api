import { Stack } from 'expo-router';
import { Colors } from '@/constants/colors';

export default function MapLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Quiet Cafés',
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="cafe/[id]"
        options={{
          title: 'Café Details',
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
