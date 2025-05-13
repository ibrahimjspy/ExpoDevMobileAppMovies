/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { COLORS } from '@/theme';

// A small wrapper so we don't repeat size/margin
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        // Active tab icon = primary, inactive = secondary
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.secondary,

        // Hide header above tabs
        headerShown: useClientOnlyValue(false, true),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          headerShown: false,

          // Let Expo Router inject `color` for active/inactive
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,

          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                {({ pressed }) => (
                  <FontAwesome
                    name="info-circle"
                    size={25}
                    // always primary so it stands out
                    color={COLORS.primary}
                    style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                  />
                )}
              </Pressable>
            </Link>
          ),
        }}
      />

      <Tabs.Screen
        name="two"
        options={{
          title: '',
          headerShown: false,

          // Again, use the passed-in `color`
          tabBarIcon: ({ color }) => <TabBarIcon name="imdb" color={color} />,
        }}
      />
    </Tabs>
  );
}
