import { Audio } from "expo-av";
import { EventEmitter } from "events";
import AmbientElement from "./AmbientElement";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { resolveSoundAsset } from "../../app/soundRegistry";
import { Platform } from "react-native";

if (typeof document !== "undefined") {
  Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
  });
}

// Web Audio API types
interface WebSound {
  audioElement: HTMLAudioElement;
  gainNode: GainNode;
  source: MediaElementAudioSourceNode;
}

class SoundManager {
  private sounds: Map<string, Audio.Sound> = new Map();
  private webSounds: Map<string, WebSound> = new Map();
  private playing: Map<string, boolean> = new Map();
  private volumes: Map<string, number> = new Map();
  private emitter = new EventEmitter();
  private audioContext: AudioContext | null = null;

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

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
        {
          src: `${window.location.origin}/assets/images/icon.png`,
          sizes: "192x192",
          type: "image/png",
        },
      ],
    });

    navigator.mediaSession.setActionHandler("pause", () => this.stopAll());
    navigator.mediaSession.setActionHandler("stop", () => this.stopAll());
  }

  // -------- Playback --------

  async play(id: string, source: any, initialVolume = 0.5) {
    if (this.playing.get(id)) return;

    if (Platform.OS === "web") {
      await this.playWeb(id, source, initialVolume);
    } else {
      await this.playNative(id, source, initialVolume);
    }

    this.playing.set(id, true);
    this.volumes.set(id, initialVolume);
    this.setupMediaSession(id);
    this.emitChange();
  }

  private async playNative(id: string, source: any, initialVolume: number) {
    const resolvedSource = resolveSoundAsset(source);
    const { sound } = await Audio.Sound.createAsync(resolvedSource, {
      shouldPlay: true,
      isLooping: true,
    });
    await sound.setVolumeAsync(initialVolume);
    this.sounds.set(id, sound);
  }

  private async playWeb(id: string, source: any, initialVolume: number) {
    const resolvedSource = resolveSoundAsset(source);
    const ctx = this.getAudioContext();

    // resume context jeśli suspended (wymagane przez iOS)
    if (ctx.state === "suspended") {
      await ctx.resume();
    }

    const audioElement = new window.Audio();
    audioElement.src = resolvedSource;
    audioElement.loop = true;
    audioElement.crossOrigin = "anonymous";

    const gainNode = ctx.createGain();
    gainNode.gain.value = initialVolume;

    const source_node = ctx.createMediaElementSource(audioElement);
    source_node.connect(gainNode);
    gainNode.connect(ctx.destination);

    await audioElement.play();

    this.webSounds.set(id, {
      audioElement,
      gainNode,
      source: source_node,
    });
  }

  async setVolume(id: string, volume: number) {
    this.volumes.set(id, volume);

    if (Platform.OS === "web") {
      const webSound = this.webSounds.get(id);
      if (webSound) {
        webSound.gainNode.gain.value = volume;
        this.emitChange();
      }
    } else {
      const sound = this.sounds.get(id);
      if (sound) {
        await sound.setVolumeAsync(volume);
        this.emitChange();
      }
    }
  }

  async getCurrentVolume(id: string): Promise<number> {
    if (Platform.OS === "web") {
      return this.volumes.get(id) ?? 0.5;
    }

    const sound = this.sounds.get(id);
    if (!sound) return 0.5;
    const status = await sound.getStatusAsync();
    if (status.isLoaded) return status.volume ?? 0.5;
    return 0.5;
  }

  async stop(id: string) {
    if (Platform.OS === "web") {
      const webSound = this.webSounds.get(id);
      if (webSound) {
        webSound.audioElement.pause();
        webSound.audioElement.src = "";
        this.webSounds.delete(id);
      }
    } else {
      const sound = this.sounds.get(id);
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        this.sounds.delete(id);
      }
    }

    this.playing.set(id, false);
    this.volumes.delete(id);
    this.emitChange();
  }

  async stopAll() {
    if (Platform.OS === "web") {
      for (const webSound of this.webSounds.values()) {
        webSound.audioElement.pause();
        webSound.audioElement.src = "";
      }
      this.webSounds.clear();
    } else {
      for (const sound of this.sounds.values()) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
      this.sounds.clear();
    }

    this.playing.clear();
    this.volumes.clear();
    this.emitChange();
  }

  isPlaying(id: string) {
    return this.playing.get(id) || false;
  }

  async composeMix(name: string) {
    const mix: AmbientElement[] = [];

    for (const [id] of this.playing.entries()) {
      if (this.playing.get(id)) {
        const volume = this.volumes.get(id) ?? 1;
        mix.push(new AmbientElement(id, volume));
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
