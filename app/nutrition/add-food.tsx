import { supabase } from '@/lib/supabase';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type FoodResult = {
  id: string;
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export default function AddFoodScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mealType = Array.isArray(params.meal) ? params.meal[0] : params.meal as string;

  const [search, setSearch] = useState('');
  const [results, setResults] = useState<FoodResult[]>([]);
  const [searched, setSearched] = useState(false);

  const searchFood = async (text: string) => {
    setSearch(text);

    if (!text.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setSearched(true);

    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .ilike('name', `%${text.trim()}%`)
      .order('name', { ascending: true })
      .limit(30);

    if (!error && data) setResults(data);
  };

  const openDetail = (item: FoodResult) => {
    router.push({
      pathname: '/nutrition/food-detail' as any,
      params: {
        meal: mealType,
        name: item.name,
        brand: item.brand || '',
        calories: String(item.calories),
        protein: String(item.protein),
        carbs: String(item.carbs),
        fat: String(item.fat),
        imageUrl: '',
      },
    });
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Search food..."
          placeholderTextColor="#4B5563"
          value={search}
          onChangeText={searchFood}
          returnKeyType="search"
          autoFocus
        />
      </View>

      <Text style={styles.mealLabel}>Adding to: {mealType}</Text>

      {/* Lege staat */}
      {!searched && (
        <View style={styles.emptyWrapper}>
          <Text style={styles.emptySubText}>Start typing to search...</Text>
          <TouchableOpacity
            style={styles.manualButton}
            onPress={() => router.push({
              pathname: '/nutrition/food-detail' as any,
              params: { meal: mealType, manual: '1' },
            })}
          >
            <Text style={styles.manualButtonText}>+ Add manually</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Geen resultaten */}
      {searched && results.length === 0 && (
        <View style={styles.emptyWrapper}>
          <Text style={styles.emptyText}>No results found</Text>
          <Text style={styles.emptySubText}>Try a different search term</Text>
          <TouchableOpacity
            style={styles.manualButton}
            onPress={() => router.push({
              pathname: '/nutrition/food-detail' as any,
              params: { meal: mealType, manual: '1' },
            })}
          >
            <Text style={styles.manualButtonText}>+ Add manually</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Resultaten */}
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {results.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [styles.resultRow, pressed && styles.resultRowPressed]}
            onPress={() => openDetail(item)}
          >
            <View style={styles.foodLetterBadge}>
              <Text style={styles.foodLetterText}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.resultInfo}>
              <Text style={styles.resultName} numberOfLines={1}>{item.name}</Text>
              {item.brand ? (
                <Text style={styles.resultBrand} numberOfLines={1}>{item.brand}</Text>
              ) : null}
              <Text style={styles.resultMeta}>
                <Text style={styles.resultCalories}>{item.calories} kcal</Text>
                <Text style={styles.resultDot}> · </Text>
                <Text style={styles.resultPer}>per 100g</Text>
              </Text>
            </View>

            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))}

        {results.length > 0 && (
          <TouchableOpacity
            style={styles.manualButtonBottom}
            onPress={() => router.push({
              pathname: '/nutrition/food-detail' as any,
              params: { meal: mealType, manual: '1' },
            })}
          >
            <Text style={styles.manualButtonText}>+ Add manually</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117', paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, gap: 10, marginBottom: 8 },
  closeText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold', width: 28 },
  searchInput: { flex: 1, backgroundColor: '#1C2333', borderRadius: 12, padding: 12, color: '#FFFFFF', fontSize: 15, borderWidth: 1, borderColor: '#2D3748' },
  mealLabel: { color: '#6B7280', fontSize: 12, textAlign: 'center', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  emptyWrapper: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  emptySubText: { color: '#6B7280', fontSize: 14 },
  resultRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#1C2333', gap: 12 },
  resultRowPressed: { backgroundColor: '#1C2333' },
  foodLetterBadge: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#22C55E22', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#22C55E44' },
  foodLetterText: { color: '#22C55E', fontSize: 18, fontWeight: 'bold' },
  resultInfo: { flex: 1 },
  resultName: { color: '#FFFFFF', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  resultBrand: { color: '#6B7280', fontSize: 12, marginBottom: 2 },
  resultMeta: { fontSize: 13 },
  resultCalories: { color: '#22C55E', fontWeight: 'bold' },
  resultDot: { color: '#4B5563' },
  resultPer: { color: '#4B5563' },
  arrow: { color: '#4B5563', fontSize: 22 },
  manualButton: { backgroundColor: '#1C2333', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, borderWidth: 1, borderColor: '#22C55E' },
  manualButtonBottom: { margin: 16, backgroundColor: '#1C2333', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#2D3748' },
  manualButtonText: { color: '#22C55E', fontWeight: 'bold', fontSize: 14 },
});