import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import MapScreen from '../screens/MapScreen';
import ActiveChargingScreen from '../screens/ActiveChargingScreen';
import TransactionHistoryScreen from '../screens/TransactionHistoryScreen';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  useFocusEffect(
    useCallback(() => {
      // Geri gitmeyi engellemek için bir işlem
      return () => {};
    }, [])
  );

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 80 : 60,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0'
        },
        tabBarActiveTintColor: '#2E7D32',
        tabBarInactiveTintColor: '#757575',
        tabBarHideOnKeyboard: true
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="map-marker" size={24} color={color} />
          ),
          tabBarLabel: 'Map'
        }}
      />
      <Tab.Screen
        name="Active"
        component={ActiveChargingScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="lightning-bolt" size={24} color={color} />
          ),
          tabBarLabel: 'Active'
        }}
      />
      <Tab.Screen
        name="History"
        component={TransactionHistoryScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="history" size={24} color={color} />
          ),
          tabBarLabel: 'History'
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#FFFFFF' },
        gestureEnabled: false,
        headerBackButtonMenuEnabled: false,
        animation: 'none'
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
      />
      <Stack.Screen 
        name="MainApp" 
        component={MainTabs}
      />
    </Stack.Navigator>
  );
}