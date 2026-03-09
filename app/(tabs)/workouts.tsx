import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const routines = [
  { id: '1', name: 'Push Day', exercises: 5 },
  { id: '2', name: 'Pull Day', exercises: 6 },
  { id: '3', name: 'Leg Day', exercises: 6 },
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

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/workouts/active-workout')}
          >
            <Text style={styles.startButtonText}>▶ Start workout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.routineButton}
            onPress={() => router.push('/workouts/create-routine')}
          >
            <Text style={styles.routineButtonText}>+ Create routine</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>My routines</Text>

        {routines.map((routine) => (
          <TouchableOpacity key={routine.id} style={styles.card}>
            <View>
              <Text style={styles.cardName}>{routine.name}</Text>
              <Text style={styles.cardMeta}>{routine.exercises} exercises</Text>
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  startButton: {
    flex: 1,
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  routineButton: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  routineButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  arrow: {
    color: '#22C55E',
    fontSize: 18,
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