import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    LayoutAnimation,
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

type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
};

export default function WorkoutDetailScreen() {
  const router = useRouter();
  const { id, name: workoutName } = useLocalSearchParams();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedExercises, setEditedExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    fetchExercises();
    setEditedName(workoutName as string || 'Workout');
  }, []);

  const fetchExercises = async () => {
    const { data, error } = await supabase
      .from('workout_exercises')
      .select('*')
      .eq('workout_id', id);

    if (error) {
      console.error('Error fetching exercises:', error);
      return;
    }

    setExercises(data || []);
    setEditedExercises(data || []);
    setLoading(false);
  };

  const updateExercise = (exerciseId: string, field: keyof Exercise, value: string) => {
    setEditedExercises(editedExercises.map(ex =>
      ex.id === exerciseId ? { ...ex, [field]: field === 'name' ? value : parseFloat(value) || 0 } : ex
    ));
  };

  const removeExercise = (exerciseId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEditedExercises(editedExercises.filter(ex => ex.id !== exerciseId));
  };

  const addExercise = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setEditedExercises([...editedExercises, {
      id: Date.now().toString(),
      name: '',
      sets: 0,
      reps: 0,
      weight: 0,
    }]);
  };

  const saveChanges = async () => {
    const { error: nameError } = await supabase
      .from('workouts')
      .update({ name: editedName })
      .eq('id', id);

    if (nameError) {
      console.error('Error updating workout name:', nameError);
      return;
    }

    await supabase
      .from('workout_exercises')
      .delete()
      .eq('workout_id', id);

    if (editedExercises.length > 0) {
      const { error: exercisesError } = await supabase
        .from('workout_exercises')
        .insert(editedExercises.map(ex => ({
          workout_id: id,
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
        })));

      if (exercisesError) {
        console.error('Error saving exercises:', exercisesError);
        return;
      }
    }

    setExercises(editedExercises);
    setEditMode(false);
    Alert.alert('Saved!', 'Your workout has been updated.');
  };

  const cancelEdit = () => {
    setEditedExercises(exercises);
    setEditedName(workoutName as string || 'Workout');
    setEditMode(false);
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        {editMode ? (
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={cancelEdit}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={() => setEditMode(true)}>
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Titel */}
      {editMode ? (
        <TextInput
          style={styles.titleInput}
          value={editedName}
          onChangeText={setEditedName}
          placeholderTextColor="#4B5563"
        />
      ) : (
        <Text style={styles.title}>{workoutName || 'Workout'}</Text>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : editMode ? (
          <>
            {editedExercises.map((exercise, index) => (
              <View key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseNumberBadge}>
                    <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                  </View>
                  <TextInput
                    style={styles.exerciseNameInput}
                    value={exercise.name}
                    onChangeText={(value) => updateExercise(exercise.id, 'name', value)}
                    placeholder="Exercise name"
                    placeholderTextColor="#4B5563"
                  />
                  <TouchableOpacity onPress={() => removeExercise(exercise.id)}>
                    <Text style={styles.removeText}>✕</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.row}>
                  <View style={styles.statInput}>
                    <Text style={styles.inputLabel}>Sets</Text>
                    <TextInput
                      style={styles.input}
                      value={String(exercise.sets)}
                      onChangeText={(value) => updateExercise(exercise.id, 'sets', value)}
                      keyboardType="numeric"
                      placeholderTextColor="#4B5563"
                    />
                  </View>
                  <View style={styles.statInput}>
                    <Text style={styles.inputLabel}>Reps</Text>
                    <TextInput
                      style={styles.input}
                      value={String(exercise.reps)}
                      onChangeText={(value) => updateExercise(exercise.id, 'reps', value)}
                      keyboardType="numeric"
                      placeholderTextColor="#4B5563"
                    />
                  </View>
                  <View style={styles.statInput}>
                    <Text style={styles.inputLabel}>Weight (kg)</Text>
                    <TextInput
                      style={styles.input}
                      value={String(exercise.weight)}
                      onChangeText={(value) => updateExercise(exercise.id, 'weight', value)}
                      keyboardType="numeric"
                      placeholderTextColor="#4B5563"
                    />
                  </View>
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.addButton} onPress={addExercise}>
              <Text style={styles.addButtonText}>+ Add exercise</Text>
            </TouchableOpacity>
          </>
        ) : exercises.length === 0 ? (
          <Text style={styles.emptyText}>No exercises found.</Text>
        ) : (
          exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseNumberBadge}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
              </View>
              <View style={styles.statsRow}>
                <View style={styles.statBadge}>
                  <Text style={styles.statValue}>{exercise.sets}</Text>
                  <Text style={styles.statLabel}>Sets</Text>
                </View>
                <View style={styles.statBadge}>
                  <Text style={styles.statValue}>{exercise.reps}</Text>
                  <Text style={styles.statLabel}>Reps</Text>
                </View>
                <View style={styles.statBadge}>
                  <Text style={styles.statValue}>{exercise.weight} kg</Text>
                  <Text style={styles.statLabel}>Weight</Text>
                </View>
              </View>
            </View>
          ))
        )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    color: '#9CA3AF',
    fontSize: 15,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#F87171',
    fontSize: 15,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  editButton: {
    backgroundColor: '#1C2333',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  titleInput: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1C2333',
    paddingBottom: 10,
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  exerciseCard: {
    backgroundColor: '#1C2333',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
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
  exerciseNameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  removeText: {
    color: '#4B5563',
    fontSize: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBadge: {
    flex: 1,
    backgroundColor: '#0D1117',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  statInput: {
    flex: 1,
  },
  inputLabel: {
    color: '#4B5563',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0D1117',
    color: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    fontSize: 15,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  addButton: {
    borderWidth: 1,
    borderColor: '#2D3748',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginBottom: 40,
  },
  addButtonText: {
    color: '#6B7280',
    fontSize: 15,
  },
});