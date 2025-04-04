import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function UCHeader() {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      {/* Hamburger Icon */}
      <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
        <Ionicons name="menu" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* UC Logo + Title */}
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

function HomeScreen({ }) {
  const [searchQuery, setSearchQuery] = useState('');


}

const styles = StyleSheet.create({
    header: {
        position: '', // Optional: makes it stick to top
        top: 1,
        left: 0,
        right: 0,
        zIndex: 10,
        backgroundColor: '#00274C',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 19,
        paddingHorizontal: 30,
        borderRadius: 0, // Remove rounded corners if you want full edge-to-edge
        width: '100%',   // ✅ Force full width
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#000000',
  },
});
