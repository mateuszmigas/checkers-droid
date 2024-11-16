// simple implementation on node EventEmitter in browser

type EventWithListener<
  EventType,
  EventUnion extends { type: string }
> = Extract<EventUnion, { type: EventType }> extends { payload: infer P }
  ? [name: EventType, listener: (value: P) => void]
  : [name: EventType, listener: () => void];

type EventWithPayload<EventType, EventUnion extends { type: string }> = Extract<
  EventUnion,
  { type: EventType }
> extends { payload: infer P }
  ? [name: EventType, payload: P]
  : [name: EventType];

type Listener<T> = (payload: T) => void;

export class EventEmitter<T extends { type: string; payload?: unknown }> {
  private listeners = new Map<string, Listener<unknown>[]>();

  on<EventType extends T["type"]>(
    ...[event, listener]: EventWithListener<EventType, T>
  ) {
    const eventListeners = this.listeners.get(event) || [];
    eventListeners.push(listener);
    this.listeners.set(event, eventListeners);
  }
  off<EventType extends T["type"]>(
    ...[event, listener]: EventWithListener<EventType, T>
  ) {
    const eventListeners = this.listeners.get(event) || [];
    this.listeners.set(
      event,
      eventListeners.filter((l) => l !== listener)
    );
  }
  emit<EventType extends T["type"]>(
    ...[event, payload]: EventWithPayload<EventType, T>
  ) {
    const eventListeners = this.listeners.get(event) || [];
    eventListeners.forEach((listener) => listener(payload));
  }
}

// type TabEvents =
//   | { type: "closed"; payload: { id: string } }
//   | { type: "all-closed" }
//   | {
//       type: "resized";
//       payload: {
//         id: string;
//         newSize: {
//           width: number;
//           height: number;
//         };
//       };
//     };

// class Tab extends EventEmitter<TabEvents> {}
// const tab = new Tab();

// tab.on("resized", (payload) => {
//   payload.id; //{id: string, newSize: {width: number, height: number}}
// });
// tab.emit("resized", {
//   id: "tab-id",
//   newSize: { width: 100, height: 200 },
// });

// tab.on("all-closed", () => {});
// tab.emit("all-closed");

