export const formatDate = (date: string | Date, includeTime = true) => {
  let dateObj = date;
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    dateObj = `${date}T00:00:00`;
  }
  const d = new Date(dateObj);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...(includeTime && {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }),
  }).format(d);
};

export const formatDuration = (timeSpan: string) => {
  if (!timeSpan) return "";
  const parts = timeSpan.split(":");
  if (parts.length === 3) {
    const [h, m, s] = parts;
    const hInt = parseInt(h, 10);
    const mInt = parseInt(m, 10);
    const sInt = parseInt(s, 10);

    if (hInt === 0) {
      if (sInt === 0) return `${mInt} min`;
      return `${mInt}:${s.padStart(2, "0")} min`;
    }
    return `${hInt}h ${mInt}m`;
  }
  return timeSpan;
};
