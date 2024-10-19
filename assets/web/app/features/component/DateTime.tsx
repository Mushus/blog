import type { Temporal } from "temporal-polyfill";

type Props = {
  children: Temporal.Instant;
};

const TimeZone = process.env.TIME_ZONE ?? "UTC";
const Locale = "ja-JP";

export default function DateTime({ children }: Props) {
  return (
    <time dateTime={children.toString()}>
      {children.toLocaleString(Locale, { timeZone: TimeZone })}
    </time>
  );
}
