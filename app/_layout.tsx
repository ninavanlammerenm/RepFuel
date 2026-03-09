import { Stack } from 'expo-router';
import 'react-native-url-polyfill/auto';
import { OnboardingProvider } from '../lib/OnboardingContext';

export default function Layout() {
  return (
    <OnboardingProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#111827' },
        }}
      />
    </OnboardingProvider>
  );
}