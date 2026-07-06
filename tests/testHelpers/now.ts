import { DateTime } from "src/util/dateTime";

export const getNow = (): DateTime =>
  DateTime.fromObject({}, { zone: "America/New_York" });
