import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function UCHeader() {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      {/* Hamburger Menu Icon */}
      <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
        <Ionicons name="menu" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* UC Merced Logo and Title */}
      <View style={styles.titleContainer}>
        <Image
          source={require('../assets/images/ucm-logo-text.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.headerTitle}>University of California, Merced</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',  // Stick to the top of the screen
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,           // High z-index to stay above other content
    backgroundColor: '#00274C',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '100%',
    height: 60,
  },
  menuButton: {
    marginRight: 16,
  },
  logo: {
    width: 50,
    height: 30,
    marginRight: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});