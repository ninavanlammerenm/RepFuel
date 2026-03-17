import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

const MEAL_OPTIONS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

export default function FoodDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const isManual = params.manual === '1';
  const name = Array.isArray(params.name) ? params.name[0] : params.name as string || '';
  const brand = Array.isArray(params.brand) ? params.brand[0] : params.brand as string || '';
  const imageUrl = Array.isArray(params.imageUrl) ? params.imageUrl[0] : params.imageUrl as string || '';
  const baseMeal = Array.isArray(params.meal) ? params.meal[0] : params.meal as string || 'Breakfast';

  const baseCalories = parseFloat(Array.isArray(params.calories) ? params.calories[0] : params.calories as string || '0');
  const baseProtein = parseFloat(Array.isArray(params.protein) ? params.protein[0] : params.protein as string || '0');
  const baseCarbs = parseFloat(Array.isArray(params.carbs) ? params.carbs[0] : params.carbs as string || '0');
  const baseFat = parseFloat(Array.isArray(params.fat) ? params.fat[0] : params.fat as string || '0');

  const [amount, setAmount] = useState('100');
  const [selectedMeal, setSelectedMeal] = useState(baseMeal);
  const [showMealPicker, setShowMealPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Handmatig invoer
  const [manualName, setManualName] = useState('');
  const [manualCalories, setManualCalories] = useState('');
  const [manualProtein, setManualProtein] = useState('');
  const [manualCarbs, setManualCarbs] = useState('');
  const [manualFat, setManualFat] = useState('');

  const factor = parseFloat(amount) / 100;
  const calcCalories = Math.round(baseCalories * factor);
  const calcProtein = Math.round(baseProtein * factor * 10) / 10;
  const calcCarbs = Math.round(baseCarbs * factor * 10) / 10;
  const calcFat = Math.round(baseFat * factor * 10) / 10;

  const save = async () => {
    if (isManual && !manualName.trim()) {
      Alert.alert('Fill in a food name first!');
      return;
    }

    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('nutrition_logs').insert({
      user_id: user.id,
      date: new Date().toISOString().split('T')[0],
      meal_type: selectedMeal,
      food_name: isManual ? manualName : name,
      calories: isManual ? parseInt(manualCalories) || 0 : calcCalories,
      protein: isManual ? parseFloat(manualProtein) || 0 : calcProtein,
      carbs: isManual ? parseFloat(manualCarbs) || 0 : calcCarbs,
      fat: isManual ? parseFloat(manualFat) || 0 : calcFat,
    });

    if (error) {
      Alert.alert('Something went wrong, try again.');
      setSaving(false);
      return;
    }

    setSaving(false);
    router.back();
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>‹</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>

        {isManual ? (
          <View style={styles.manualContainer}>
            <Text style={styles.manualTitle}>Add manually</Text>

            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Food name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Chicken breast"
                placeholderTextColor="#4B5563"
                value={manualName}
                onChangeText={setManualName}
              />
            </View>

            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Calories (kcal)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#4B5563"
                keyboardType="numeric"
                value={manualCalories}
                onChangeText={setManualCalories}
              />
            </View>

            <View style={styles.macroRow}>
              <View style={[styles.inputCard, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Protein (g)</Text>
                <TextInput style={styles.input} placeholder="0" placeholderTextColor="#4B5563" keyboardType="numeric" value={manualProtein} onChangeText={setManualProtein} />
              </View>
              <View style={[styles.inputCard, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Carbs (g)</Text>
                <TextInput style={styles.input} placeholder="0" placeholderTextColor="#4B5563" keyboardType="numeric" value={manualCarbs} onChangeText={setManualCarbs} />
              </View>
              <View style={[styles.inputCard, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Fat (g)</Text>
                <TextInput style={styles.input} placeholder="0" placeholderTextColor="#4B5563" keyboardType="numeric" value={manualFat} onChangeText={setManualFat} />
              </View>
            </View>
          </View>

        ) : (
          <>
            {/* Foto */}
            <View style={styles.imageContainer}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.productImage} resizeMode="contain" />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>?</Text>
                </View>
              )}
            </View>

            {/* Naam */}
            <Text style={styles.productName}>{name}</Text>
            {brand ? <Text style={styles.productBrand}>{brand}</Text> : null}

            {/* Macro's groot — RepFuel kleuren */}
            <View style={styles.macrosCard}>
              <View style={styles.macroItem}>
                <Text style={[styles.macroNumber, { color: '#22C55E' }]}>{calcCalories}</Text>
                <Text style={styles.macroLabel}>Calories</Text>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroItem}>
                <Text style={[styles.macroNumber, { color: '#A78BFA' }]}>{calcCarbs}</Text>
                <Text style={styles.macroLabel}>Carbs (g)</Text>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroItem}>
                <Text style={[styles.macroNumber, { color: '#34D399' }]}>{calcProtein}</Text>
                <Text style={styles.macroLabel}>Protein (g)</Text>
              </View>
              <View style={styles.macroDivider} />
              <View style={styles.macroItem}>
                <Text style={[styles.macroNumber, { color: '#FBBF24' }]}>{calcFat}</Text>
                <Text style={styles.macroLabel}>Fat (g)</Text>
              </View>
            </View>

            {/* Hoeveelheid */}
            <View style={styles.amountRow}>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
              <View style={styles.unitBox}>
                <Text style={styles.unitText}>gram</Text>
              </View>
            </View>
          </>
        )}

        {/* Maaltijd kiezen */}
        <TouchableOpacity
          style={styles.mealSelector}
          onPress={() => setShowMealPicker(!showMealPicker)}
        >
          <Text style={styles.mealSelectorText}>{selectedMeal}</Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>

        {showMealPicker && (
          <View style={styles.mealPicker}>
            {MEAL_OPTIONS.map((meal) => (
              <TouchableOpacity
                key={meal}
                style={styles.mealOption}
                onPress={() => { setSelectedMeal(meal); setShowMealPicker(false); }}
              >
                <Text style={styles.mealOptionText}>{meal}</Text>
                {selectedMeal === meal && <Text style={styles.mealCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Toevoegen knop */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.addButton} onPress={save} disabled={saving}>
          <Text style={styles.addButtonText}>{saving ? 'Saving...' : 'Add to diary'}</Text>
        </TouchableOpacity>
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117' },
  backButton: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 8 },
  backText: { color: '#FFFFFF', fontSize: 32, fontWeight: '300' },
  imageContainer: { alignItems: 'center', marginBottom: 16 },
  productImage: { width: 160, height: 160, borderRadius: 16 },
  imagePlaceholder: { width: 160, height: 160, borderRadius: 16, backgroundColor: '#1C2333', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2D3748' },
  imagePlaceholderText: { color: '#4B5563', fontSize: 48 },
  productName: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center', paddingHorizontal: 20, marginBottom: 4 },
  productBrand: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 20 },
  macrosCard: { flexDirection: 'row', backgroundColor: '#1C2333', marginHorizontal: 20, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2D3748' },
  macroItem: { flex: 1, alignItems: 'center' },
  macroNumber: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  macroLabel: { fontSize: 11, color: '#6B7280', textAlign: 'center' },
  macroDivider: { width: 1, backgroundColor: '#2D3748', marginVertical: 4 },
  amountRow: { flexDirection: 'row', marginHorizontal: 20, gap: 10, marginBottom: 12 },
  amountInput: { width: 80, backgroundColor: '#1C2333', borderRadius: 12, padding: 14, color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', textAlign: 'center', borderWidth: 1, borderColor: '#2D3748' },
  unitBox: { flex: 1, backgroundColor: '#1C2333', borderRadius: 12, padding: 14, justifyContent: 'center', borderWidth: 1, borderColor: '#2D3748' },
  unitText: { color: '#FFFFFF', fontSize: 15 },
  mealSelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1C2333', marginHorizontal: 20, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#2D3748', marginBottom: 4 },
  mealSelectorText: { color: '#FFFFFF', fontSize: 15 },
  dropdownArrow: { color: '#6B7280', fontSize: 12 },
  mealPicker: { backgroundColor: '#1C2333', marginHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: '#2D3748', overflow: 'hidden', marginBottom: 12 },
  mealOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#2D3748' },
  mealOptionText: { color: '#FFFFFF', fontSize: 15 },
  mealCheck: { color: '#22C55E', fontSize: 16, fontWeight: 'bold' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 36, backgroundColor: '#0D1117' },
  addButton: { backgroundColor: '#22C55E', borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  addButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  manualContainer: { padding: 20 },
  manualTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 20 },
  inputCard: { backgroundColor: '#1C2333', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#2D3748' },
  inputLabel: { color: '#6B7280', fontSize: 11, fontWeight: 'bold', letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase' },
  input: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' },
  macroRow: { flexDirection: 'row', gap: 8 },
});