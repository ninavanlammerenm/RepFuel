import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useOnboarding } from '../../lib/OnboardingContext';
import { supabase } from '../../lib/supabase';

const activityFactors: Record<string, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  extra: 1.9,
};

const goalAdjustments: Record<string, number> = {
  lose: -300,
  maintain: 0,
  gain: 300,
  recomp: 0,
};

function calculateTargets(data: any) {
  const weight = parseFloat(data.weight);
  const height = parseFloat(data.height);
  const activityFactor = activityFactors[data.activityLevel] ?? 1.55;
  const goalAdjustment = goalAdjustments[data.goal] ?? 0;

  const birthYear = parseInt(data.birthDate.split(' ')[2]);
  const age = new Date().getFullYear() - birthYear;

  let bmr = 0;

  if (data.bodyFat && parseFloat(data.bodyFat) > 0) {
    // Katch-McArdle (met lichaamsvet%)
    const bodyFatDecimal = parseFloat(data.bodyFat) / 100;
    const lbm = weight * (1 - bodyFatDecimal);
    bmr = 370 + 21.6 * lbm;
  } else {
    // Mifflin-St Jeor (zonder lichaamsvet%)
    if (data.gender === 'Male') {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }

  const tdee = bmr * activityFactor;
  const calories = Math.round(tdee + goalAdjustment);
  const protein = Math.round(weight * 2);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.round((calories - protein * 4 - fat * 9) / 4);

  return { calories, protein, carbs, fat };
}

export default function ResultsScreen() {
  const router = useRouter();
  const { data } = useOnboarding();
  const [loading, setLoading] = useState(false);
  const [targets, setTargets] = useState({ calories: 0, protein: 0, carbs: 0, fat: 0 });

  useEffect(() => {
    const result = calculateTargets(data);
    setTargets(result);
  }, []);

  async function handleFinish() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      Alert.alert('Fout', 'Niet ingelogd');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('profiles').upsert({
      user_id: userId,
      name: data.name,
      gender: data.gender,
      birth_date: data.birthDate,
      height: parseFloat(data.height),
      weight: parseFloat(data.weight),
      activity_level: data.activityLevel,
      goal: data.goal,
      daily_calories: targets.calories,
      daily_protein: targets.protein,
      daily_carbs: targets.carbs,
      daily_fat: targets.fat,
      body_fat: data.bodyFat ? parseFloat(data.bodyFat) : null,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Fout', error.message);
    } else {
      router.replace('/(tabs)');
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Your daily{'\n'}targets</Text>
        <Text style={styles.subtitle}>Based on your data, here's what you should aim for every day:</Text>

        {data.bodyFat && parseFloat(data.bodyFat) > 0 && (
          <Text style={styles.methodNote}>✓ Calculated using Katch-McArdle (body fat %)</Text>
        )}

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Calories</Text>
          <Text style={styles.cardValue}>{targets.calories} kcal</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Protein</Text>
          <Text style={styles.cardValue}>{targets.protein} g</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Carbs</Text>
          <Text style={styles.cardValue}>{targets.carbs} g</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Fat</Text>
          <Text style={styles.cardValue}>{targets.fat} g</Text>
        </View>

        <Text style={styles.note}>You can always adjust this later in your profile.</Text>
      </ScrollView>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.button}
          onPress={handleFinish}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Saving...' : "LET'S GO →"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 48,
  },
  content: {
    paddingBottom: 24,
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
    marginBottom: 16,
  },
  methodNote: {
    fontSize: 13,
    color: '#22C55E',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#22C55E',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  bottom: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
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
});