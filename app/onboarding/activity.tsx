import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const levels = [
  {
    id: 'sedentary',
    title: 'Sedentary',
    description: 'Little or no exercise. Mostly sitting during the day.',
  },
  {
    id: 'light',
    title: 'Lightly active',
    description: 'Light exercise 1–3 days per week.',
  },
  {
    id: 'moderate',
    title: 'Moderately active',
    description: 'Moderate exercise 3–5 days per week.',
  },
  {
    id: 'active',
    title: 'Very active',
    description: 'Hard exercise 6–7 days per week.',
  },
  {
    id: 'extra',
    title: 'Extra active',
    description: 'Very hard exercise or physical job every day.',
  },
];

export default function ActivityScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={styles.container}>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>How active{'\n'}are you?</Text>
        <Text style={styles.subtitle}>We use this to calculate your calories and daily targets.</Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {levels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[styles.optionButton, selected === level.id && styles.optionSelected]}
              onPress={() => setSelected(level.id)}
            >
              <Text style={styles.optionTitle}>{level.title}</Text>
              <Text style={styles.optionDescription}>{level.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.continueButton, !selected && styles.buttonDisabled]}
          onPress={() => selected && router.push('/onboarding/goal')}
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