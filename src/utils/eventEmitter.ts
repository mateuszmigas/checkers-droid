// simple implementation on node EventEmitter in browser
type Listener<E> = (event: E) => void;

export class EventEmitter<T extends { type: string }> {
  private listeners = new Map<string, Listener<T>[]>();

  on(type: T["type"], listener: Listener<T>) {
    const eventListeners = this.listeners.get(type) || [];
    eventListeners.push(listener);
    this.listeners.set(type, eventListeners);
  }

  off(type: T["type"], listener: Listener<T>) {
    const eventListeners = this.listeners.get(type) || [];
    this.listeners.set(
      type,
      eventListeners.filter((l) => l !== listener)
    );
  }

  emit(event: T) {
    const eventListeners = this.listeners.get(event.type) || [];
    eventListeners.forEach((listener) => listener(event));
  }
}

