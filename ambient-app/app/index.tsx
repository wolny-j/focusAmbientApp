import {
  View,
  StyleSheet,
  Text,
  Platform,
  StatusBar,
  Pressable,
  Animated,
  ScrollView,
} from "react-native";
import SoundMixerItem from "@/components/uiElements/SoundMixerItem";
import { MaterialIcons } from "@expo/vector-icons";
import { useRef, useState, useEffect } from "react";

export default function Home() {
  return (
    <View style={style.container}>
      <View style={style.row}>
        <Text style={style.title}>Silent Poet Ambient</Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <AnimatedCategory title="Nature">
          <SoundMixerItem
            path={require("../assets/sounds/rain_1.mp3")}
            icon="water-drop"
            color="cyan"
          />
          <SoundMixerItem
            path={require("../assets/sounds/campfire_1.mp3")}
            icon="local-fire-department"
            color="red"
          />
          <SoundMixerItem
            path={require("../assets/sounds/ocean_waves_1.mp3")}
            icon="waves"
            color="lightblue"
          />
          <SoundMixerItem
            path={require("../assets/sounds/forest_1.mp3")}
            icon="forest"
            color="lightgreen"
          />
          <SoundMixerItem
            path={require("../assets/sounds/wind_1.mp3")}
            icon="air"
            color="lightgray"
          />
          <SoundMixerItem
            path={require("../assets/sounds/storm_1.mp3")}
            icon="thunderstorm"
            color="rgb(210, 233, 5)2"
          />
          <SoundMixerItem
            path={require("../assets/sounds/river_1.mp3")}
            icon="water"
            color="rgb(106, 158, 206)"
          />
          <SoundMixerItem
            path={require("../assets/sounds/cicada_1.mp3")}
            icon="bug-report"
            color="rgb(6, 94, 11)"
          />
        </AnimatedCategory>

        <AnimatedCategory title="Noise">
          <SoundMixerItem
            path={require("../assets/sounds/white_noise_1.mp3")}
            icon="graphic-eq"
            color="white"
          />
          <SoundMixerItem
            path={require("../assets/sounds/pink_noise_1.mp3")}
            icon="graphic-eq"
            color="rgb(183, 145, 221)"
          />
          <SoundMixerItem
            path={require("../assets/sounds/brown_noise_1.mp3")}
            icon="graphic-eq"
            color="rgb(141, 78, 6)"
          />
        </AnimatedCategory>
        <AnimatedCategory title="Urban">
          <SoundMixerItem
            path={require("../assets/sounds/car_street_1.mp3")}
            icon="directions-car"
            color="gray"
          />
          <SoundMixerItem
            path={require("../assets/sounds/cafe_1.mp3")}
            icon="local-cafe"
            color="rgba(172, 87, 18, 0.98)"
          />
        </AnimatedCategory>
      </ScrollView>
    </View>
  );
}

// komponent animowanej kategorii
function AnimatedCategory({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleOpen = () => setOpen(!open);

  useEffect(() => {
    Animated.timing(animation, {
      toValue: open ? 1 : 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [open]);

  const height = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, contentHeight],
  });

  return (
    <View style={{ marginTop: 20 }}>
      <Pressable onPress={toggleOpen}>
        <View style={style.headerRow}>
          <MaterialIcons
            name={open ? "keyboard-arrow-down" : "keyboard-arrow-right"}
            size={26}
            color="white"
          />
          <Text style={style.sectionHeader}>{title}</Text>
        </View>
      </Pressable>

      <View
        style={{ position: "absolute", top: -9999, left: -9999 }}
        onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
      >
        {children}
      </View>

      {contentHeight > 0 && (
        <Animated.View style={{ overflow: "hidden", height }}>
          {children}
        </Animated.View>
      )}
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#251922",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 60,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    color: "white",
    fontSize: 30,
    fontWeight: 200,
  },
  sectionHeader: {
    color: "white",
    fontSize: 22,
    fontWeight: 200,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center", // to robi robotę
    gap: 4,
  },
});
