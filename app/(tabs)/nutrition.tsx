import { supabase } from '@/lib/supabase';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const TARGET_CALORIES = 2350;
const TARGET_PROTEIN = 180;
const TARGET_CARBS = 260;
const TARGET_FAT = 70;
const TARGET_WATER = 8;

const MEALS = [
  { id: 'Breakfast', label: 'Breakfast' },
  { id: 'Lunch', label: 'Lunch' },
  { id: 'Dinner', label: 'Dinner' },
  { id: 'Snacks', label: 'Snacks' },
];

type NutritionLog = {
  id: string;
  meal_type: string;
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  image_url?: string;
};

function ProgressBar({ current, target, color }: { current: number; target: number; color: string }) {
  const percentage = Math.min((current / target) * 100, 100);
  return (
    <View style={styles.progressBarBackground}>
      <View style={[styles.progressBarFill, { width: `${percentage}%` as any, backgroundColor: color }]} />
    </View>
  );
}

function MacroRing({ label, current, target, color }: { label: string; current: number; target: number; color: string }) {
  const size = 80;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(current / target, 1);
  const strokeDashoffset = circumference * (1 - percentage);

  return (
    <View style={styles.macroRingItem}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={{ position: 'absolute' }}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#2D3748"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.macroRingNumber, { color }]}>{current.toFixed(0)}</Text>
          <Text style={styles.macroRingUnit}>g</Text>
        </View>
      </View>
      <Text style={styles.macroRingLabel}>{label}</Text>
      <Text style={styles.macroRingTarget}>/ {target}g</Text>
    </View>
  );
}

