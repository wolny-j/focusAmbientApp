import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Audio } from "expo-av";
export default function TabsLayout() {
  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: false,
      interruptionModeIOS: 1,
      interruptionModeAndroid: 1,
    });
  }, []);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#B983FF",
        tabBarInactiveTintColor: "white",
        tabBarStyle: { backgroundColor: "#1A1117F0" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ambient",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="headset" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sleep"
        options={{
          title: "Sleep",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="bedtime" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="soundRegistry"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
