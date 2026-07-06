import { DateTime } from "src/util/dateTime";
import { getNow } from "./now";

const mockGetNow = getNow as jest.MockedFunction<typeof getNow>;

export const putNow = (now: DateTime) => {
  mockGetNow.mockReturnValue(now);
};
