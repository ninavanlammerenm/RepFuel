import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useOnboarding } from '../../lib/OnboardingContext';

const days = Array.from({ length: 31 }, (_, i) => i + 1);
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

export default function AgeScreen() {
  const router = useRouter();
  const { setData } = useOnboarding();
  const [day, setDay] = useState<number | null>(null);
  const [month, setMonth] = useState<string | null>(null);
  const [year, setYear] = useState<number | null>(null);

  const isComplete = day && month && year;

  function handleContinue() {
    if (!isComplete) return;
    setData({ birthDate: `${day} ${month} ${year}` });
    router.push('/onboarding/height-weight');
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>When were{'\n'}you born?</Text>
        <Text style={styles.subtitle}>We use this to calculate your calories and daily targets.</Text>

        <View style={styles.pickerRow}>
          <View style={styles.pickerColumn}>
            <Text style={styles.pickerLabel}>Day</Text>
            <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
              {days.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.pickerItem, day === d && styles.pickerItemSelected]}
                  onPress={() => setDay(d)}
                >
                  <Text style={[styles.pickerText, day === d && styles.pickerTextSelected]}>{d}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.pickerColumn}>
            <Text style={styles.pickerLabel}>Month</Text>
            <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
              {months.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.pickerItem, month === m && styles.pickerItemSelected]}
                  onPress={() => setMonth(m)}
                >
                  <Text style={[styles.pickerText, month === m && styles.pickerTextSelected]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.pickerColumn}>
            <Text style={styles.pickerLabel}>Year</Text>
            <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
              {years.map((y) => (
                <TouchableOpacity
                  key={y}
                  style={[styles.pickerItem, year === y && styles.pickerItemSelected]}
                  onPress={() => setYear(y)}
                >
                  <Text style={[styles.pickerText, year === y && styles.pickerTextSelected]}>{y}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={[styles.continueButton, !isComplete && styles.buttonDisabled]}
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
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    color: '#9CA3AF',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },
  picker: {
    backgroundColor: '#374151',
    borderRadius: 12,
    height: 180,
  },
  pickerItem: {
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  pickerItemSelected: {
    backgroundColor: '#22C55E',
  },
  pickerText: {
    color: '#9CA3AF',
    fontSize: 15,
  },
  pickerTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
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