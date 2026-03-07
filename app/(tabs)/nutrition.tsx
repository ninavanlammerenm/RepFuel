import { StyleSheet, Text, View } from 'react-native';

export default function NutritionScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Nutrition komt hier</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});