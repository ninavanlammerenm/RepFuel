import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const CATEGORY_OPTIONS = [
  'Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps', 'Core', 'Cardio'
];

const EQUIPMENT_OPTIONS = [
  'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Kettlebell', 'Bands'
];

export default function CreateExerciseScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [equipment, setEquipment] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Fill in a name first!');
      return;
    }

    setSaving(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        Alert.alert('Error', 'Not logged in');
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('exercises')
        .insert({
          name: name.trim(),
          muscle_group: category || 'Custom',
          category: equipment || 'Custom',
          user_id: user.id,
        });

      if (error) {
        Alert.alert('Error', error.message);
        setSaving(false);
        return;
      }

      setSaving(false);

      // Ga terug naar waar je vandaan kwam
      if (from === 'routine') {
        router.back();
      } else {
        router.back();
        router.back();
      }

    } catch (e) {
      Alert.alert('Something went wrong');
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>New Exercise</Text>
        <TouchableOpacity onPress={save}>
          <Text style={[styles.saveText, !name.trim() && styles.saveTextDisabled]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>NAME</Text>
      <View style={styles.formCard}>
        <TextInput
          style={styles.nameInput}
          placeholder="e.g. Bulgarian Split Squat"
          placeholderTextColor="#4B5563"
          value={name}
          onChangeText={setName}
          autoFocus
        />
      </View>

      <Text style={styles.sectionLabel}>MUSCLE GROUP</Text>
      <View style={styles.pillsCard}>
        {CATEGORY_OPTIONS.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.pill, category === cat && styles.pillActive]}
            onPress={() => setCategory(category === cat ? '' : cat)}
          >
            <Text style={[styles.pillText, category === cat && styles.pillTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>EQUIPMENT</Text>
      <View style={styles.pillsCard}>
        {EQUIPMENT_OPTIONS.map((eq) => (
          <TouchableOpacity
            key={eq}
            style={[styles.pill, equipment === eq && styles.pillActive]}
            onPress={() => setEquipment(equipment === eq ? '' : eq)}
          >
            <Text style={[styles.pillText, equipment === eq && styles.pillTextActive]}>
              {eq}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>💡 Tip</Text>
        <Text style={styles.tipText}>
          Custom exercises are only visible to you. They will appear in your personal library under the muscle group you choose.
        </Text>
      </View>

    </ScrollView>
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
    marginBottom: 32,
  },
  cancelText: { color: '#F87171', fontSize: 15, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  saveText: { color: '#22C55E', fontSize: 15, fontWeight: 'bold' },
  saveTextDisabled: { color: '#4B5563' },
  sectionLabel: {
    color: '#4B5563',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#1C2333',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  nameInput: {
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 16,
  },
  pillsCard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1C2333',
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  pillActive: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  pillText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  tipCard: {
    backgroundColor: '#1C2333',
    borderRadius: 16,
    padding: 16,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#2D3748',
  },
  tipTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  tipText: {
    color: '#6B7280',
    fontSize: 13,
    lineHeight: 20,
  },
});