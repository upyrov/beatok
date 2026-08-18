import { Button as BaseButton } from "@base-ui/react";
import { useCallback, useMemo } from "react";
import type { ActivityDay } from "~/api/types/user";
import { formatDate } from "~/lib/time";

interface ActivityGraphProps {
  activity: ActivityDay[];
  year: number | undefined;
  selectedDate: string | undefined;
  onDateSelect: (date: string | undefined) => void;
}

export function ActivityGraph({
  activity,
  year,
  selectedDate,
  onDateSelect,
}: ActivityGraphProps) {
  const { maxCount, monthSpans, weeks } = useMemo(() => {
    if (!activity || !activity.length) {
      return { maxCount: 1, monthSpans: [] };
    }

    let mx = 1;
    const daysArr: (ActivityDay | null)[] = [];

    // Parse the first date to find the starting day of the week (0 = Sunday)
    const firstDateStr = activity[0].date;
    const firstDate = new Date(`${firstDateStr}T00:00:00`);
    const startDay = firstDate.getDay();

    for (let i = 0; i < startDay; i++) {
      daysArr.push(null);
    }

    for (const a of activity) {
      if (a.count > mx) mx = a.count;
      daysArr.push(a);
    }

    // Group into weeks to calculate month spans
    const weeks: (ActivityDay | null)[][] = [];
    for (let i = 0; i < daysArr.length; i += 7) {
      weeks.push(daysArr.slice(i, i + 7));
    }

    const spans: { month: string; span: number }[] = [];
    let currentMonth = "";
    let currentSpan = 0;

    weeks.forEach((week) => {
      const firstDay = week.find((d) => d !== null);
      if (!firstDay) {
        currentSpan++;
        return;
      }
      const date = new Date(`${firstDay.date}T00:00:00`);
      const month = date.toLocaleString("default", { month: "short" });
      if (month !== currentMonth) {
        if (currentSpan > 0) {
          spans.push({ month: currentMonth, span: currentSpan });
        }
        currentMonth = month;
        currentSpan = 1;
      } else {
        currentSpan++;
      }
    });
    if (currentSpan > 0) {
      spans.push({ month: currentMonth, span: currentSpan });
    }

    return { days: daysArr, maxCount: mx, monthSpans: spans, weeks };
  }, [activity]);

  const getColor = useCallback(
    (count: number) => {
      if (count === 0) return "bg-[#ebedf0] dark:bg-[#161b22]";
      const intensity = Math.min(4, Math.ceil((count / maxCount) * 4));

      if (intensity === 1) return "bg-[#9be9a8] dark:bg-[#0e4429]";
      if (intensity === 2) return "bg-[#40c463] dark:bg-[#006d32]";
      if (intensity === 3) return "bg-[#30a14e] dark:bg-[#26a641]";
      return "bg-[#216e39] dark:bg-[#39d353]";
    },
    [maxCount],
  );

  // const totalActivities = activity.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="w-full">
      {/* <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-gray-300">
          {totalActivities} in {year ?? "the last 365 days"}
        </h3>
      </div> */}
      <div className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent flex justify-center">
        <table className="border-separate border-spacing-0.5 md:border-spacing-0.75 min-w-max mx-auto md:mx-0">
          <thead>
            <tr>
              <th className="hidden sm:table-cell w-6 md:w-8"></th>
              {monthSpans.map((m, i) => (
                <th
                  key={i}
                  colSpan={m.span}
                  className="text-xs text-gray-500 font-normal text-left pb-1"
                >
                  <span
                    className={m.span < 2 ? "invisible" : "flex justify-center"}
                  >
                    {m.month}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4, 5, 6].map((rowIdx) => (
              <tr key={rowIdx}>
                <td className="hidden sm:table-cell text-[10px] text-gray-500 text-right pr-2 leading-3 h-3 align-middle">
                  {rowIdx === 1
                    ? "Mon"
                    : rowIdx === 3
                      ? "Wed"
                      : rowIdx === 5
                        ? "Fri"
                        : ""}
                </td>
                {weeks?.map((week, weekIdx) => {
                  const day = week[rowIdx];

                  if (!day) {
                    return (
                      <td key={`pad-${weekIdx}`} className="p-0">
                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-xs bg-transparent" />
                      </td>
                    );
                  }

                  const isSelected = day.date === selectedDate;

                  return (
                    <td key={day.date} className="p-0 relative">
                      <BaseButton
                        title={`${day.count} activities on ${formatDate(day.date, false)}`}
                        onClick={() =>
                          onDateSelect(isSelected ? undefined : day.date)
                        }
                        className={`w-2.5 h-2.5 md:w-3 md:h-3 block rounded-xs ring-1 ring-inset ring-black/5 dark:ring-white/5 transition-transform ${getColor(day.count)} ${
                          isSelected
                            ? "ring-1 ring-offset-1 ring-offset-black ring-white scale-110 z-10 relative"
                            : "hover:ring-1 hover:ring-white/50"
                        }`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end gap-2 text-xs text-gray-500 mt-2">
        <span>Less</span>
        <div className="flex gap-0.75">
          <div className="w-2.5 h-2.5 rounded-xs ring-1 ring-inset ring-black/5 dark:ring-white/5 bg-[#ebedf0] dark:bg-[#161b22]"></div>
          <div className="w-2.5 h-2.5 rounded-xs ring-1 ring-inset ring-black/5 dark:ring-white/5 bg-[#9be9a8] dark:bg-[#0e4429]"></div>
          <div className="w-2.5 h-2.5 rounded-xs ring-1 ring-inset ring-black/5 dark:ring-white/5 bg-[#40c463] dark:bg-[#006d32]"></div>
          <div className="w-2.5 h-2.5 rounded-xs ring-1 ring-inset ring-black/5 dark:ring-white/5 bg-[#30a14e] dark:bg-[#26a641]"></div>
          <div className="w-2.5 h-2.5 rounded-xs ring-1 ring-inset ring-black/5 dark:ring-white/5 bg-[#216e39] dark:bg-[#39d353]"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
