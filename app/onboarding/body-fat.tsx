import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Keyboard, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useOnboarding } from '../../lib/OnboardingContext';

export default function BodyFatScreen() {
  const router = useRouter();
  const { setData } = useOnboarding();
  const [bodyFat, setBodyFat] = useState('');

  function handleContinue() {
    setData({ bodyFat: bodyFat || '0' });
    router.push('/onboarding/calculating');
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Body fat{'\n'}percentage</Text>
          <Text style={styles.subtitle}>
            If you know your body fat %, we can calculate your targets more accurately.{'\n\n'}
            Don't know it? No problem — just skip this step.
          </Text>

          <Text style={styles.label}>Body fat % (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 18"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            value={bodyFat}
            onChangeText={setBodyFat}
            maxLength={4}
          />
        </View>

        <View style={styles.bottom}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueText}>
              {bodyFat ? 'CONTINUE' : 'SKIP →'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.footer}>Your data is private and only used to personalize your experience</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 100,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
  },
  backText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 32,
    lineHeight: 24,
  },
  label: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    backgroundColor: '#374151',
    color: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    fontSize: 24,
    textAlign: 'center',
  },
  bottom: {
    alignItems: 'center',
    gap: 16,
  },
  continueButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  continueText: {
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