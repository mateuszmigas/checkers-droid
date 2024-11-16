import { useState } from "react";

export const useTriggerRender = () => {
  const [, setTriggerRender] = useState(0);
  return () =>
    setTriggerRender((prev) =>
      prev >= Number.MAX_SAFE_INTEGER ? 0 : prev + 1
    );
};

