import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  LayoutAnimation,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

type Set = {
  id: string;
  weight: string;
  reps: string;
  done: boolean;
};

type Exercise = {
  id: string;
  name: string;
  sets: Set[];
};

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([
    { id: '1', name: 'Exercise 1', sets: [{ id: '1', weight: '', reps: '', done: false }] },
  ]);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [customTime, setCustomTime] = useState('');
  const [startTime] = useState(Date.now());
  const intervalRef = useRef<any>(null);
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (showTimer) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [showTimer]);

  useEffect(() => {
    if (timerActive) {
      intervalRef.current = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            setTimerActive(false);
            clearInterval(intervalRef.current);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerActive]);

  const startTimer = (seconds: number) => {
    clearInterval(intervalRef.current);
    setTimer(seconds);
    setTimerActive(true);
    setShowTimer(true);
  };

  const closeTimer = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowTimer(false);
      slideAnim.setValue(300);
    });
  };

  const skipTimer = () => {
    clearInterval(intervalRef.current);
    setTimerActive(false);
    setTimer(0);
    closeTimer();
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const addSet = (exerciseId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExercises(exercises.map(ex =>
      ex.id === exerciseId
        ? { ...ex, sets: [...ex.sets, { id: Date.now().toString(), weight: '', reps: '', done: false }] }
        : ex
    ));
  };

  const updateSet = (exerciseId: string, setId: string, field: 'weight' | 'reps', value: string) => {
    setExercises(exercises.map(ex =>
      ex.id === exerciseId
        ? { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s) }
        : ex
    ));
  };

  const toggleSet = (exerciseId: string, setId: string) => {
  setExercises(exercises.map(ex =>
      ex.id === exerciseId
        ? { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, done: !s.done } : s) }
        : ex
    ));
    startTimer(90);
  };

  const addExercise = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExercises([...exercises, {
      id: Date.now().toString(),
      name: `Exercise ${exercises.length + 1}`,
      sets: [{ id: Date.now().toString(), weight: '', reps: '', done: false }],
    }]);
  };

  const removeExercise = (exerciseId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  const updateExerciseName = (exerciseId: string, name: string) => {
    setExercises(exercises.map(ex =>
      ex.id === exerciseId ? { ...ex, name } : ex
    ));
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel workout',
      'Are you sure? Your workout will not be saved.',
      [
        { text: 'Keep going', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  const finishWorkout = async () => {
    const durationSeconds = Math.floor((Date.now() - startTime) / 1000);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        name: workoutName || 'Workout',
        duration_seconds: durationSeconds,
      })
      .select()
      .single();

    if (workoutError || !workout) {
      console.error('Error saving workout:', workoutError);
      return;
    }

    const exercisesToInsert = exercises.flatMap(ex =>
      ex.sets
        .filter(s => s.done)
        .map(s => ({
          workout_id: workout.id,
          name: ex.name,
          sets: ex.sets.filter(s => s.done).length,
          reps: parseInt(s.reps) || 0,
          weight: parseFloat(s.weight) || 0,
        }))
    );

    if (exercisesToInsert.length > 0) {
      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(exercisesToInsert);

      if (exercisesError) {
        console.error('Error saving exercises:', exercisesError);
      }
    }

    router.back();
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timerPill, timerActive && styles.timerPillActive]}
          onPress={() => setShowTimer(true)}
        >
          <Text style={styles.timerPillText}>
            {timerActive ? `⏱ ${formatTime(timer)}` : '⏱ Timer'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.finishButton} onPress={finishWorkout}>
          <Text style={styles.finishText}>Finish</Text>
        </TouchableOpacity>
      </View>

      {/* Workout naam */}
      <TextInput
        style={styles.workoutNameInput}
        placeholder="Workout name..."
        placeholderTextColor="#4B5563"
        value={workoutName}
        onChangeText={setWorkoutName}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {exercises.map((exercise, exerciseIndex) => (
          <View key={exercise.id} style={styles.exerciseCard}>

            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseNumberBadge}>
                <Text style={styles.exerciseNumberText}>{exerciseIndex + 1}</Text>
              </View>
              <TextInput
                style={styles.exerciseName}
                value={exercise.name}
                onChangeText={(value) => updateExerciseName(exercise.id, value)}
                placeholderTextColor="#4B5563"
              />
              <TouchableOpacity onPress={() => removeExercise(exercise.id)}>
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.setHeader}>
              <Text style={[styles.setHeaderText, { flex: 0.5 }]}>SET</Text>
              <Text style={styles.setHeaderText}>KG</Text>
              <Text style={styles.setHeaderText}>REPS</Text>
              <Text style={[styles.setHeaderText, { flex: 0.8 }]}>DONE</Text>
            </View>

            {exercise.sets.map((set, index) => (
              <View key={set.id} style={[styles.setRow, set.done && styles.setRowDone]}>
                <Text style={[styles.setNumber, { flex: 0.5 }]}>{index + 1}</Text>
                <TextInput
                  style={styles.setInput}
                  placeholder="0"
                  placeholderTextColor="#4B5563"
                  keyboardType="numeric"
                  value={set.weight}
                  onChangeText={(value) => updateSet(exercise.id, set.id, 'weight', value)}
                />
                <TextInput
                  style={styles.setInput}
                  placeholder="0"
                  placeholderTextColor="#4B5563"
                  keyboardType="numeric"
                  value={set.reps}
                  onChangeText={(value) => updateSet(exercise.id, set.id, 'reps', value)}
                />
                <TouchableOpacity
                  style={[styles.checkButton, set.done && styles.checkButtonDone, { flex: 0.8 }]}
                  onPress={() => toggleSet(exercise.id, set.id)}
                >
                  <Text style={styles.checkText}>✓</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addSetButton} onPress={() => addSet(exercise.id)}>
              <Text style={styles.addSetText}>+ Add set</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={styles.addExerciseButton} onPress={addExercise}>
          <Text style={styles.addExerciseText}>+ Add exercise</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Timer modal */}
      {showTimer && (
        <Modal transparent animationType="none">
          <TouchableOpacity style={styles.overlay} onPress={closeTimer} activeOpacity={1} />
          <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>

            <TouchableOpacity onPress={closeTimer} style={styles.dragHandleWrapper}>
              <View style={styles.dragHandle} />
            </TouchableOpacity>

            <Text style={styles.timerTitle}>Rest Timer</Text>
            <Text style={styles.timerDisplay}>{formatTime(timer)}</Text>

            <View style={styles.presetRow}>
              {[60, 90, 120, 180].map((sec) => (
                <TouchableOpacity
                  key={sec}
                  style={[styles.presetButton, timer === sec && timerActive && styles.presetButtonActive]}
                  onPress={() => startTimer(sec)}
                >
                  <Text style={styles.presetText}>{sec < 120 ? `${sec}s` : `${sec / 60}m`}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.customRow}>
              <TextInput
                style={styles.customInput}
                placeholder="Custom seconds..."
                placeholderTextColor="#4B5563"
                keyboardType="numeric"
                value={customTime}
                onChangeText={setCustomTime}
              />
              <TouchableOpacity
                style={styles.customButton}
                onPress={() => {
                  if (customTime) {
                    startTimer(parseInt(customTime));
                    setCustomTime('');
                  }
                }}
              >
                <Text style={styles.customButtonText}>Start</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.skipButton} onPress={skipTimer}>
              <Text style={styles.skipText}>Skip rest</Text>
            </TouchableOpacity>

          </Animated.View>
        </Modal>
      )}

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelText: {
    color: '#F87171',
    fontSize: 15,
    fontWeight: '600',
  },
  timerPill: {
    backgroundColor: '#1C2333',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  timerPillActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  timerPillText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  finishButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  finishText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  workoutNameInput: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1C2333',
    paddingBottom: 10,
  },
  exerciseCard: {
    backgroundColor: '#1C2333',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 10,
  },
  exerciseNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseNumberText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  exerciseName: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  removeText: {
    color: '#4B5563',
    fontSize: 16,
  },
  setHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  setHeaderText: {
    color: '#4B5563',
    fontSize: 11,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 2,
  },
  setRowDone: {
    opacity: 0.4,
  },
  setNumber: {
    color: '#6B7280',
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },
  setInput: {
    flex: 1,
    backgroundColor: '#0D1117',
    color: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 15,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  checkButton: {
    flex: 1,
    backgroundColor: '#0D1117',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  checkButtonDone: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  addSetButton: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D3748',
    borderStyle: 'dashed',
  },
  addSetText: {
    color: '#6B7280',
    fontSize: 13,
  },
  addExerciseButton: {
    borderWidth: 1,
    borderColor: '#2D3748',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 40,
  },
  addExerciseText: {
    color: '#6B7280',
    fontSize: 15,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1C2333',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
    borderTopWidth: 1,
    borderColor: '#2D3748',
  },
  dragHandleWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#2D3748',
    borderRadius: 2,
  },
  timerTitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  timerDisplay: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#22C55E',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 2,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  presetButton: {
    flex: 1,
    backgroundColor: '#0D1117',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  presetButtonActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  presetText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  customRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  customInput: {
    flex: 1,
    backgroundColor: '#0D1117',
    color: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  customButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
  },
  customButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  skipButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  skipText: {
    color: '#F87171',
    fontSize: 15,
  },
});