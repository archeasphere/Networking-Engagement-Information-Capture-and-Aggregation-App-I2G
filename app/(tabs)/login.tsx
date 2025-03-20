import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

const API_URL = "https://backend-service-ndyt.onrender.com";

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch(`${API_URL}/get_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      if (data && data.password_hash === password) { // Replace with proper hashing check
        Alert.alert("Login Successful", `Welcome back, ${data.display_name}`);
        navigation.replace('Drawer');
      } else {
        Alert.alert("Login Failed", "Invalid credentials");
      }
    } catch (error) {
      Alert.alert("Error", "Could not log in");
    }
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

      <TouchableOpacity onPress={handleLogin} style={{ backgroundColor: '#FFD700', padding: 12, borderRadius: 8, width: '30%', alignItems: 'center', marginBottom: 10 }}>
        <Text style={{ color: '#121212', fontSize: 16, fontWeight: 'bold' }}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('createAccount')}>
        <Text style={{ color: '#FFD700' }}>Don't have an account? Create one</Text>
      </TouchableOpacity>
    </View>
  );
}
