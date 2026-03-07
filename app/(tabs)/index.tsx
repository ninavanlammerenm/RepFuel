import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TARGET_CALORIES = 2350;
const CURRENT_CALORIES = 1420;

const TARGET_PROTEIN = 180;
const CURRENT_PROTEIN = 90;

const TARGET_CARBS = 260;
const CURRENT_CARBS = 160;

const TARGET_FAT = 70;
const CURRENT_FAT = 35;

function ProgressBar({ current, target, color }: { current: number; target: number; color: string }) {
  const percentage = Math.min((current / target) * 100, 100);
  return (
    <View style={styles.progressBarBackground}>
      <View style={[styles.progressBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
    </View>
  );
}

function MacroCard({ emoji, label, current, target, color }: {
  emoji: string;
  label: string;
  current: number;
  target: number;
  color: string;
}) {
  return (
    <View style={styles.macroCard}>
      <Text style={styles.macroEmoji}>{emoji}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>{current}<Text style={styles.macroTarget}>/{target}g</Text></Text>
      <ProgressBar current={current} target={target} color={color} />
    </View>
  );
}

export default function HomeScreen() {
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning 🌤️';
    if (hour < 18) return 'Good afternoon ☀️';
    return 'Good evening 🌙';
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.name}>RepFuel</Text>
            <Text style={styles.date}>{today}</Text>
          </View>
        </View>

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

        <View style={styles.macroRow}>
          <MacroCard emoji="🥩" label="Protein" current={CURRENT_PROTEIN} target={TARGET_PROTEIN} color="#22C55E" />
          <MacroCard emoji="🍚" label="Carbs" current={CURRENT_CARBS} target={TARGET_CARBS} color="#3B82F6" />
          <MacroCard emoji="🥑" label="Fat" current={CURRENT_FAT} target={TARGET_FAT} color="#F59E0B" />
        </View>

        <Text style={styles.sectionTitle}>Today's workout</Text>

        <TouchableOpacity style={styles.workoutCard}>
          <Text style={styles.workoutTitle}>No workout planned</Text>
          <Text style={styles.workoutSubtitle}>Tap to add a workout →</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Your progress</Text>

        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Current weight</Text>
            <Text style={styles.progressValue}>75 kg</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Workouts this week</Text>
            <Text style={styles.progressValue}>0 / 4</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Streak</Text>
            <Text style={styles.progressValue}>🔥 0 days</Text>
          </View>
        </View>

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
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
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
  macroRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  macroEmoji: {
    fontSize: 20,
  },
  macroLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  macroTarget: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: 'normal',
  },
  workoutCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
  workoutSubtitle: {
    fontSize: 14,
    color: '#22C55E',
    marginTop: 4,
  },
  progressCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  progressLabel: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  progressValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  divider: {
    height: 1,
    backgroundColor: '#374151',
  },
});