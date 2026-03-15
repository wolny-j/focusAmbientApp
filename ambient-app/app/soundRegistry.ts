const SoundRegistry: Record<string, any> = {
  brown_noise: require("../assets/sounds/brown_noise_1.mp3"),
  cafe: require("../assets/sounds/cafe_1.mp3"),
  campfire: require("../assets/sounds/campfire_1.mp3"),
  car_street: require("../assets/sounds/car_street_1.mp3"),
  cicada: require("../assets/sounds/cicada_1.mp3"),
  forest: require("../assets/sounds/forest_1.mp3"),
  lofi: require("../assets/sounds/lofi_1.mp3"),
  ocean_waves: require("../assets/sounds/ocean_waves_1.mp3"),
  piano: require("../assets/sounds/piano_1.mp3"),
  pink_noise: require("../assets/sounds/pink_noise_1.mp3"),
  rain: require("../assets/sounds/rain_1.mp3"),
  river: require("../assets/sounds/river_1.mp3"),
  storm: require("../assets/sounds/storm_1.mp3"),
  train: require("../assets/sounds/train_1.mp3"),
  white_noise: require("../assets/sounds/white_noise_1.mp3"),
  wind: require("../assets/sounds/wind_1.mp3"),
};

export function resolveSoundAsset(id: string) {
  return SoundRegistry[id];
}

export default resolveSoundAsset;
