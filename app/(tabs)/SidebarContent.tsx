import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

function SidebarContent(props) {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const activeRouteName = props.state.routes[props.state.index].name;

  const routes = [
    { name: '/', title: 'All Files', icon: 'folder-outline' },
    //{ name: 'explore', title: 'Explore', icon: 'paperplane.fill' },
    { name: 'graphView', title: 'File-Label Graph', icon: 'network' },
    { name: 'login', title: 'Login', icon: 'person.circle' },
    //{ name: 'trash', title: 'Trash', icon: 'folder.fill' },
    { name: 'createAccount', title: 'Create Account', icon: 'person.badge.plus' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          I2G-Connection App
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {routes.map((route) => {
          const isActive = route.name === activeRouteName;
          
          return (
            <View key={route.name} style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[
                  styles.button,
                  isActive && { 
                    backgroundColor: Colors[colorScheme ?? 'light'].tint + '20' // 20% opacity
                  }
                ]} 
                onPress={() => {
                  router.navigate(route.name);
                  props.navigation.closeDrawer();
                }}
              >
                <IconSymbol 
                  size={24} 
                  name={route.icon} 
                  color={isActive ? Colors[colorScheme ?? 'light'].tint : Colors[colorScheme ?? 'light'].text} 
                />
                <Text 
                  style={[
                    styles.buttonText, 
                    { 
                      color: isActive 
                        ? Colors[colorScheme ?? 'light'].tint 
                        : Colors[colorScheme ?? 'light'].text 
                    }
                  ]}
                >
                  {route.title}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => {
            router.navigate('settings');
            props.navigation.closeDrawer();
          }}
        >
          <IconSymbol 
            size={20} 
            name="gear" 
            color={Colors[colorScheme ?? 'light'].text} 
          />
          <Text style={[styles.settingsText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Settings
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
  },
  header: {
    paddingVertical: 48,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    paddingTop: 16,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
  },
  buttonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  settingsText: {
    marginLeft: 12,
    fontSize: 16,
  },
});

export default SidebarContent;