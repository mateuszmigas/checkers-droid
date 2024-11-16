import { EventEmitter } from "@/utils/eventEmitter";
import { useEffect } from "react";

export const useEventListener = <T extends { type: string; payload?: unknown }>(
  emitter: EventEmitter<T>,
  events: T["type"][],
  listener: (payload: T) => void
) => {
  useEffect(() => {
    events.forEach((event: T["type"]) => {
      emitter.on(...([event, listener] as never));
    });
    return () => {
      events.forEach((event: T["type"]) => {
        emitter.off(...([event, listener] as never));
      });
    };
  }, [emitter, events, listener]);
};

