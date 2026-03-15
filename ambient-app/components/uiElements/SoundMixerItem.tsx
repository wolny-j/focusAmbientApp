import { View, Pressable, StyleSheet, Platform } from "react-native";
import { useState, useEffect } from "react";
import Slider from "@react-native-community/slider";
import { MaterialIcons } from "@expo/vector-icons";
import SoundManager from "../tools/soundManager";

function VolumeSlider({
  value,
  color,
  onValueChange,
}: {
  value: number;
  color: string;
  onValueChange: (v: number) => void;
}) {
  if (Platform.OS === "web") {
    return (
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(e) => onValueChange(parseFloat(e.target.value))}
        style={
          {
            flex: 1,
            accentColor: color,
            height: 40,
            width: "100%",
            cursor: "pointer",
          } as any
        }
      />
    );
  }
  return (
    <Slider
      style={styles.slider}
      minimumValue={0}
      maximumValue={1}
      value={value}
      minimumTrackTintColor={color}
      maximumTrackTintColor="#444"
      thumbTintColor={color}
      onValueChange={onValueChange}
    />
  );
}

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
  const [volumeIcon, setVolumeIcon] =
    useState<keyof typeof MaterialIcons.glyphMap>("volume-up");

  useEffect(() => {
    let mounted = true;
    const sync = async () => {
      const playing = SoundManager.isPlaying(path.toString());
      setIsPlaying(playing);
      if (playing) {
        const v = await SoundManager.getCurrentVolume(path.toString());
        if (mounted) setVolume(v);
      }
    };
    SoundManager.on("change", sync);
    sync();
    return () => {
      mounted = false;
      SoundManager.off("change", sync);
    };
  }, []);

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
        <VolumeSlider
          value={volume ?? 0.5}
          color={color}
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
    marginVertical: 15,
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
    gap: 8,
  },
  slider: {
    flex: 1,
    height: 40,
  },
});
