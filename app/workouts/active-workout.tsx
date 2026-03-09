import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  const [exercises, setExercises] = useState<Exercise[]>([
    { id: '1', name: 'Exercise 1', sets: [{ id: '1', weight: '', reps: '', done: false }] },
  ]);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [customTime, setCustomTime] = useState('');
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
    setExercises([...exercises, {
      id: Date.now().toString(),
      name: `Exercise ${exercises.length + 1}`,
      sets: [{ id: Date.now().toString(), weight: '', reps: '', done: false }],
    }]);
  };

  const updateExerciseName = (exerciseId: string, name: string) => {
    setExercises(exercises.map(ex =>
      ex.id === exerciseId ? { ...ex, name } : ex
    ));
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Workout</Text>
        <TouchableOpacity style={styles.finishButton} onPress={() => router.back()}>
          <Text style={styles.finishText}>Finish</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.timerPill, timerActive && styles.timerPillActive]}
        onPress={() => setShowTimer(true)}
      >
        <Text style={styles.timerPillText}>
          {timerActive ? `⏱ ${formatTime(timer)}` : '⏱ Start timer'}
        </Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {exercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <TextInput
              style={styles.exerciseName}
              value={exercise.name}
              onChangeText={(value) => updateExerciseName(exercise.id, value)}
              placeholderTextColor="#9CA3AF"
            />
            <View style={styles.setHeader}>
              <Text style={styles.setHeaderText}>SET</Text>
              <Text style={styles.setHeaderText}>KG</Text>
              <Text style={styles.setHeaderText}>REPS</Text>
              <Text style={styles.setHeaderText}>✓</Text>
            </View>
            {exercise.sets.map((set, index) => (
              <View key={set.id} style={[styles.setRow, set.done && styles.setRowDone]}>
                <Text style={styles.setNumber}>{index + 1}</Text>
                <TextInput
                  style={styles.setInput}
                  placeholder="0"
                  placeholderTextColor="#6B7280"
                  keyboardType="numeric"
                  value={set.weight}
                  onChangeText={(value) => updateSet(exercise.id, set.id, 'weight', value)}
                />
                <TextInput
                  style={styles.setInput}
                  placeholder="0"
                  placeholderTextColor="#6B7280"
                  keyboardType="numeric"
                  value={set.reps}
                  onChangeText={(value) => updateSet(exercise.id, set.id, 'reps', value)}
                />
                <TouchableOpacity
                  style={[styles.checkButton, set.done && styles.checkButtonDone]}
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
              {[60, 120, 180].map((sec) => (
                <TouchableOpacity
                  key={sec}
                  style={[styles.presetButton, timer === sec && timerActive && styles.presetButtonActive]}
                  onPress={() => startTimer(sec)}
                >
                  <Text style={styles.presetText}>{sec / 60} min</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.customRow}>
              <TextInput
                style={styles.customInput}
                placeholder="Custom seconds e.g. 45"
                placeholderTextColor="#6B7280"
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
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cancelText: {
    color: '#F87171',
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  finishButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  finishText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  timerPill: {
    backgroundColor: '#374151',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 16,
  },
  timerPillActive: {
    backgroundColor: '#22C55E',
  },
  timerPillText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  exerciseCard: {
    backgroundColor: '#1F2937',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22C55E',
    marginBottom: 16,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  setHeaderText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  setRowDone: {
    opacity: 0.5,
  },
  setNumber: {
    color: '#9CA3AF',
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },
  setInput: {
    flex: 1,
    backgroundColor: '#374151',
    color: '#FFFFFF',
    padding: 8,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
    marginHorizontal: 4,
  },
  checkButton: {
    flex: 1,
    backgroundColor: '#374151',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  checkButtonDone: {
    backgroundColor: '#22C55E',
  },
  checkText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  addSetButton: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 8,
  },
  addSetText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  addExerciseButton: {
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  addExerciseText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
  },
  dragHandleWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
  },
  timerTitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
  },
  timerDisplay: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#22C55E',
    textAlign: 'center',
    marginBottom: 24,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  presetButton: {
    flex: 1,
    backgroundColor: '#374151',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  presetButtonActive: {
    backgroundColor: '#22C55E',
  },
  presetText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  customRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  customInput: {
    flex: 1,
    backgroundColor: '#374151',
    color: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
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
    fontSize: 16,
  },
  skipButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  skipText: {
    color: '#F87171',
    fontSize: 16,
  },
});