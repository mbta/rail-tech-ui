import { Factory } from "fishery";
import { activeCars } from "src/data/cars";
import { DirectionId } from "src/models/route";
import { StopStatus, TrainLoc } from "src/models/trainLocation";
import { dateTimeFromUnix } from "src/util/dateTime";
import { DEMO_C_STATIONS } from "./stops";

const randomOf = <T>(...options: T[]): T => {
  const index = Math.floor(Math.random() * options.length);
  return options[index];
};

export const trainLocFactory = Factory.define<TrainLoc>(() => {
  const station = randomOf(...DEMO_C_STATIONS);
  return {
    routeId: "Green-C",
    directionId: randomOf(DirectionId.Westbound, DirectionId.Eastbound),
    consist: Array.from({ length: randomOf(1, 2) }, () =>
      randomOf(...activeCars),
    ),
    ab: [],
    latLng: station?.latLng ?? { latitude: 0, longitude: 0 },
    stationId: station?.id ?? null,
    stopStatus: StopStatus.StoppedAt,
    timestamp: dateTimeFromUnix(
      1_640_000_000 + Math.floor(Math.random() * 10_000),
    ),
    trip: null,
    heading: null,
  };
});
