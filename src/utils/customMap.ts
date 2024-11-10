export class CustomMap<TKey, TValue> {
  private map: Map<string, TValue> = new Map();

  constructor(private keyToString: (position: TKey) => string) {}

  set(key: TKey, value: TValue) {
    this.map.set(this.keyToString(key), value);
  }

  get(key: TKey) {
    return this.map.get(this.keyToString(key));
  }

  has(key: TKey): boolean {
    return this.map.has(this.keyToString(key));
  }

  size() {
    return this.map.size;
  }

  values() {
    return this.map.values();
  }

  entries() {
    return this.map.entries();
  }

  keys() {
    return this.map.keys();
  }
}

