import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Keyboard,
  LayoutAnimation,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
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
  reps: string;
};

export default function CreateRoutineScreen() {
  const router = useRouter();
  const [routineName, setRoutineName] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([
    { id: '1', name: '', sets: '', reps: '' },
  ]);

  const addExercise = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExercises([...exercises, {
      id: Date.now().toString(),
      name: '',
      sets: '',
      reps: '',
    }]);
  };

  const updateExercise = (id: string, field: keyof Exercise, value: string) => {
    setExercises(exercises.map(ex =>
      ex.id === id ? { ...ex, [field]: value } : ex
    ));
  };

  const removeExercise = (id: string) => {
    if (exercises.length > 1) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExercises(exercises.filter(ex => ex.id !== id));
    }
  };

  const isComplete = routineName && exercises.every(ex => ex.name && ex.sets && ex.reps);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>

        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveButton, !isComplete && styles.saveButtonDisabled]}
            onPress={() => isComplete && router.back()}
          >
            <Text style={styles.saveButtonText}>Save</Text>
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

          <Text style={styles.sectionTitle}>Exercises</Text>

          {exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseCard}>

              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseNumberBadge}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>
                <TextInput
                  style={styles.exerciseNameInput}
                  placeholder="Exercise name..."
                  placeholderTextColor="#4B5563"
                  value={exercise.name}
                  onChangeText={(value) => updateExercise(exercise.id, 'name', value)}
                />
                {exercises.length > 1 && (
                  <TouchableOpacity onPress={() => removeExercise(exercise.id)}>
                    <Text style={styles.removeText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Sets</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 4"
                    placeholderTextColor="#4B5563"
                    keyboardType="numeric"
                    value={exercise.sets}
                    onChangeText={(value) => updateExercise(exercise.id, 'sets', value)}
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.inputLabel}>Reps</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 10"
                    placeholderTextColor="#4B5563"
                    keyboardType="numeric"
                    value={exercise.reps}
                    onChangeText={(value) => updateExercise(exercise.id, 'reps', value)}
                  />
                </View>
              </View>

            </View>
          ))}

          <TouchableOpacity style={styles.addExerciseButton} onPress={addExercise}>
            <Text style={styles.addExerciseText}>+ Add exercise</Text>
          </TouchableOpacity>

        </ScrollView>

      </View>
    </TouchableWithoutFeedback>
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
  saveButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#1C2333',
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  routineNameInput: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#1C2333',
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6B7280',
    marginBottom: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
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
    padding: 12,
    borderRadius: 10,
    fontSize: 15,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#2D3748',
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
});