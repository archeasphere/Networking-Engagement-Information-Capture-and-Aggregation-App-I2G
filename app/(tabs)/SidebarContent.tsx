import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function SidebarContent({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Ionicons name="log-in-outline" size={20} color="blue" />
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => {}}>
          <Ionicons name="log-out-outline" size={20} color="blue" />
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Files')}>
          <Ionicons name="folder-outline" size={20} color="blue" />
          <Text style={styles.buttonText}>Files</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CreateAccount')}>
          <Ionicons name="person-add-outline" size={20} color="blue" />
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Light mode background
    padding: 16,
  },
  buttonContainer: {
    backgroundColor: '#F0F0F0', // Light gray background for button box
    borderRadius: 10,
    padding: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: '#000000', // Black text
    marginLeft: 10,
    fontSize: 16,
  },
});

export default SidebarContent;

