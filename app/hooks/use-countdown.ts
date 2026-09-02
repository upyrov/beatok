import { useEffect, useMemo, useRef, useState } from "react";

export function useCountdown(
	timeLimit: string,
	startedAt?: string,
	onMilestone?: (timeLeft: number) => void,
) {
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

	const onMilestoneRef = useRef(onMilestone);
	onMilestoneRef.current = onMilestone;

	const timeLeftRef = useRef(timeLeft);
	timeLeftRef.current = timeLeft;

	useEffect(() => {
		if (timeLeftRef.current <= 0) return;
		const interval = setInterval(() => {
			const newTimeLeft = Math.max(
				0,
				Math.floor((endTime - Date.now()) / 1000),
			);
			setTimeLeft(newTimeLeft);
			timeLeftRef.current = newTimeLeft;

			if (newTimeLeft === 60) onMilestoneRef.current?.(60);
			if (newTimeLeft === 10) onMilestoneRef.current?.(10);
			if (newTimeLeft === 0 && timeLeftRef.current > 0)
				onMilestoneRef.current?.(0);

			if (newTimeLeft <= 0) {
				clearInterval(interval);
			}
		}, 1000);
		return () => clearInterval(interval);
	}, [endTime]);

	const minutes = Math.floor(timeLeft / 60)
		.toString()
		.padStart(2, "0");
	const seconds = (timeLeft % 60).toString().padStart(2, "0");

	return { minutes, seconds, startTime, endTime };
}
