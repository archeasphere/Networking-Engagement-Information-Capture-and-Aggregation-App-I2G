import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'https://backend-service-ndyt.onrender.com';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });

      const { token, user } = response.data;

      // ✅ Save token to AsyncStorage for authenticated requests
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userId', String(user.id)); // Optional: store userId for convenience

      Alert.alert('✅ Login Successful', `Welcome, ${user.username}!`);

      // ✅ Navigate to Drawer/Home
      router.replace('/Drawer');
    } catch (error) {
      console.error('Login error:', error?.response?.data || error.message);
      Alert.alert('❌ Login Failed', error?.response?.data?.error || 'Please try again');
    } finally {
      setIsLoading(false);
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
        style={{
          backgroundColor: '#1E1E1E',
          color: 'white',
          padding: 12,
          borderRadius: 8,
          width: '80%',
          marginBottom: 10
        }}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#BBB"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          backgroundColor: '#1E1E1E',
          color: 'white',
          padding: 12,
          borderRadius: 8,
          width: '80%',
          marginBottom: 10
        }}
        autoCapitalize="none"
      />

      <TouchableOpacity
        onPress={handleLogin}
        disabled={isLoading}
        style={{
          backgroundColor: isLoading ? '#888' : '#FFD700',
          padding: 12,
          borderRadius: 8,
          width: '80%',
          alignItems: 'center',
          marginBottom: 10
        }}
      >
        <Text style={{ color: '#121212', fontSize: 16, fontWeight: 'bold' }}>
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace('/createAccount')}>
        <Text style={{ color: '#FFD700' }}>Don't have an account? Create one</Text>
      </TouchableOpacity>
    </View>
  );
}
