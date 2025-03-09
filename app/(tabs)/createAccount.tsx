import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function CreateAccountScreen() {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', padding: 20 }}>
      <Text style={{ color: 'white', fontSize: 24, marginBottom: 20 }}>Create Account</Text>

      <TextInput placeholder="Email" placeholderTextColor="#BBB" style={styles.input} />
      <TextInput placeholder="Password" placeholderTextColor="#BBB" secureTextEntry style={styles.input} />
      <TextInput placeholder="Confirm Password" placeholderTextColor="#BBB" secureTextEntry style={styles.input} />

      <TouchableOpacity style={styles.button}>
        <Text style={{ color: '#121212', fontSize: 16, fontWeight: 'bold' }}>Create Account</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{ color: '#FFD700' }}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = {
  input: { backgroundColor: '#1E1E1E', color: 'white', padding: 12, borderRadius: 8, width: '30%', marginBottom: 10 },
  button: { backgroundColor: '#FFD700', padding: 12, borderRadius: 8, width: '30%', alignItems: 'center', marginBottom: 10 },
};