function formatDateLabel(dateStr: string): string {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const todayStr = today.toISOString().split('T')[0];
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStr === todayStr) return 'Today';
  if (dateStr === yesterdayStr) return 'Yesterday';

  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export default function NutritionScreen() {
  const router = useRouter();
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [water, setWater] = useState(0);

  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(getDateString(today));

  useFocusEffect(
    useCallback(() => {
      fetchLogs(selectedDate);
    }, [selectedDate])
  );

  const fetchLogs = async (date: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('nutrition_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', date);

    if (!error && data) setLogs(data);
  };

  const goToPreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(getDateString(date));
    setWater(0);
  };

  const goToNextDay = () => {
    const todayStr = getDateString(today);
    if (selectedDate >= todayStr) return; // Niet verder dan vandaag
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(getDateString(date));
    setWater(0);
  };

  const isToday = selectedDate === getDateString(today);

  const totalCalories = logs.reduce((sum, l) => sum + (l.calories || 0), 0);
  const totalProtein = logs.reduce((sum, l) => sum + (l.protein || 0), 0);
  const totalCarbs = logs.reduce((sum, l) => sum + (l.carbs || 0), 0);
  const totalFat = logs.reduce((sum, l) => sum + (l.fat || 0), 0);

  const logsForMeal = (mealType: string) => logs.filter(l => l.meal_type === mealType);
  const caloriesForMeal = (mealType: string) =>
    logsForMeal(mealType).reduce((sum, l) => sum + (l.calories || 0), 0);

  const addWater = (index: number) => {
    if (index + 1 === water) {
      setWater(water - 1);
    } else {
      setWater(index + 1);
    }
  };

  const deleteLog = async (id: string) => {
    await supabase.from('nutrition_logs').delete().eq('id', id);
    fetchLogs(selectedDate);
  };

  const caloriesRemaining = TARGET_CALORIES - totalCalories;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>Nutrition</Text>

        {/* Datum navigator */}
        <View style={styles.dateNav}>
          <TouchableOpacity style={styles.dateNavArrow} onPress={goToPreviousDay}>
            <Text style={styles.dateNavArrowText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.dateNavLabel}>{formatDateLabel(selectedDate)}</Text>
          <TouchableOpacity
            style={[styles.dateNavArrow, isToday && styles.dateNavArrowDisabled]}
            onPress={goToNextDay}
            disabled={isToday}
          >
            <Text style={[styles.dateNavArrowText, isToday && styles.dateNavArrowTextDisabled]}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Calorie kaart */}
        <View style={styles.calorieCard}>
          <View style={styles.calorieTopRow}>
            <View style={styles.calorieBlock}>
              <Text style={styles.calorieBigNumber}>{totalCalories}</Text>
              <Text style={styles.calorieSubLabel}>eaten</Text>
            </View>
            <View style={styles.calorieDivider} />
            <View style={styles.calorieBlock}>
              <Text style={[styles.calorieBigNumber, { color: caloriesRemaining >= 0 ? '#22C55E' : '#F87171' }]}>
                {Math.abs(caloriesRemaining)}
              </Text>
              <Text style={styles.calorieSubLabel}>
                {caloriesRemaining >= 0 ? 'remaining' : 'over goal'}
              </Text>
            </View>
            <View style={styles.calorieDivider} />
            <View style={styles.calorieBlock}>
              <Text style={styles.calorieBigNumber}>{TARGET_CALORIES}</Text>
              <Text style={styles.calorieSubLabel}>goal</Text>
            </View>
          </View>
          <ProgressBar current={totalCalories} target={TARGET_CALORIES} color="#22C55E" />
        </View>

        {/* Macro cirkels */}
        <View style={styles.macroRingRow}>
          <MacroRing label="Protein" current={totalProtein} target={TARGET_PROTEIN} color="#34D399" />
          <MacroRing label="Carbs" current={totalCarbs} target={TARGET_CARBS} color="#A78BFA" />
          <MacroRing label="Fat" current={totalFat} target={TARGET_FAT} color="#FBBF24" />
        </View>

        {/* Water */}
        <View style={styles.waterCard}>
          <View style={styles.waterTitleRow}>
            <Text style={styles.waterTitle}>Water</Text>
            <Text style={styles.waterCount}>{water} / {TARGET_WATER} glasses</Text>
          </View>
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
          {water === TARGET_WATER && (
            <Text style={styles.waterDone}>Daily goal reached! 🎉</Text>
          )}
        </View>

        {/* Maaltijden */}
        <Text style={styles.sectionTitle}>Meals</Text>

        {MEALS.map((meal) => {
          const mealLogs = logsForMeal(meal.id);
          const mealCalories = caloriesForMeal(meal.id);

          return (
            <View key={meal.id} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealName}>{meal.label}</Text>
                <Text style={[styles.mealCalories, mealCalories > 0 && styles.mealCaloriesActive]}>
                  {mealCalories} kcal
                </Text>
              </View>

              {mealLogs.map((log) => (
                <View key={log.id} style={styles.foodRow}>
                  <View style={styles.foodImageWrapper}>
                    {log.image_url ? (
                      <Image source={{ uri: log.image_url }} style={styles.foodImage} />
                    ) : (
                      <View style={styles.foodImagePlaceholder}>
                        <Text style={styles.foodImagePlaceholderText}>
                          {log.food_name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.foodInfo}>
                    <Text style={styles.foodName} numberOfLines={1}>{log.food_name}</Text>
                    <View style={styles.foodMacroRow}>
                      <Text style={[styles.foodMacroTag, { color: '#22C55E' }]}>{log.calories} kcal</Text>
                      <Text style={styles.foodMacroDot}>·</Text>
                      <Text style={[styles.foodMacroTag, { color: '#34D399' }]}>P {log.protein}g</Text>
                      <Text style={styles.foodMacroDot}>·</Text>
                      <Text style={[styles.foodMacroTag, { color: '#A78BFA' }]}>C {log.carbs}g</Text>
                      <Text style={styles.foodMacroDot}>·</Text>
                      <Text style={[styles.foodMacroTag, { color: '#FBBF24' }]}>F {log.fat}g</Text>
                    </View>
                  </View>

                  <TouchableOpacity onPress={() => deleteLog(log.id)} style={styles.deleteButton}>
                    <Text style={styles.deleteText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}

              {/* Alleen + Add food tonen als het vandaag is */}
              {isToday && (
                <TouchableOpacity
                  style={styles.addFoodButton}
                  onPress={() => router.push(`/nutrition/add-food?meal=${meal.id}` as any)}
                >
                  <Text style={styles.addFoodText}>+ Add food</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117', paddingHorizontal: 20, paddingTop: 60 },
  title: { fontSize: 34, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 16, letterSpacing: 0.5 },

  // Datum navigator
  dateNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1C2333', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2D3748' },
  dateNavArrow: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  dateNavArrowDisabled: { opacity: 0.3 },
  dateNavArrowText: { color: '#FFFFFF', fontSize: 26, fontWeight: '300' },
  dateNavArrowTextDisabled: { color: '#4B5563' },
  dateNavLabel: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },

  // Calorie kaart
  calorieCard: { backgroundColor: '#1C2333', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#2D3748' },
  calorieTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  calorieBlock: { flex: 1, alignItems: 'center' },
  calorieBigNumber: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
  calorieSubLabel: { fontSize: 11, color: '#6B7280', textAlign: 'center', marginTop: 2 },
  calorieDivider: { width: 1, height: 40, backgroundColor: '#2D3748' },

  // Progress bar
  progressBarBackground: { height: 8, backgroundColor: '#2D3748', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: 8, borderRadius: 4 },

  // Macro ringen
  macroRingRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, gap: 10 },
  macroRingItem: { flex: 1, backgroundColor: '#1C2333', borderRadius: 16, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2D3748' },
  macroRingNumber: { fontSize: 15, fontWeight: 'bold' },
  macroRingUnit: { fontSize: 10, color: '#6B7280' },
  macroRingLabel: { fontSize: 12, fontWeight: 'bold', color: '#FFFFFF', marginTop: 8, marginBottom: 2 },
  macroRingTarget: { fontSize: 11, color: '#4B5563' },

  // Water
  waterCard: { backgroundColor: '#1C2333', borderRadius: 20, padding: 16, marginBottom: 24, borderWidth: 1, borderColor: '#2D3748' },
  waterTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  waterTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  waterCount: { fontSize: 13, color: '#6B7280' },
  waterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  waterGlass: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#2D3748', alignItems: 'center', justifyContent: 'center', opacity: 0.4 },
  waterGlassFilled: { backgroundColor: '#1D4ED8', opacity: 1 },
  waterIcon: { fontSize: 18 },
  waterDone: { color: '#22C55E', fontSize: 13, marginTop: 10, fontWeight: 'bold', textAlign: 'center' },

  // Maaltijden
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 12 },
  mealCard: { backgroundColor: '#1C2333', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2D3748' },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  mealName: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  mealCalories: { fontSize: 13, color: '#4B5563' },
  mealCaloriesActive: { color: '#22C55E' },

  // Food rij
  foodRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#2D3748', gap: 12 },
  foodImageWrapper: { width: 44, height: 44 },
  foodImage: { width: 44, height: 44, borderRadius: 10 },
  foodImagePlaceholder: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#22C55E22', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#22C55E44' },
  foodImagePlaceholderText: { color: '#22C55E', fontSize: 18, fontWeight: 'bold' },
  foodInfo: { flex: 1 },
  foodName: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  foodMacroRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  foodMacroTag: { fontSize: 11, fontWeight: '600' },
  foodMacroDot: { fontSize: 11, color: '#4B5563' },
  deleteButton: { padding: 4 },
  deleteText: { color: '#4B5563', fontSize: 14 },

  // Add food
  addFoodButton: { marginTop: 10, paddingVertical: 12, borderRadius: 10, borderWidth: 1, borderColor: '#2D3748', borderStyle: 'dashed', alignItems: 'center' },
  addFoodText: { color: '#6B7280', fontSize: 13 },
});