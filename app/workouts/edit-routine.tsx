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

type Exercise = {
  id: string;
  name: string;
  sets: string;
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

export default function EditRoutineScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  // Fix: zorg dat id altijd een string is
  const routineId = Array.isArray(params.id) ? params.id[0] : params.id as string;

  const [routineName, setRoutineName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);
  const [libraryExercises, setLibraryExercises] = useState<LibraryExercise[]>([]);
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const pickerAnim = useRef(new Animated.Value(800)).current;

  useEffect(() => {
    fetchLibraryExercises();
    loadRoutine();
  }, []);

  const loadRoutine = async () => {
    const { data: routine } = await supabase
      .from('routines')
      .select('name')
      .eq('id', routineId)
      .single();

    if (routine) setRoutineName(routine.name);

    const { data: routineExercises } = await supabase
      .from('routine_exercises')
      .select('*')
      .eq('routine_id', routineId);

    if (routineExercises) {
      const loaded: Exercise[] = routineExercises.map((ex) => ({
        id: ex.id,
        name: ex.name,
        sets: String(ex.sets),
        opacity: new Animated.Value(1),
      }));
      setExercises(loaded);
    }

    setLoading(false);
  };

  const fetchLibraryExercises = async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name', { ascending: true });
    if (!error && data) setLibraryExercises(data);
  };

  const openPicker = () => {
    setShowPicker(true);
    Animated.spring(pickerAnim, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  const closePicker = () => {
    Animated.timing(pickerAnim, {
      toValue: 800,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
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
        sets: '3',
        opacity: newOpacity,
      }]);
      Animated.timing(newOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 300);
  };

  const updateExercise = (id: string, field: 'sets' | 'name', value: string) => {
    setExercises(exercises.map(ex =>
      ex.id === id ? { ...ex, [field]: value } : ex
    ));
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const saveRoutine = async () => {
    if (!routineName.trim()) {
      Alert.alert('Give your routine a name first!');
      return;
    }
    if (exercises.length === 0) {
      Alert.alert('Add at least one exercise!');
      return;
    }

    setSaving(true);

    await supabase
      .from('routines')
      .update({ name: routineName })
      .eq('id', routineId);

    await supabase
      .from('routine_exercises')
      .delete()
      .eq('routine_id', routineId);

    const exercisesToInsert = exercises.map(ex => ({
      routine_id: routineId,
      name: ex.name,
      sets: parseInt(ex.sets) || 3,
      reps: 0,
    }));

    await supabase.from('routine_exercises').insert(exercisesToInsert);

    setSaving(false);
    router.back();
  };

  const deleteRoutine = () => {
    Alert.alert(
      'Delete routine',
      `Are you sure you want to delete "${routineName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await supabase
              .from('routines')
              .delete()
              .eq('id', routineId);
            router.back();
          },
        },
      ]
    );
  };

  const filteredExercises = libraryExercises.filter(ex => {
    const matchesGroup = selectedGroup === 'All' || ex.muscle_group === selectedGroup;
    const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Routine</Text>
        <TouchableOpacity style={styles.saveButton} onPress={saveRoutine}>
          <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.routineNameInput}
        placeholder="Routine name..."
        placeholderTextColor="#4B5563"
        value={routineName}
        onChangeText={setRoutineName}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {exercises.map((exercise, index) => (
          <Animated.View key={exercise.id} style={[styles.exerciseCard, { opacity: exercise.opacity }]}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseNumberBadge}>
                <Text style={styles.exerciseNumberText}>{index + 1}</Text>
              </View>
              <TextInput
                style={styles.exerciseName}
                value={exercise.name}
                onChangeText={(v) => updateExercise(exercise.id, 'name', v)}
                placeholderTextColor="#4B5563"
              />
              <TouchableOpacity onPress={() => removeExercise(exercise.id)}>
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.setsRow}>
              <Text style={styles.setsLabel}>SETS</Text>
              <TextInput
                style={styles.setsInput}
                value={exercise.sets}
                onChangeText={(v) => updateExercise(exercise.id, 'sets', v)}
                keyboardType="numeric"
                placeholderTextColor="#4B5563"
              />
            </View>
          </Animated.View>
        ))}

        <TouchableOpacity style={styles.addExerciseButton} onPress={openPicker}>
          <Text style={styles.addExerciseText}>+ Add exercise</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={deleteRoutine}>
          <Text style={styles.deleteButtonText}>Delete routine</Text>
        </TouchableOpacity>

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
                  setTimeout(() => router.push('/workouts/create-exercise?from=routine'), 350);
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

    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, backgroundColor: '#0D1117', alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#6B7280', fontSize: 16 },
  container: { flex: 1, backgroundColor: '#0D1117', paddingHorizontal: 20, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  cancelText: { color: '#F87171', fontSize: 15, fontWeight: '600', width: 60 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  saveButton: { backgroundColor: '#22C55E', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20 },
  saveText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  routineNameInput: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 24, borderBottomWidth: 1, borderBottomColor: '#1C2333', paddingBottom: 10 },
  exerciseCard: { backgroundColor: '#1C2333', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2D3748' },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 10 },
  exerciseNumberBadge: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#22C55E', alignItems: 'center', justifyContent: 'center' },
  exerciseNumberText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  exerciseName: { flex: 1, fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  removeText: { color: '#4B5563', fontSize: 16 },
  setsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0D1117', borderRadius: 12, borderWidth: 1, borderColor: '#2D3748', paddingVertical: 10, paddingHorizontal: 16, gap: 12 },
  setsLabel: { color: '#4B5563', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  setsInput: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', minWidth: 40 },
  addExerciseButton: { borderWidth: 1, borderColor: '#2D3748', borderStyle: 'dashed', borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 12 },
  addExerciseText: { color: '#6B7280', fontSize: 15 },
  deleteButton: { borderWidth: 1, borderColor: '#F87171', borderStyle: 'dashed', borderRadius: 16, padding: 18, alignItems: 'center', marginBottom: 40 },
  deleteButtonText: { color: '#F87171', fontSize: 15 },
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
});