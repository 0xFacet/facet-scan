"use client";

import { useEffect, useRef } from "react";

type Props = {
  id: number;
  height: number;
  index: number;
  onDistanceChange: (id: number, distance: number) => void;
};

export const PlaceholderToast = ({
  id,
  height,
  index,
  onDistanceChange,
}: Props) => {
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (toastRef.current) {
      onDistanceChange(id, toastRef.current.offsetTop);
    }
  }, [id, index, onDistanceChange]);

  return <div ref={toastRef} style={{ height: `${height}px` }} />;
};
