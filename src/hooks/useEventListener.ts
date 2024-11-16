import { EventEmitter } from "@/utils/eventEmitter";
import { useEffect } from "react";

export const useEventListener = <T extends { type: string }>(
  emitter: EventEmitter<T>,
  events: T["type"][],
  callback: (event: T) => void
) => {
  useEffect(() => {
    events.forEach((eventType) => emitter.on(eventType, callback));

    return () =>
      events.forEach((eventType) => emitter.off(eventType, callback));
  }, [emitter, events, callback]);
};

