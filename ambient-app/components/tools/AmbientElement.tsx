class AmbientElement {
  public path: string;
  public volume: number;
  constructor(path: string, volume: number) {
    this.path = path;
    this.volume = volume;
  }

  // --- GETTERS ---

  public getPath(): string {
    return this.path;
  }

  public getVolume(): number {
    return this.volume;
  }

  // --- SETTERS ---

  public setPath(path: string): void {
    this.path = path;
  }

  public setVolume(volume: number): void {
    this.volume = volume;
  }
}

export default AmbientElement;
