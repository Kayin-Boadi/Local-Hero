import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

import {
  House,
  Compass,
  NewspaperClipping,
  UserCircle,
} from 'phosphor-react-native';

function TabIconWrapper({
  children,
  focused,
  color,
}: {
  children: React.ReactNode;
  focused: boolean;
  color: string;
}) {
  return (
    <View
      style={{
        backgroundColor: focused ? `${color}20` : 'transparent',
        borderRadius: 10,
        padding: 2, // smaller circle
      }}>
      {children}
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  // Set your preferred active highlight color here
 const activeTint =
  colorScheme === 'dark'
    ? Colors.dark.tint
    : '#222';
  const inactiveTint = '#000'; // Pitch black

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTint,
        tabBarInactiveTintColor: inactiveTint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}>
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <TabIconWrapper focused={focused} color={activeTint}>
              <House
                color={focused ? activeTint : color}
                weight={focused ? 'fill' : 'regular'}
                size={24}
              />
            </TabIconWrapper>
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIconWrapper focused={focused} color={activeTint}>
              <Compass
                color={focused ? activeTint : color}
                weight={focused ? 'fill' : 'regular'}
                size={24}
              />
            </TabIconWrapper>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIconWrapper focused={focused} color={activeTint}>
              <UserCircle
                color={focused ? activeTint : color}
                weight={focused ? 'fill' : 'regular'}
                size={24}
              />
            </TabIconWrapper>
          ),
        }}
      />
    </Tabs>
  );
}
