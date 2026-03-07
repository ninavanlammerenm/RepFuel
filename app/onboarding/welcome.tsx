import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      <View style={styles.center}>
        <Text style={styles.title}>Welcome to{'\n'}RepFuel</Text>
        <Text style={styles.subtitle}>
          Let's set up your profile so we{'\n'}can calculate your goals.
        </Text>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/onboarding/gender')}
        >
          <Text style={styles.buttonText}>LET'S GET STARTED →</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Your data is private and only used to personalize your experience
        </Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingBottom: 48,
    paddingTop: 100,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    lineHeight: 24,
  },
  bottom: {
    alignItems: 'center',
    gap: 20,
  },
  button: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  footer: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
  },
});