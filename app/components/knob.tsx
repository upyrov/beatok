import { useHotkey } from "@tanstack/react-hotkeys";
import { useCallback, useMemo, useRef, useState } from "react";

const STEP = 1;
const LARGE_STEP = 10;
const RADIUS = 42;

export function Knob({
  value,
  min = 0,
  max = 100,
  onChange,
  size = 40,
  color = "#4ade80",
}: {
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
  size?: number;
  color?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ y: number; val: number }>({ y: 0, val: 0 });
  const knobRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsDragging(true);
      dragStartRef.current = { y: e.clientY, val: value };
    },
    [value],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const dy = dragStartRef.current.y - e.clientY;
      const range = max - min;
      const sensitivity = range / 150; // pixels to travel for full range
      let newVal = dragStartRef.current.val + dy * sensitivity;
      newVal = Math.max(min, Math.min(max, Math.round(newVal)));
      onChange(newVal);
    },
    [isDragging, max, min, onChange],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      setIsDragging(false);
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    },
    [],
  );

  const valueRef = useRef(value);
  valueRef.current = value;

  const updateValue = useCallback(
    (e: KeyboardEvent, newVal: number) => {
      e.preventDefault();
      onChange(Math.max(min, Math.min(max, newVal)));
    },
    [min, max, onChange],
  );

  useHotkey("ArrowUp", (e) => updateValue(e, valueRef.current + STEP), {
    target: knobRef,
  });
  useHotkey("ArrowRight", (e) => updateValue(e, valueRef.current + STEP), {
    target: knobRef,
  });
  useHotkey("ArrowDown", (e) => updateValue(e, valueRef.current - STEP), {
    target: knobRef,
  });
  useHotkey("ArrowLeft", (e) => updateValue(e, valueRef.current - STEP), {
    target: knobRef,
  });
  useHotkey("PageUp", (e) => updateValue(e, valueRef.current + LARGE_STEP), {
    target: knobRef,
  });
  useHotkey("PageDown", (e) => updateValue(e, valueRef.current - LARGE_STEP), {
    target: knobRef,
  });
  useHotkey("Home", (e) => updateValue(e, min), { target: knobRef });
  useHotkey("End", (e) => updateValue(e, max), { target: knobRef });

  const { angle, circumference, strokeDashoffset } = useMemo(() => {
    const percentage = (value - min) / (max - min);
    const circ = 2 * Math.PI * RADIUS;
    return {
      angle: -135 + percentage * 270,
      circumference: circ,
      strokeDashoffset: circ - percentage * 0.75 * circ,
    };
  }, [value, min, max]);

  return (
    <div
      role="slider"
      ref={knobRef}
      tabIndex={0}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative flex items-center justify-center group cursor-ns-resize focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full"
      style={{ width: size, height: size, touchAction: "none" }}
    >
      {/* SVG Arc */}
      <svg
        className="absolute w-full h-full pointer-events-none drop-shadow-md"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(135 50 50)"
          className="opacity-90"
        />
      </svg>

      {/* Knob Body */}
      <div
        className="relative rounded-full flex items-center justify-center border border-black/80 shadow-[0_2px_5px_rgba(0,0,0,0.5)]"
        style={{
          width: "75%",
          height: "75%",
          background:
            "radial-gradient(circle at 50% 10%, #666 0%, #333 50%, #1a1a1a 100%)",
          boxShadow:
            "inset 0 1px 1px rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.8)",
        }}
      >
        {/* Indicator Dot Wrapper */}
        <div
          className="absolute w-full h-full flex items-start justify-center pt-[10%]"
          style={{ transform: `rotate(${angle}deg)` }}
        >
          {/* Dot */}
          <div
            className="w-1.5 h-1.5 rounded-full shadow-[0_0_2px_rgba(0,0,0,0.5)]"
            style={{ backgroundColor: color, opacity: 0.8 }}
          />
        </div>
      </div>

      {/* Display value on hover */}
      <div className="absolute -top-8 bg-black/80 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        {value}
      </div>
    </div>
  );
}
