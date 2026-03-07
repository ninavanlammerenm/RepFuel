import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function StartScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      <Text style={styles.logo}>RepFuel</Text>
      <Text style={styles.tagline}>Train. Eat. Progress.</Text>

      <TouchableOpacity
        style={styles.buttonLogin}
        onPress={() => router.push('/login')}
      >
        <Text style={styles.buttonText}>Log in</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonRegister}
        onPress={() => router.push('/register')}
      >
        <Text style={styles.buttonText}>Create account</Text>
      </TouchableOpacity>

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
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 60,
  },
  buttonLogin: {
    backgroundColor: '#22C55E',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
    marginBottom: 16,
  },
  buttonRegister: {
    backgroundColor: '#374151',
    paddingVertical: 14,
    paddingHorizontal: 60,
    borderRadius: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});