import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // You can add authentication logic here (e.g., checking credentials)
    navigation.replace('Drawer'); // Navigate to Home (Drawer)
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212', padding: 20 }}>
      <Text style={{ color: 'white', fontSize: 24, marginBottom: 20 }}>Login</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#BBB"
        value={email}
        onChangeText={setEmail}
        style={{ backgroundColor: '#1E1E1E', color: 'white', padding: 12, borderRadius: 8, width: '30%', marginBottom: 10 }}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#BBB"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ backgroundColor: '#1E1E1E', color: 'white', padding: 12, borderRadius: 8, width: '30%', marginBottom: 10 }}
      />

      <TouchableOpacity
        onPress={handleLogin}
        style={{ backgroundColor: '#FFD700', padding: 12, borderRadius: 8, width: '30%', alignItems: 'center', marginBottom: 10 }}
      >
        <Text style={{ color: '#121212', fontSize: 16, fontWeight: 'bold' }}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('createAccount')}>
        <Text style={{ color: '#FFD700' }}>Don't have an account? Create one</Text>
      </TouchableOpacity>
    </View>
  );
}