import { supabase } from '@/lib/supabase';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Workout = {
  id: string;
  name: string;
  date: string;
  duration_seconds: number;
};

const routines = [
  { id: '1', name: 'Push Day', exercises: 5, color: '#22C55E' },
  { id: '2', name: 'Pull Day', exercises: 6, color: '#22C55E' },
  { id: '3', name: 'Leg Day', exercises: 6, color: '#22C55E' },
];

const personalRecords = [
  { exercise: 'Bench Press', weight: '100 kg', date: 'Feb 2026' },
  { exercise: 'Squat', weight: '140 kg', date: 'Jan 2026' },
  { exercise: 'Deadlift', weight: '160 kg', date: 'Mar 2026' },
];

export default function WorkoutsScreen() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchWorkouts();
    }, [])
  );

  const fetchWorkouts = async () => {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .order('date', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching workouts:', error);
      return;
    }

    setWorkouts(data || []);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>Workouts</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/workouts/active-workout')}
          >
            <Text style={styles.startButtonText}>▶  Start workout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.routineButton}
            onPress={() => router.push('/workouts/create-routine')}
          >
            <Text style={styles.routineButtonText}>+  New routine</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>My routines</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.routineScroll}>
          {routines.map((routine) => (
            <TouchableOpacity key={routine.id} style={[styles.routineCard, { borderTopColor: routine.color, borderTopWidth: 3 }]}>
              <Text style={styles.routineCardName}>{routine.name}</Text>
              <Text style={styles.routineCardMeta}>{routine.exercises} exercises</Text>
              <View style={[styles.startRoutineButton, { backgroundColor: routine.color }]}>
                <Text style={styles.startRoutineText}>Start</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Recent workouts</Text>

        {workouts.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No workouts yet</Text>
            <Text style={styles.emptySubText}>Start your first workout! 💪</Text>
          </View>
        ) : (
          workouts.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              style={styles.workoutCard}
              onPress={() => router.push(`/workouts/workout-detail?id=${workout.id}&name=${workout.name}`)}
            >
              <View>
                <Text style={styles.workoutName}>{workout.name}</Text>
                <Text style={styles.workoutMeta}>{formatDate(workout.date)}</Text>
              </View>
              <View style={styles.workoutRight}>
                <Text style={styles.workoutDuration}>{formatDuration(workout.duration_seconds)}</Text>
                <Text style={styles.arrow}>→</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

        <Text style={styles.sectionTitle}>Personal records 🏆</Text>

        {personalRecords.map((pr) => (
          <View key={pr.exercise} style={styles.prCard}>
            <View style={styles.prLeft}>
              <Text style={styles.prExercise}>{pr.exercise}</Text>
              <Text style={styles.prDate}>{pr.date}</Text>
            </View>
            <View style={styles.prBadge}>
              <Text style={styles.prWeight}>{pr.weight}</Text>
            </View>
          </View>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  startButton: {
    flex: 1,
    backgroundColor: '#22C55E',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  routineButton: {
    flex: 1,
    backgroundColor: '#1C2333',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D3748',
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
    marginBottom: 14,
  },
  routineScroll: {
    marginBottom: 32,
  },
  routineCard: {
    backgroundColor: '#1C2333',
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 140,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  routineCardName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  routineCardMeta: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
  },
  startRoutineButton: {
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  startRoutineText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  workoutCard: {
    backgroundColor: '#1C2333',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  workoutName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  workoutMeta: {
    fontSize: 12,
    color: '#6B7280',
  },
  workoutRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  workoutDuration: {
    fontSize: 13,
    color: '#22C55E',
    fontWeight: 'bold',
  },
  arrow: {
    color: '#6B7280',
    fontSize: 16,
  },
  emptyCard: {
    backgroundColor: '#1C2333',
    borderRadius: 16,
    padding: 32,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emptySubText: {
    color: '#6B7280',
    fontSize: 14,
  },
  prCard: {
    backgroundColor: '#1C2333',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  prLeft: {
    flex: 1,
  },
  prExercise: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  prDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  prBadge: {
    backgroundColor: '#0D1117',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  prWeight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#22C55E',
  },
});