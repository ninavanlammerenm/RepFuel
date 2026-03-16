import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  Platform,
  Pressable,
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
  opacity: Animated.Value;
};

type LibraryExercise = {
  id: string;
  name: string;
  muscle_group: string;
  category: string;
};

const MUSCLE_GROUPS = [
  'All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Cardio', 'Custom'
];

export default function ActiveWorkoutScreen() {
  const router = useRouter();
  const { routineId } = useLocalSearchParams();
  const [workoutName, setWorkoutName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [customTime, setCustomTime] = useState('');
  const [startTime] = useState(Date.now());
  const [libraryExercises, setLibraryExercises] = useState<LibraryExercise[]>([]);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const intervalRef = useRef<any>(null);
  const slideAnim = useRef(new Animated.Value(300)).current;
  const pickerAnim = useRef(new Animated.Value(800)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchLibraryExercises();
    if (routineId) {
      loadRoutine(routineId as string);
    } else {
      fadeAnim.setValue(1);
    }
  }, []);

  const fetchLibraryExercises = async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name', { ascending: true });
    if (!error && data) setLibraryExercises(data);
  };

  const loadRoutine = async (id: string) => {
    const { data: routine } = await supabase
      .from('routines').select('name').eq('id', id).single();
    if (routine) setWorkoutName(routine.name);

    const { data: routineExercises } = await supabase
      .from('routine_exercises').select('*').eq('routine_id', id);
    if (routineExercises) {
      const loaded: Exercise[] = routineExercises.map((ex) => ({
        id: Date.now().toString() + ex.id,
        name: ex.name,
        opacity: new Animated.Value(1),
        sets: Array.from({ length: ex.sets }, (_, i) => ({
          id: `${ex.id}-${i}`, weight: '', reps: String(ex.reps), done: false,
        })),
      }));
      setExercises(loaded);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    }
  };

  useEffect(() => {
    if (showTimer) {
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
  }, [showTimer]);

  useEffect(() => {
    if (timerActive) {
      intervalRef.current = setInterval(() => {
        setTimer(t => {
          if (t <= 1) { setTimerActive(false); clearInterval(intervalRef.current); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerActive]);

  const openPicker = () => {
    setShowPicker(true);
    Animated.spring(pickerAnim, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
  };

  const closePicker = () => {
    Animated.timing(pickerAnim, { toValue: 800, duration: 300, useNativeDriver: true })
      .start(() => {
        setShowPicker(false);
        setSearch('');
        setSelectedGroup('All');
      });
  };

  const handleSelectExercise = (exercise: LibraryExercise) => {
    closePicker();
    const newOpacity = new Animated.Value(0);
    setTimeout(() => {
      setExercises(prev => [...prev, {
        id: Date.now().toString(),
        name: exercise.name,
        opacity: newOpacity,
        sets: [{ id: Date.now().toString(), weight: '', reps: '', done: false }],
      }]);
      Animated.timing(newOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 300);
  };

  const startTimer = (seconds: number) => {
    clearInterval(intervalRef.current);
    setTimer(seconds);
    setTimerActive(true);
    setShowTimer(true);
  };

  const closeTimer = () => {
    Animated.timing(slideAnim, { toValue: 300, duration: 300, useNativeDriver: true })
      .start(() => { setShowTimer(false); slideAnim.setValue(300); });
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

  const removeExercise = (exerciseId: string) => {
    setExercises(exercises.filter(ex => ex.id !== exerciseId));
  };

  const updateExerciseName = (exerciseId: string, name: string) => {
    setExercises(exercises.map(ex => ex.id === exerciseId ? { ...ex, name } : ex));
  };

  const handleCancel = () => {
    Alert.alert('Cancel workout', 'Are you sure? Your workout will not be saved.', [
      { text: 'Keep going', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  const finishWorkout = async () => {
    const durationSeconds = Math.floor((Date.now() - startTime) / 1000);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: workout, error } = await supabase
      .from('workouts')
      .insert({ user_id: user.id, name: workoutName || 'Workout', duration_seconds: durationSeconds })
      .select().single();

    if (error || !workout) return;

    const toInsert = exercises.flatMap(ex =>
      ex.sets.filter(s => s.done).map(s => ({
        workout_id: workout.id,
        name: ex.name,
        sets: ex.sets.filter(s => s.done).length,
        reps: parseInt(s.reps) || 0,
        weight: parseFloat(s.weight) || 0,
      }))
    );

    if (toInsert.length > 0) await supabase.from('workout_exercises').insert(toInsert);
    router.back();
  };

  const filteredExercises = libraryExercises.filter(ex => {
    const matchesGroup = selectedGroup === 'All' || ex.muscle_group === selectedGroup;
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.timerPill, timerActive && styles.timerPillActive]}
          onPress={() => setShowTimer(true)}
        >
          <Text style={styles.timerPillText}>{timerActive ? `⏱ ${formatTime(timer)}` : '⏱ Timer'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.finishButton} onPress={finishWorkout}>
          <Text style={styles.finishText}>Finish</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.workoutNameInput}
        placeholder="Workout name..."
        placeholderTextColor="#4B5563"
        value={workoutName}
        onChangeText={setWorkoutName}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: routineId ? fadeAnim : 1 }}>
          {exercises.map((exercise, exerciseIndex) => (
            <Animated.View key={exercise.id} style={[styles.exerciseCard, { opacity: exercise.opacity }]}>
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
                    onChangeText={(v) => updateSet(exercise.id, set.id, 'weight', v)}
                  />
                  <TextInput
                    style={styles.setInput}
                    placeholder="0"
                    placeholderTextColor="#4B5563"
                    keyboardType="numeric"
                    value={set.reps}
                    onChangeText={(v) => updateSet(exercise.id, set.id, 'reps', v)}
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
            </Animated.View>
          ))}

          <TouchableOpacity style={styles.addExerciseButton} onPress={openPicker}>
            <Text style={styles.addExerciseText}>+ Add exercise</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Exercise Picker Modal */}
      {showPicker && (
        <Modal transparent animationType="none" onRequestClose={closePicker}>
          <View style={styles.modalWrapper}>
            <Pressable style={styles.overlay} onPress={closePicker} />
            <Animated.View style={[styles.pickerSheet, { transform: [{ translateY: pickerAnim }] }]}>
              <TouchableOpacity onPress={closePicker} style={styles.dragHandleWrapper}>
                <View style={styles.dragHandle} />
              </TouchableOpacity>
              <Text style={styles.pickerTitle}>Add Exercise</Text>

              <TouchableOpacity
                style={styles.createOwnButton}
                onPress={() => {
                  closePicker();
                  setTimeout(() => router.push('/workouts/create-exercise'), 350);
                }}
              >
                <Text style={styles.createOwnButtonText}>+ Create your own exercise</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.searchInput}
                placeholder="Search exercises..."
                placeholderTextColor="#4B5563"
                value={search}
                onChangeText={setSearch}
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.groupScroll}
                contentContainerStyle={styles.groupContent}
              >
                {MUSCLE_GROUPS.map((group) => (
                  <TouchableOpacity
                    key={group}
                    style={[styles.groupPill, selectedGroup === group && styles.groupPillActive]}
                    onPress={() => setSelectedGroup(group)}
                  >
                    <Text style={[styles.groupPillText, selectedGroup === group && styles.groupPillTextActive]}>
                      {group}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {filteredExercises.map((item) => (
                  <Pressable
                    key={item.id}
                    style={({ pressed }) => [styles.exerciseRow, pressed && styles.exerciseRowPressed]}
                    onPress={() => handleSelectExercise(item)}
                  >
                    <View style={styles.exerciseRowLeft}>
                      <Text style={styles.exerciseRowName}>{item.name}</Text>
                      <Text style={styles.exerciseRowMeta}>{item.muscle_group} · {item.category}</Text>
                    </View>
                    <View style={styles.exerciseRowPlusBadge}>
                      <Text style={styles.exerciseRowPlus}>+</Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </Animated.View>
          </View>
        </Modal>
      )}

      {/* Timer Modal */}
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
                onPress={() => { if (customTime) { startTimer(parseInt(customTime)); setCustomTime(''); } }}
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
  container: { flex: 1, backgroundColor: '#0D1117', paddingHorizontal: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cancelText: { color: '#F87171', fontSize: 15, fontWeight: '600' },
  timerPill: { backgroundColor: '#1C2333', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, borderColor: '#2D3748' },
  timerPillActive: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  timerPillText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  finishButton: { backgroundColor: '#22C55E', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 },
  finishText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  workoutNameInput: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#1C2333', paddingBottom: 10 },
  exerciseCard: { backgroundColor: '#1C2333', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2D3748' },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 10 },
  exerciseNumberBadge: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center' },
  exerciseNumberText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  exerciseName: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  removeText: { color: '#4B5563', fontSize: 16 },
  setHeader: { flexDirection: 'row', marginBottom: 8, paddingHorizontal: 4 },
  setHeaderText: { color: '#4B5563', fontSize: 11, fontWeight: 'bold', flex: 1, textAlign: 'center', letterSpacing: 0.5 },
  setRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingVertical: 2 },
  setRowDone: { opacity: 0.4 },
  setNumber: { color: '#6B7280', fontSize: 14, flex: 1, textAlign: 'center' },
  setInput: { flex: 1, backgroundColor: '#0D1117', color: '#FFFFFF', padding: 8, borderRadius: 8, textAlign: 'center', fontSize: 15, marginHorizontal: 4, borderWidth: 1, borderColor: '#2D3748' },
  checkButton: { flex: 1, backgroundColor: '#0D1117', padding: 8, borderRadius: 8, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: '#2D3748' },
  checkButtonDone: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  checkText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  addSetButton: { marginTop: 8, alignItems: 'center', paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#2D3748', borderStyle: 'dashed' },
  addSetText: { color: '#6B7280', fontSize: 13 },
  addExerciseButton: { borderWidth: 1, borderColor: '#2D3748', borderStyle: 'dashed', borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 40 },
  addExerciseText: { color: '#6B7280', fontSize: 15 },
  modalWrapper: { flex: 1, justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  pickerSheet: { height: '85%', backgroundColor: '#1C2333', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 40, borderTopWidth: 1, borderColor: '#2D3748' },
  dragHandleWrapper: { alignItems: 'center', marginBottom: 20 },
  dragHandle: { width: 40, height: 4, backgroundColor: '#2D3748', borderRadius: 2 },
  pickerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', marginBottom: 16 },
  createOwnButton: { backgroundColor: '#0D1117', borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#22C55E' },
  createOwnButtonText: { color: '#22C55E', fontSize: 14, fontWeight: '600' },
  searchInput: { backgroundColor: '#0D1117', borderRadius: 12, padding: 14, color: '#FFFFFF', fontSize: 15, borderWidth: 1, borderColor: '#2D3748', marginBottom: 12 },
  groupScroll: { marginBottom: 12, flexGrow: 0, flexShrink: 0 },
  groupContent: { gap: 8, paddingRight: 20 },
  groupPill: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#0D1117', borderWidth: 1, borderColor: '#2D3748', alignSelf: 'flex-start', height: 38, justifyContent: 'center' },
  groupPillActive: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  groupPillText: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
  groupPillTextActive: { color: '#FFFFFF' },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#0D1117' },
  exerciseRowPressed: { backgroundColor: '#2D3748', borderRadius: 10 },
  exerciseRowLeft: { flex: 1 },
  exerciseRowName: { fontSize: 15, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
  exerciseRowMeta: { fontSize: 12, color: '#6B7280' },
  exerciseRowPlusBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#0D1117', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2D3748' },
  exerciseRowPlus: { color: '#22C55E', fontSize: 18, fontWeight: 'bold' },
  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1C2333', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 48, borderTopWidth: 1, borderColor: '#2D3748' },
  timerTitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' },
  timerDisplay: { fontSize: 72, fontWeight: 'bold', color: '#22C55E', textAlign: 'center', marginBottom: 24, letterSpacing: 2 },
  presetRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  presetButton: { flex: 1, backgroundColor: '#0D1117', paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#2D3748' },
  presetButtonActive: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  presetText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
  customRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  customInput: { flex: 1, backgroundColor: '#0D1117', color: '#FFFFFF', padding: 14, borderRadius: 12, fontSize: 15, borderWidth: 1, borderColor: '#2D3748' },
  customButton: { backgroundColor: '#22C55E', paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center' },
  customButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
  skipButton: { paddingVertical: 14, alignItems: 'center' },
  skipText: { color: '#F87171', fontSize: 15 },
});