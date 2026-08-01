import { useEffect, useMemo, useState } from "react";

export function useCountdown(timeLimit: string, startedAt?: string) {
  const { startTime, endTime } = useMemo(() => {
    const parsedSeconds = timeLimit
      ? timeLimit.split(":").reduce((acc, time) => 60 * acc + Number(time), 0)
      : 0;
    const start = startedAt ? new Date(startedAt).getTime() : Date.now();
    return {
      startTime: start,
      endTime: start + parsedSeconds * 1000,
    };
  }, [timeLimit, startedAt]);

  const [timeLeft, setTimeLeft] = useState(() =>
    Math.max(0, Math.floor((endTime - Date.now()) / 1000)),
  );

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, Math.floor((endTime - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [endTime, timeLeft]);

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  return { minutes, seconds, startTime, endTime };
}
