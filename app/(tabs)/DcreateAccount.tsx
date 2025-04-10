import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import axios, { AxiosError } from 'axios';

const API_URL = 'https://backend-service-ndyt.onrender.com';

interface ErrorResponse {
  message: string;
}

export default function CreateAccountScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /* const handleCreateAccount = async () => {
    // Basic validation
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/api/users/register`, {
        email,
        password,
        username: 'TEST'
      });

      if (response.status === 201) {
        Alert.alert(
          '🎉 Account Created',
          'Your account has been successfully created. You can now log in.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Oops', 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error creating account:', error);
    
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to create account';
    
      Alert.alert('❌ Error', errorMessage);
    }
  } */

    /*
    const handleCreateAccount = async () => {
        if (!email || !password || !confirmPassword) {
          Alert.alert('Error', 'Please fill in all fields');
          return;
        }
      
        if (password !== confirmPassword) {
          Alert.alert('Error', 'Passwords do not match');
          return;
        }
      
        setIsLoading(true); // Start loading spinner
      
        try {
          const response = await axios.post(`${API_URL}/api/users/register`, {
            email,
            password,
            username: 'TEST'
          });
      
          if (response.status === 201) {
            Alert.alert(
              '🎉 Account Created',
              'Your account has been successfully created. You can now log in.',
              [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
          } else {
            Alert.alert('Oops', 'Something went wrong. Please try again.');
          }
        } catch (error) {
          console.error('Error creating account:', error);
      
          const axiosError = error as AxiosError<ErrorResponse>;
          const errorMessage = axiosError.response?.data?.message || 'Failed to create account';
      
          Alert.alert('❌ Error', errorMessage);
        } finally {
          setIsLoading(false); // ✅ Always reset loading, no matter what
        }
      };  
      */    

      const handleCreateAccount = async () => {
        // Basic validation
        if (!email || !password || !confirmPassword) {
          Alert.alert('Error', 'Please fill in all fields');
          return;
        }
    
        if (password !== confirmPassword) {
          Alert.alert('Error', 'Passwords do not match');
          return;
        }
    
        setIsLoading(true);
        
        try {
          const response = await axios.post(`${API_URL}/api/users/register`, {
            email,
            password,
            username: 'TEST'
          });

       if (response.status === 201) {
        Alert.alert('Success', 'Account created successfully');
        navigation.goBack();
      }
      
    } catch (error) {
      console.error('Error creating account:', error);
      
      // Type guard for AxiosError
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to create account';
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  }; 

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#BBB"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#BBB"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Confirm Password"
        placeholderTextColor="#BBB"
        secureTextEntry
        style={styles.input}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        autoCapitalize="none"
      />

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleCreateAccount}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Creating...' : 'Create Account'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.linkContainer}>
        <Text style={styles.link}>Already have an account? Sign In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20
  },
  title: {
    color: 'white',
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold'
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    width: '80%',
    marginBottom: 16
  },
  button: {
    backgroundColor: '#FFD700',
    padding: 16,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    marginBottom: 16
  },
  buttonDisabled: {
    backgroundColor: '#9a9a9a',
    opacity: 0.7
  },
  buttonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold'
  },
  linkContainer: {
    marginTop: 8
  },
  link: {
    color: '#FFD700'
  }
});
