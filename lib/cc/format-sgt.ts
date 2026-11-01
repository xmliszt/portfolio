type SgtPattern =
  | "HH:mm"
  | "HH:mm:ss"
  | "EEE dd MMM"
  | "EEE dd MMM HH:mm"
  | "yyyy-MM-dd";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Singapore",
  hourCycle: "h23",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/** Return `date` in Singapore time, written as `pattern`. */
export function formatSgt(options: { date: Date; pattern: SgtPattern }) {
  const parts = Object.fromEntries(
    formatter.formatToParts(options.date).map((part) => [part.type, part.value])
  );
  const time = `${parts.hour}:${parts.minute}`;
  const dayLabel = `${parts.weekday} ${parts.day} ${MONTHS.at(Number(parts.month) - 1)}`;
  switch (options.pattern) {
    case "HH:mm":
      return time;
    case "HH:mm:ss":
      return `${time}:${parts.second}`;
    case "EEE dd MMM":
      return dayLabel;
    case "EEE dd MMM HH:mm":
      return `${dayLabel} ${time}`;
    case "yyyy-MM-dd":
      return `${parts.year}-${parts.month}-${parts.day}`;
    default: {
      const unhandled: never = options.pattern;
      return unhandled;
    }
  }
}
