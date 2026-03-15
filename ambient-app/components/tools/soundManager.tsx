import { Audio } from "expo-av";
import { EventEmitter } from "events";
import AmbientElement from "./AmbientElement";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { resolveSoundAsset } from "../../app/soundRegistry";

if (typeof document !== "undefined") {
  // jesteśmy na web
  Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
  });
}
class SoundManager {
  private sounds: Map<string, Audio.Sound> = new Map();
  private playing: Map<string, boolean> = new Map();
  private emitter = new EventEmitter();

  // -------- Event System --------

  on(event: string, callback: () => void) {
    this.emitter.on(event, callback);
  }

  off(event: string, callback: () => void) {
    this.emitter.off(event, callback);
  }

  private emitChange() {
    this.emitter.emit("change");
  }
  private setupMediaSession(title: string) {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator))
      return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: title,
      artist: "Ambient Sleep",
      artwork: [
        { src: "/assets/images/icon.png", sizes: "192x192", type: "image/png" },
      ],
    });

    navigator.mediaSession.setActionHandler("pause", () => this.stopAll());
    navigator.mediaSession.setActionHandler("stop", () => this.stopAll());
  }

  // -------- Playback --------

  async play(id: string, source: any, initialVolume = 0.5) {
    if (this.sounds.has(id)) return;
    const resolvedSource = resolveSoundAsset(source);
    const { sound } = await Audio.Sound.createAsync(resolvedSource, {
      shouldPlay: true,
      isLooping: true,
    });

    await sound.setVolumeAsync(initialVolume);
    this.sounds.set(id, sound);
    this.playing.set(id, true);

    this.setupMediaSession(id); // ← dodaj to
    this.emitChange();
  }

  async setVolume(id: string, volume: number) {
    const sound = this.sounds.get(id);
    if (sound) {
      await sound.setVolumeAsync(volume);
      this.emitChange();
    }
  }
  async getCurrentVolume(id: string) {
    const sound = this.sounds.get(id);
    if (!sound) return 0.5;

    const status = await sound.getStatusAsync();

    if (status.isLoaded) {
      return status.volume ?? 0.5;
    }

    return 0.5;
  }

  async stop(id: string) {
    const sound = this.sounds.get(id);

    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();

      this.sounds.delete(id);
      this.playing.set(id, false);

      this.emitChange();
    }
  }

  async stopAll() {
    for (const sound of this.sounds.values()) {
      await sound.stopAsync();
      await sound.unloadAsync();
    }

    this.sounds.clear();
    this.playing.clear();

    this.emitChange();
  }

  isPlaying(id: string) {
    return this.playing.get(id) || false;
  }

  async composeMix(name: string) {
    const mix: AmbientElement[] = [];

    for (const [id, sound] of this.sounds.entries()) {
      const status = await sound.getStatusAsync();

      if (status.isLoaded) {
        mix.push(new AmbientElement(id, status.volume ?? 1));
      }
    }

    const preset = {
      name,
      createdAt: Date.now(),
      mix: mix.map((e) => ({
        id: e.getPath(),
        volume: e.getVolume(),
      })),
    };

    await this.saveMix(name, JSON.stringify(preset, null, 2));
  }

  async loadMixAndPlay() {
    const data = await this.loadMix();
    if (!data) return;
    const mix = JSON.parse(data) as { id: string; volume: number }[];

    await this.stopAll();
    for (const item of mix) {
      await this.play(item.id, item.id);
      await this.setVolume(item.id, item.volume);
    }
  }

  async saveMix(name: string, mix: any) {
    try {
      await AsyncStorage.setItem(`preset_${name}`, JSON.stringify(mix));
    } catch (e) {
      console.error(e);
    }
  }

  async loadMix() {
    try {
      const data = await AsyncStorage.getItem("mix");

      if (!data) return null;

      return JSON.parse(data);
    } catch (e) {
      console.error(e);
    }
  }

  loadMixList() {
    return AsyncStorage.getAllKeys().then((keys) =>
      keys
        .filter((key) => key.startsWith("preset_"))
        .map((key) => key.replace("preset_", "")),
    );
  }

  async deletePreset(name: string) {
    try {
      await AsyncStorage.removeItem(`preset_${name}`);
    } catch (e) {
      console.error(e);
    }
  }

  async loadPresetAndPlay(name: string) {
    const data = await AsyncStorage.getItem(`preset_${name}`);
    if (!data) return;

    let preset;

    try {
      preset = JSON.parse(data);

      // zabezpieczenie przed podwójnym JSON
      while (typeof preset === "string") {
        preset = JSON.parse(preset);
      }
    } catch {
      return;
    }

    const mix = Array.isArray(preset?.mix) ? preset.mix : [];

    await this.stopAll();

    for (const item of mix) {
      if (!item?.id) continue;

      await this.play(item.id, item.id);
      await this.setVolume(item.id, item.volume ?? 1);
    }
  }
}

export default new SoundManager();
