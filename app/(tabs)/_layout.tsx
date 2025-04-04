import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import SidebarContent from './SidebarContent';

export default function DrawerLayout() {
  const colorScheme = useColorScheme();

  return (
    <Drawer
      drawerContent={(props) => <SidebarContent {...props} />}
      screenOptions={{
        headerShown: false, // ✅ <--- THIS is the missing piece
        headerStyle: { 
          backgroundColor: Colors[colorScheme ?? 'light'].background 
        },
        headerTintColor: Colors[colorScheme ?? 'light'].text,
        drawerActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        drawerInactiveTintColor: Colors[colorScheme ?? 'light'].text,
        drawerType: 'front',
      }}>
      <Drawer.Screen
        name="index"
        options={{
          title: 'Home',
          drawerIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
        }}
      />

      <Drawer.Screen
        name="explore"
        options={{
          title: 'Explore',
          drawerIcon: ({ color }) => <IconSymbol size={24} name="paperplane.fill" color={color} />,
        }}
      />

      <Drawer.Screen
        name="graphView"
        options={{
          title: "File-Label Graph",
          drawerIcon: ({ color }) => <IconSymbol size={24} name="network" color={color} />,
        }}
      />
    </Drawer>
  );
}