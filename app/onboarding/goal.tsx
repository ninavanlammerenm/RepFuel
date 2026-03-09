import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useOnboarding } from '../../lib/OnboardingContext';

const goals = [
  {
    id: 'lose',
    title: 'Lose weight',
    description: 'Reduce body fat and slim down.',
  },
  {
    id: 'maintain',
    title: 'Maintain weight',
    description: 'Stay at your current weight.',
  },
  {
    id: 'gain',
    title: 'Gain muscle',
    description: 'Build muscle mass and strength.',
  },
  {
    id: 'recomp',
    title: 'Recomp',
    description: 'Reduce body fat while building muscle.',
  },
];

export default function GoalScreen() {
  const router = useRouter();
  const { setData } = useOnboarding();
  const [selected, setSelected] = useState<string | null>(null);

  function handleContinue() {
    if (!selected) return;
    setData({ goal: selected });
    router.push('/onboarding/calculating');
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>What's your{'\n'}goal?</Text>
        <Text style={styles.subtitle}>Choose your main focus so we can adjust your calorie targets.</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[styles.optionButton, selected === goal.id && styles.optionSelected]}
              onPress={() => setSelected(goal.id)}
            >
              <Text style={styles.optionTitle}>{goal.title}</Text>
              <Text style={styles.optionDescription}>{goal.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.continueButton, !selected && styles.buttonDisabled]}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>CONTINUE</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Your data is private and only used to personalize your experience</Text>
      </View>
    </View>
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
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: '#374151',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: '#22C55E',
  },
  optionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  optionDescription: {
    color: '#9CA3AF',
    fontSize: 14,
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
  buttonDisabled: {
    backgroundColor: '#6B7280',
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