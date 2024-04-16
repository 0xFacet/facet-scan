"use client";

import React, { useState, useEffect } from "react";

interface TimerProps {
  render: () => React.ReactNode;
}

export const Timer: React.FC<TimerProps> = ({ render }) => {
  const [_, setTick] = useState(false);

  useEffect(() => {
    const timerId = setInterval(() => {
      setTick((tick) => !tick);
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  return <>{render()}</>;
};
