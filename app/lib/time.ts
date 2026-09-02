import { format, isToday, parseISO } from "date-fns";

export const formatDate = (date: string | Date, includeTime = true) => {
	const dateObj =
		typeof date === "string"
			? parseISO(date.includes("T") ? date : `${date}T00:00:00`)
			: date;

	if (isToday(dateObj) && includeTime) {
		return format(dateObj, "h:mm a");
	}

	return format(dateObj, includeTime ? "M/d/yyyy, h:mm a" : "M/d/yyyy");
};

export function formatDuration(timeSpan: string) {
	if (!timeSpan || !timeSpan.includes(":")) return timeSpan;

	const [h, m, s] = timeSpan.split(":").map(Number);
	if (isNaN(h)) return timeSpan;

	if (h === 0)
		return s === 0 ? `${m} min` : `${m}:${String(s).padStart(2, "0")} min`;
	return `${h}h ${m}m`;
}
