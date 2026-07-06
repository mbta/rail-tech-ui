export { DateTime } from "luxon";

import { DateTime } from "luxon";

export const dateTimeFromUnix = (unixSeconds: number): DateTime =>
  DateTime.fromSeconds(unixSeconds, { zone: "America/New_York" });

export const dateTimeFromISO = (isoDateTime: string): DateTime =>
  DateTime.fromISO(isoDateTime, { zone: "America/New_York" });

export const dateTimeCompare = (a: DateTime, b: DateTime): number =>
  a.valueOf() - b.valueOf();
