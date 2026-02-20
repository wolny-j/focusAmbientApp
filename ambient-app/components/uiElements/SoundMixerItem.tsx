import { View, Pressable, StyleSheet } from "react-native";
import { Audio } from "expo-av";
import { useState, useRef } from "react";
import Slider from "@react-native-community/slider";
import { MaterialIcons } from "@expo/vector-icons";

export interface SoundMixerItemProps {
  path: number;
  icon?: keyof typeof MaterialIcons.glyphMap;
  color?: string;
}

export default function SoundMixerItem({
  path,
  icon = "headset",
  color = "white",
}: SoundMixerItemProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [volumeIcon, setVolumeIcon] =
    useState<keyof typeof MaterialIcons.glyphMap>("volume-up");
  const soundRef = useRef<Audio.Sound | null>(null);

  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync(path, { isLooping: true });
    soundRef.current = sound;
    await sound.playAsync();
    soundRef.current?.setVolumeAsync(volume);
    setIsPlaying(true);
  };

  const stopSound = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    setIsPlaying(false);
  };

  return (
    <View style={styles.container}>
      <MaterialIcons name={icon} size={34} color={color} style={styles.icon} />
      <Pressable
        onPress={isPlaying ? stopSound : playSound}
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
          value={volume}
          minimumTrackTintColor={color}
          maximumTrackTintColor="#444"
          thumbTintColor={color}
          onValueChange={(value) => {
            setVolume(value);
            soundRef.current?.setVolumeAsync(value);
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
