import { View, Pressable, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import { useState, useRef, useEffect } from "react";
import Slider from "@react-native-community/slider";
import { MaterialIcons } from "@expo/vector-icons";
import SoundManager from "../tools/soundManager";
import soundManager from "../tools/soundManager";
export interface SoundMixerItemProps {
  path: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  color?: string;
}
export default function SoundMixerItem({
  path,
  icon = "headset",
  color = "white",
}: SoundMixerItemProps) {
  const [isPlaying, setIsPlaying] = useState(
    SoundManager.isPlaying(path.toString()),
  );
  const [volume, setVolume] = useState<number | null>(null);
  useEffect(() => {
    let mounted = true;
    const sync = async () => {
      const playing = SoundManager.isPlaying(path.toString());
      setIsPlaying(playing);
      if (playing) {
        const v = await SoundManager.getCurrentVolume(path.toString());
        setVolume(v);
      }
    };
    SoundManager.on("change", sync);
    sync();
    return () => {
      mounted = false;
      SoundManager.off("change", sync);
    };
  }, []);
  const [volumeIcon, setVolumeIcon] =
    useState<keyof typeof MaterialIcons.glyphMap>("volume-up");
  useEffect(() => {
    const update = () => {
      setIsPlaying(SoundManager.isPlaying(path.toString()));
    };
    SoundManager.on("change", update);
    return () => {
      SoundManager.off("change", update);
    };
  }, []);
  return (
    <View style={styles.container}>
      <MaterialIcons name={icon} size={34} color={color} style={styles.icon} />
      <Pressable
        onPress={
          isPlaying
            ? () => {
                SoundManager.stop(path.toString());
                setIsPlaying(false);
              }
            : () => {
                SoundManager.play(path, path, volume ?? 0.5);
                setIsPlaying(true);
              }
        }
        style={styles.button}
      >
        <MaterialIcons
          name={isPlaying ? "pause" : "play-arrow"}
          size={34}
          color="white"
        />
      </Pressable>
      <View style={styles.volumeRow}>
        <MaterialIcons name={volumeIcon} size={24} color={color} />
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={volume ?? 0.5}
          minimumTrackTintColor={color}
          maximumTrackTintColor="#444"
          thumbTintColor={color}
          onValueChange={(value) => {
            setVolume(value);
            SoundManager.setVolume(path.toString(), value);
            if (value === 0) setVolumeIcon("volume-off");
            else if (value < 0.6) setVolumeIcon("volume-down");
            else setVolumeIcon("volume-up");
          }}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    width: "95%",
    marginVertical: 15, // przestrzeń między rządami
    paddingVertical: 5,
  },
  icon: {
    marginRight: 20,
    marginLeft: 10,
  },
  button: {
    marginRight: 20,
  },
  volumeRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // odstęp między ikoną a sliderem
  },
  slider: {
    flex: 1,
    height: 40,
  },
});
