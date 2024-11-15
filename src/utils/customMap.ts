export class CustomMap<TKey, TValue> {
  private keysMap: Map<string, TKey> = new Map();
  private valuesMap: Map<string, TValue> = new Map();

  constructor(private keyToString: (position: TKey) => string) {}

  set(key: TKey, value: TValue) {
    const keyString = this.keyToString(key);
    this.valuesMap.set(keyString, value);
    this.keysMap.set(keyString, key);
  }

  get(key: TKey) {
    return this.valuesMap.get(this.keyToString(key));
  }

  has(key: TKey): boolean {
    return this.valuesMap.has(this.keyToString(key));
  }

  size() {
    return this.valuesMap.size;
  }

  values() {
    return this.valuesMap.values();
  }

  entries() {
    return Array.from(this.valuesMap.entries()).map(
      ([key, value]) => [this.keysMap.get(key), value] as [TKey, TValue]
    );
  }
}

