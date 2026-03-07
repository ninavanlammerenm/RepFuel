import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ResultsScreen() {
  const router = useRouter();

  // Later worden dit echte berekeningen op basis van de ingevulde data
  const calories = 2350;
  const protein = 180;
  const carbs = 260;
  const fat = 70;

  return (
    <View style={styles.container}>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <Text style={styles.title}>Your daily{'\n'}targets</Text>
        <Text style={styles.subtitle}>Based on your data, here's what you should aim for every day:</Text>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Calories</Text>
          <Text style={styles.cardValue}>{calories} kcal</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Protein</Text>
          <Text style={styles.cardValue}>{protein} g</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Carbs</Text>
          <Text style={styles.cardValue}>{carbs} g</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Fat</Text>
          <Text style={styles.cardValue}>{fat} g</Text>
        </View>

        <Text style={styles.note}>You can always adjust this later in your profile.</Text>

      </ScrollView>

      <View style={styles.bottom}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.buttonText}>LET'S GO →</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 48,
  },
  content: {
    paddingBottom: 24,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#22C55E',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  note: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
  bottom: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#22C55E',
    paddingVertical: 16,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});
