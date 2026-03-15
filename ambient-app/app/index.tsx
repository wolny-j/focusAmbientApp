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
import TimePicker from "@/components/uiElements/TimePicker";
import soundManager from "@/components/tools/soundManager";
import PresetNamePopup from "@/components/uiElements/namePopup";

export default function Home() {
  const [popupVisible, setPopupVisible] = useState(false);
  const [presetPanelVisible, setPresetPanelVisible] = useState(false);
  const [presetList, setPresetList] = useState<string[]>([]);
  const slideAnim = useRef(new Animated.Value(300)).current;

  const loadPresets = async () => {
    const keys = await soundManager.loadMixList();
    setPresetList(keys);
  };
  return (
    <View style={style.container}>
      <View style={style.row}>
        <Text style={style.title}>Poetic Ambient</Text>
      </View>
      <TimePicker />
      <ScrollView
        showsVerticalScrollIndicator={true}
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        <AnimatedCategory title="Nature">
          <SoundMixerItem path={"rain"} icon="water-drop" color="#4FC3F7" />
          <SoundMixerItem
            path={"campfire"}
            icon="local-fire-department"
            color="#EF5350"
          />
          <SoundMixerItem path={"ocean_waves"} icon="waves" color="#4FC3F7" />
          <SoundMixerItem path={"forest"} icon="forest" color="#66BB6A" />
          <SoundMixerItem path={"wind"} icon="air" color="#B2EBF2" />
          <SoundMixerItem path={"storm"} icon="thunderstorm" color="#acb892" />
          <SoundMixerItem
            path={"river"}
            icon="water"
            color="rgb(106, 158, 206)"
          />
          <SoundMixerItem path={"cicada"} icon="bug-report" color="#81C784" />
        </AnimatedCategory>

        <AnimatedCategory title="Noise">
          <SoundMixerItem
            path={"white_noise"}
            icon="graphic-eq"
            color="#E0E0E0"
          />
          <SoundMixerItem
            path={"pink_noise"}
            icon="graphic-eq"
            color="#F48FB1"
          />
          <SoundMixerItem
            path={"brown_noise"}
            icon="graphic-eq"
            color="#A1887F"
          />
        </AnimatedCategory>
        <AnimatedCategory title="Urban">
          <SoundMixerItem
            path={"car_street"}
            icon="directions-car"
            color="#90A4AE"
          />
          <SoundMixerItem path={"cafe"} icon="local-cafe" color="#8D6E63" />
          <SoundMixerItem path={"train"} icon="train" color="#78909C" />
        </AnimatedCategory>

        <AnimatedCategory title="Music">
          <SoundMixerItem path={"piano"} icon="piano" color="#D7CCC8" />
          <SoundMixerItem path={"lofi"} icon="music-note" color="#FFB74D" />
        </AnimatedCategory>
      </ScrollView>
      <View
        style={{
          flexDirection: "row",
          alignSelf: "center",
          gap: 20,
          marginBottom: 20,
        }}
      >
        <Pressable
          onPress={() => {
            console.log("Play all");
            setPopupVisible(true);
          }}
        >
          <MaterialIcons name="add" size={32} color="white" />
        </Pressable>
        <Pressable
          onPress={async () => {
            await loadPresets();
            setPresetPanelVisible(true);

            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start();
          }}
        >
          <MaterialIcons name="queue-music" size={32} color="white" />
        </Pressable>

        <PresetNamePopup
          visible={popupVisible}
          onCancel={() => setPopupVisible(false)}
          onSave={async (name) => {
            soundManager.composeMix(name);
            setPopupVisible(false);
          }}
        />
      </View>
      {presetPanelVisible && (
        <Animated.View
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: "95%",
            backgroundColor: "#2D1F27",
            transform: [{ translateX: slideAnim }],
            padding: 20,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 22,
              marginBottom: 20,
              marginTop: 50,
            }}
          >
            Presets
          </Text>

          <ScrollView>
            {presetList.map((preset) => (
              <View
                key={preset}
                style={{
                  marginTop: 20,
                  paddingVertical: 15,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {/* Nazwa */}
                <Text style={{ color: "white", fontWeight: 200, fontSize: 22 }}>
                  {preset}
                </Text>

                {/* Play przy nazwie */}
                <Pressable
                  onPress={async () => {
                    await soundManager.loadPresetAndPlay(preset);
                    setPresetPanelVisible(false);
                  }}
                  style={{ marginLeft: 15 }}
                >
                  <MaterialIcons name="play-arrow" size={30} color="white" />
                </Pressable>

                {/* Spacer → pcha delete na prawo */}
                <View style={{ flex: 1 }} />

                {/* Delete po prawej */}
                <Pressable
                  onPress={async () => {
                    await soundManager.deletePreset(preset);
                    await soundManager.stopAll();
                    await loadPresets();
                  }}
                >
                  <MaterialIcons name="delete" size={30} color="#E57373" />
                </Pressable>
              </View>
            ))}
          </ScrollView>

          <Pressable
            onPress={() => setPresetPanelVisible(false)}
            style={{ marginTop: 20 }}
          >
            <MaterialIcons name="close" size={30} color="#E57373" />
          </Pressable>
        </Animated.View>
      )}
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
  }, [animation, open]);

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
    fontWeight: 100,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center", // to robi robotę
    gap: 4,
  },
});
