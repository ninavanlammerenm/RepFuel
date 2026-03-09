import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TARGET_CALORIES = 2350;
const CURRENT_CALORIES = 0;
const TARGET_PROTEIN = 180;
const CURRENT_PROTEIN = 0;
const TARGET_CARBS = 260;
const CURRENT_CARBS = 0;
const TARGET_FAT = 70;
const CURRENT_FAT = 0;
const TARGET_WATER = 8;

const meals = [
  { id: '1', name: 'Breakfast', calories: 0, icon: '🌅' },
  { id: '2', name: 'Lunch', calories: 0, icon: '☀️' },
  { id: '3', name: 'Dinner', calories: 0, icon: '🌙' },
  { id: '4', name: 'Snacks', calories: 0, icon: '🍎' },
];

function ProgressBar({ current, target, color }: { current: number; target: number; color: string }) {
  const percentage = Math.min((current / target) * 100, 100);
  return (
    <View style={styles.progressBarBackground}>
      <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
  );
}

export default function NutritionScreen() {
  const [water, setWater] = useState(0);

  const addWater = (index: number) => {
    if (index + 1 === water) {
      setWater(water - 1);
    } else {
      setWater(index + 1);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>Nutrition</Text>

        <View style={styles.calorieCard}>
          <View style={styles.calorieRow}>
            <Text style={styles.calorieLabel}>🔥 Calories</Text>
            <Text style={styles.calorieValue}>
              {CURRENT_CALORIES}
              <Text style={styles.calorieTarget}> / {TARGET_CALORIES} kcal</Text>
            </Text>
          </View>
          <ProgressBar current={CURRENT_CALORIES} target={TARGET_CALORIES} color="#22C55E" />
          <Text style={styles.calorieRemaining}>{TARGET_CALORIES - CURRENT_CALORIES} kcal remaining</Text>
        </View>

        <Text style={styles.sectionTitle}>Macros</Text>

        <View style={styles.macroCard}>
          <View style={styles.macroRow}>
            <Text style={styles.macroLabel}>🥩 Protein</Text>
            <Text style={styles.macroValue}>{CURRENT_PROTEIN}g <Text style={styles.macroTarget}>/ {TARGET_PROTEIN}g</Text></Text>
          </View>
          <ProgressBar current={CURRENT_PROTEIN} target={TARGET_PROTEIN} color="#22C55E" />

          <View style={[styles.macroRow, { marginTop: 16 }]}>
            <Text style={styles.macroLabel}>🍚 Carbs</Text>
            <Text style={styles.macroValue}>{CURRENT_CARBS}g <Text style={styles.macroTarget}>/ {TARGET_CARBS}g</Text></Text>
          </View>
          <ProgressBar current={CURRENT_CARBS} target={TARGET_CARBS} color="#3B82F6" />

          <View style={[styles.macroRow, { marginTop: 16 }]}>
            <Text style={styles.macroLabel}>🥑 Fat</Text>
            <Text style={styles.macroValue}>{CURRENT_FAT}g <Text style={styles.macroTarget}>/ {TARGET_FAT}g</Text></Text>
          </View>
          <ProgressBar current={CURRENT_FAT} target={TARGET_FAT} color="#F59E0B" />
        </View>

        <Text style={styles.sectionTitle}>Water 💧</Text>

        <View style={styles.waterCard}>
          <View style={styles.waterRow}>
            {Array.from({ length: TARGET_WATER }).map((_, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.waterGlass, i < water && styles.waterGlassFilled]}
                onPress={() => addWater(i)}
              >
                <Text style={styles.waterIcon}>💧</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.waterText}>{water} / {TARGET_WATER} glasses</Text>
          {water === TARGET_WATER && (
            <Text style={styles.waterDone}>🎉 Daily goal reached!</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Meals</Text>

        {meals.map((meal) => (
          <TouchableOpacity key={meal.id} style={styles.mealCard}>
            <View style={styles.mealLeft}>
              <Text style={styles.mealIcon}>{meal.icon}</Text>
              <View>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
              </View>
            </View>
            <Text style={styles.addText}>+ Add food</Text>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  calorieCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  calorieRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calorieLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  calorieValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22C55E',
  },
  calorieTarget: {
    color: '#9CA3AF',
    fontWeight: 'normal',
  },
  calorieRemaining: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'right',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  macroCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  macroLabel: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  macroValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  macroTarget: {
    color: '#9CA3AF',
    fontWeight: 'normal',
  },
  waterCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  waterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  waterGlass: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.4,
  },
  waterGlassFilled: {
    backgroundColor: '#1D4ED8',
    opacity: 1,
  },
  waterIcon: {
    fontSize: 20,
  },
  waterText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  waterDone: {
    color: '#22C55E',
    fontSize: 14,
    marginTop: 8,
    fontWeight: 'bold',
  },
  mealCard: {
    backgroundColor: '#1F2937',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mealLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mealIcon: {
    fontSize: 24,
  },
  mealName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  mealCalories: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  addText: {
    color: '#22C55E',
    fontSize: 14,
    fontWeight: 'bold',
  },
});