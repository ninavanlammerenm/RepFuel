import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const recentWorkouts = [
  { id: '1', name: 'Push Day', date: 'Monday', exercises: 5, duration: '45 min' },
  { id: '2', name: 'Pull Day', date: 'Wednesday', exercises: 6, duration: '50 min' },
  { id: '3', name: 'Leg Day', date: 'Friday', exercises: 6, duration: '55 min' },
];

const personalRecords = [
  { exercise: 'Bench Press', weight: '100 kg', date: 'Feb 2026' },
  { exercise: 'Squat', weight: '140 kg', date: 'Jan 2026' },
  { exercise: 'Deadlift', weight: '160 kg', date: 'Mar 2026' },
];

export default function WorkoutsScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>Workouts</Text>

        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startButtonText}>+ Start workout</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Recent workouts</Text>

        {recentWorkouts.map((workout) => (
          <TouchableOpacity key={workout.id} style={styles.workoutCard}>
            <View style={styles.workoutLeft}>
              <Text style={styles.workoutName}>{workout.name}</Text>
              <Text style={styles.workoutMeta}>{workout.date} · {workout.exercises} exercises · {workout.duration}</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.sectionTitle}>Personal records 🏆</Text>

        {personalRecords.map((pr) => (
          <View key={pr.exercise} style={styles.prCard}>
            <View>
              <Text style={styles.prExercise}>{pr.exercise}</Text>
              <Text style={styles.prDate}>{pr.date}</Text>
            </View>
            <Text style={styles.prWeight}>{pr.weight}</Text>
          </View>
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
  startButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 32,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  workoutCard: {
    backgroundColor: '#1F2937',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workoutLeft: {
    flex: 1,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  workoutMeta: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  arrow: {
    color: '#22C55E',
    fontSize: 18,
    marginLeft: 12,
  },
  prCard: {
    backgroundColor: '#1F2937',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  prExercise: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  prDate: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  prWeight: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22C55E',
  },
});