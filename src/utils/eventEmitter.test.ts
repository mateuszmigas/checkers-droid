import { describe, it, expect, beforeEach, vi } from "vitest";
import { EventEmitter } from "./eventEmitter";

type TestEvents =
  | { type: "test"; payload: string }
  | { type: "noPayload" }
  | { type: "numberPayload"; payload: number };

describe("EventEmitter", () => {
  let emitter: EventEmitter<TestEvents>;

  beforeEach(() => {
    emitter = new EventEmitter<TestEvents>();
  });

  // Event Registration Tests
  it("should register an event listener", () => {
    const listener = vi.fn();
    emitter.on("test", listener);
    emitter.emit({ type: "test", payload: "hello" });
    expect(listener).toHaveBeenCalledWith({ type: "test", payload: "hello" });
  });

  it("should allow multiple listeners for the same event", () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    emitter.on("test", listener1);
    emitter.on("test", listener2);

    emitter.emit({ type: "test", payload: "hello" });

    expect(listener1).toHaveBeenCalledWith({ type: "test", payload: "hello" });
    expect(listener2).toHaveBeenCalledWith({ type: "test", payload: "hello" });
  });

  it("should handle events without payload", () => {
    const listener = vi.fn();
    emitter.on("noPayload", listener);
    emitter.emit({ type: "noPayload" });
    expect(listener).toHaveBeenCalledWith({ type: "noPayload" });
  });

  // Event Emission Tests
  it("should not trigger listeners of different events", () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    emitter.on("test", listener1);
    emitter.on("numberPayload", listener2);

    emitter.emit({ type: "test", payload: "hello" });

    expect(listener1).toHaveBeenCalledWith({ type: "test", payload: "hello" });
    expect(listener2).not.toHaveBeenCalled();
  });

  // Event Unregistration Tests
  it("should remove specific listener from event", () => {
    const listener = vi.fn();

    emitter.on("test", listener);
    emitter.off("test", listener);
    emitter.emit({ type: "test", payload: "hello" });

    expect(listener).not.toHaveBeenCalled();
  });

  it("should keep other listeners when removing one", () => {
    const listener1 = vi.fn();
    const listener2 = vi.fn();

    emitter.on("test", listener1);
    emitter.on("test", listener2);
    emitter.off("test", listener1);

    emitter.emit({ type: "test", payload: "hello" });

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).toHaveBeenCalledWith({ type: "test", payload: "hello" });
  });

  // Edge Cases
  it("should handle emitting event with no listeners", () => {
    expect(() => {
      emitter.emit({ type: "test", payload: "hello" });
    }).not.toThrow();
  });

  it("should handle registering same listener multiple times", () => {
    const listener = vi.fn();

    emitter.on("test", listener);
    emitter.on("test", listener);

    emitter.emit({ type: "test", payload: "hello" });

    // The listener should be called twice because it was registered twice
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("should handle complex payload types", () => {
    const listener = vi.fn();
    const complexPayload = 42;

    emitter.on("numberPayload", listener);
    emitter.emit({ type: "numberPayload", payload: complexPayload });

    expect(listener).toHaveBeenCalledWith({
      type: "numberPayload",
      payload: complexPayload,
    });
  });
});

