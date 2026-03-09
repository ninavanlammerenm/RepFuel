import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

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
      setExercises(exercises.filter(ex => ex.id !== id));
    }
  };

  const isComplete = routineName && exercises.every(ex => ex.name && ex.sets && ex.reps);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create routine</Text>

        <ScrollView showsVerticalScrollIndicator={false}>

          <Text style={styles.label}>Routine name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Push Day"
            placeholderTextColor="#9CA3AF"
            value={routineName}
            onChangeText={setRoutineName}
          />

          <Text style={styles.sectionTitle}>Exercises</Text>

          {exercises.map((exercise, index) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseNumber}>Exercise {index + 1}</Text>
                {exercises.length > 1 && (
                  <TouchableOpacity onPress={() => removeExercise(exercise.id)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Exercise name (e.g. Bench Press)"
                placeholderTextColor="#9CA3AF"
                value={exercise.name}
                onChangeText={(value) => updateExercise(exercise.id, 'name', value)}
              />

              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Sets</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 4"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={exercise.sets}
                    onChangeText={(value) => updateExercise(exercise.id, 'sets', value)}
                  />
                </View>
                <View style={styles.halfInput}>
                  <Text style={styles.label}>Reps</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 10"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="numeric"
                    value={exercise.reps}
                    onChangeText={(value) => updateExercise(exercise.id, 'reps', value)}
                  />
                </View>
              </View>

            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={addExercise}>
            <Text style={styles.addButtonText}>+ Add exercise</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, !isComplete && styles.buttonDisabled]}
            onPress={() => isComplete && router.back()}
          >
            <Text style={styles.saveButtonText}>Save routine</Text>
          </TouchableOpacity>

        </ScrollView>

      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  backButton: {
    marginBottom: 16,
  },
  backText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  label: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    backgroundColor: '#1F2937',
    color: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 8,
  },
  exerciseCard: {
    backgroundColor: '#1F2937',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseNumber: {
    color: '#22C55E',
    fontSize: 14,
    fontWeight: 'bold',
  },
  removeText: {
    color: '#F87171',
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  addButton: {
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonDisabled: {
    backgroundColor: '#6B7280',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});