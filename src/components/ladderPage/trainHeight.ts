import { Consist } from "src/data";
import { proportionBetweenLatLngs } from "src/models/latLng";
import { DirectionId, RouteId, RoutePatternId } from "src/models/route";
import { StationId, StationMap, stationLatLng } from "src/models/stop";
import { StopStatus, TrainLoc } from "src/models/trainLocation";
import { TripEnd } from "src/models/trainsheet";
import { filterMap, reverse } from "src/util/array";
import { DateTime, dateTimeCompare } from "src/util/dateTime";
import { avoidOverlaps, End, Start } from "./avoidOverlaps";

const EXCEPTIONS: Map<StationId, [DirectionId | null]> = new Map([
  ["place-matt", [DirectionId.Eastbound]],
  ["place-asmnl", [DirectionId.Westbound]],
]);

const STATIONS_BETWEEN_LADDERS: StationId[] = ["place-andrw", "place-jfk"];

const HALF_DISTANCE_PX = 45;

interface TrainWithStopsTraveled {
  trainLoc: TrainLoc;

  // TODO: Some of these properties are redundant w.r.t. the
  // underlying TrainLoc, although with differences in nullability.
  // Consider ways to clean this up.
  routeId: RouteId;
  routePatternId?: RoutePatternId;
  consist: Consist;
  directionId: DirectionId;
  trip: TripEnd | null;
  timestamp: DateTime | null;

  stopsTraveled: number;
}

interface TrainWithDotPx extends TrainWithStopsTraveled {
  dotPx: number;
}

export interface TrainWithHeights extends TrainWithDotPx {
  labelPx: number;
}

/**
 * The closest two train labels are allowed to be on the ladder
 */
const minSpaceBetweenTrainLabels = 44;

/**
 * Calculations for where to display each train on the ladder.
 */
export const trainHeights = (
  trainLocs: TrainLoc[],
  zoom: number,
  directionId: DirectionId,
  stationIdsInOrder: StationId[],
  stationSpacingRatiosTopToBottom: number[],
  stationMap: StationMap,
): TrainWithHeights[] => {
  const trainsWithStopsTraveled: TrainWithStopsTraveled[] = filterMap(
    trainLocs,
    (trainLoc) =>
      trainWithStopsTraveled(trainLoc, stationIdsInOrder, stationMap),
  );
  const trainsTopToBottom: TrainWithStopsTraveled[] = sortTrainsTopToBottom(
    trainsWithStopsTraveled,
    directionId,
  );
  const trainsWithDotPx: TrainWithDotPx[] = trainsTopToBottom.map((train) =>
    trainWithDotPx(
      train,
      stationIdsInOrder,
      zoom,
      stationSpacingRatiosTopToBottom,
    ),
  );
  const trainsWithLabelPx: TrainWithHeights[] =
    avoidOverlapsTrains(trainsWithDotPx);
  return trainsWithLabelPx;
};

const trainWithStopsTraveled = (
  trainLoc: TrainLoc,
  stationIdsInOrder: StationId[],
  stationMap: StationMap,
): TrainWithStopsTraveled | null => {
  // don't even check if the route or direction is missing
  if (trainLoc.routeId === null || trainLoc.directionId === null) {
    return null;
  }
  const stopsTraveled: number | null = stopsTraveledAlongSegment(
    stationIdsInOrder,
    trainLoc,
    stationMap,
  );
  // console.warn(`stopsTraveled: ${stopsTraveled}`);
  if (stopsTraveled === null) {
    return null;
  } else {
    return {
      trainLoc,
      routeId: trainLoc.routeId,
      routePatternId: trainLoc.routePatternId,
      consist: trainLoc.consist,
      directionId: trainLoc.directionId,
      trip: trainLoc.trip,
      timestamp: trainLoc.timestamp,
      stopsTraveled: stopsTraveled,
    };
  }
};

/**
 * Returns the number of stops a train has travelled along the segment
 * or null if the train is not on the segment.
 *
 * For example, when looking at the B branch, an Eastbound train at South St has travelled 1.0 stops,
 * and when looking at the Subway, an eastbound C train approaching Copley has travelled 1.8 stops.
 *
 * Fails if the train is neither StoppedAt a station in the list nor approaching a station in the list.
 * Fails if the train is approaching the first stop in the list.
 * Fails if the vehiclePosition doesn't have enough information to determine where it is.
 */

// TODO: consider how the below will support Glides, without the extra arrow rungs?
export const stopsTraveledAlongSegment = (
  stationIdsInOrder: StationId[],
  trainLoc: TrainLoc,
  stationMap: StationMap,
): number | null => {
  // console.warn(`stationIdsInOrder: ${stationIdsInOrder}`);
  // console.warn(`stationMap: ${JSON.stringify(stationMap)}`);

  if (trainLoc.stationId === null || trainLoc.routeId === null) return null;

  let stationIndex = stationIdsInOrder.indexOf(trainLoc.stationId);
  // console.warn(`stationIndex: ${stationIndex}`);

  // if (stationIndex === -1) return null;
  if (
    (trainLoc.stopStatus === StopStatus.StoppedAt ||
      EXCEPTIONS.get(trainLoc.stationId)?.includes(trainLoc.directionId)) &&
    stationIndex !== -1
  ) {
    return stationIndex;
  } else {
    if (trainLoc.latLng === null) return null;
    // if it's approaching the first station, it's not on the ladder
    // if (stationIndex === 0) return null;

    // TODO: remove once interpolating between ladders in: https://app.asana.com/1/15492006741476/project/1200882337457260/task/1210266614781194
    // if in transit to first station past an arrow,
    // return 0 stops traveled and manually provide height later on
    // if (stationIndex === 1 && stationIdsInOrder[0] === "arrow") {
    //   return 0;
    // }

    // train is between Andrew <-> JFK and not originally on this ladder
    // i.e it was "jumped" to this ladder by Orbit's vehicle-to-branch matching
    if (
      STATIONS_BETWEEN_LADDERS.includes(trainLoc.stationId) &&
      stationIndex === -1
    ) {
      stationIndex = stationIdsInOrder.length - 1;
    }
    if (stationIndex === -1) return null;

    // console.warn(`stationIndex after recalc: ${stationIndex}`);

    // approximate distance between stations by looking at latlngs
    const prevStationIndex = stationIndex - 1;
    const prevStationId: StationId = stationIdsInOrder[prevStationIndex];
    const destinationId: StationId = stationIdsInOrder[stationIndex];

    // console.warn(`prevStationId: ${prevStationId}`); // place-jfk
    // console.warn(
    //   `latLng for prev: ${JSON.stringify(stationLatLng(stationMap, prevStationId))}, latLng for destination: ${JSON.stringify(stationLatLng(stationMap, destinationId))}`,
    // );
    // console.warn(`destinationId: ${destinationId}`); //arrow -- BUT THE WRONG END?
    // console.warn(`stationMap: ${JSON.stringify(stationMap)}`);
    const proportionBetweenPrevAndNext: number = proportionBetweenLatLngs(
      stationLatLng(stationMap, prevStationId),
      // stationLatLng(stationMap, trainLoc.stationId),
      stationLatLng(stationMap, destinationId),
      trainLoc.latLng,
    );
    // console.warn(
    //   `proportionBetweenPrevAndNext: ${proportionBetweenPrevAndNext}`,
    // );
    /* Enforce a minimum distance from the nearest station, to make the difference
     * more clear between "just left a station" and "stopped at a station".
     * This is especially important in the subway, where there's often an AVI
     * right after a staion, and then no updates for a while.
     */
    // console.warn(
    //   `returning: ${prevStationIndex + clamp(proportionBetweenPrevAndNext, 0.2, 0.8)}`,
    // );
    return prevStationIndex + clamp(proportionBetweenPrevAndNext, 0.2, 0.8);
  }
};

/**
 * adjust x to be at least min and at most max
 */
const clamp = (x: number, min: number, max: number): number =>
  Math.max(Math.min(x, max), min);

/**
 * Sorts so that the train that should be at the top of the screen (the eastmost train)
 */
const sortTrainsTopToBottom = (
  trains: TrainWithStopsTraveled[],
  directionId: DirectionId,
): TrainWithStopsTraveled[] => {
  const sortedBehindToAhead =
    // the one at the start of the list is just starting its trip
    trains.sort(
      (t1, t2) =>
        t1.stopsTraveled - t2.stopsTraveled ||
        // use the timestamp as a tiebreaker.
        // if two trains are at the same station, the one who arrived later should be at the start of the list
        ((t1.timestamp &&
          t2.timestamp &&
          dateTimeCompare(t2.timestamp, t1.timestamp)) ??
          0),
    );
  if (directionId === DirectionId.Westbound) {
    // if westbound, top to bottom is in the same direction as the stations.
    return sortedBehindToAhead;
  } else {
    return reverse(sortedBehindToAhead);
  }
};

const trainWithDotPx = (
  train: TrainWithStopsTraveled,
  stationIdsInOrder: StationId[],
  zoom: number,
  stationSpacingRatiosTopToBottom: number[],
): TrainWithDotPx => ({
  ...train,
  dotPx: stopsTraveledToPixelsFromTop(
    train.stopsTraveled,
    train.directionId,
    train.trainLoc.stopStatus,
    stationIdsInOrder,
    zoom,
    stationSpacingRatiosTopToBottom,
  ),
});

const stopsTraveledToPixelsFromTop = (
  stopsTraveled: number,
  directionId: DirectionId,
  stopStatus: StopStatus,
  stationIdsInOrder: StationId[],
  zoom: number,
  stationSpacingRatiosTopToBottom: number[],
): number => {
  const stopsOnSegment = stationIdsInOrder.length;

  // If approaching first station under an arrow from westbound direction
  // hardcode above the first station
  // if (
  //   stationIdsInOrder[0] === "arrow" &&
  //   stopsTraveled < 1.0 &&
  //   directionId === DirectionId.Westbound &&
  //   stopStatus === StopStatus.InTransitTo
  // ) {
  //   return HALF_DISTANCE_PX;
  // }

  // Makes the assumption that the top of the ladder is the eastern-most stop on the segment
  const stopsFromTop =
    directionId === DirectionId.Westbound
      ? stopsTraveled
      : stopsOnSegment - stopsTraveled - 1;
  const sumOfStationRatiosForFullStopsAwayFromTop =
    stationSpacingRatiosTopToBottom
      .slice(0, stopsFromTop)
      .reduce((acc, current) => acc + current, 0);
  const pixelsFromTop = sumOfStationRatiosForFullStopsAwayFromTop * zoom;

  // If approaching first station above an arrow from eastbound direction
  // hardcode below first station
  // if (
  //   stationIdsInOrder[0] === "arrow" &&
  //   stopsTraveled < 1.0 &&
  //   directionId === DirectionId.Eastbound &&
  //   stopStatus === StopStatus.InTransitTo
  // ) {
  //   return pixelsFromTop - HALF_DISTANCE_PX;
  // }

  const partialDistance = stopsFromTop - Math.trunc(stopsFromTop);
  if (partialDistance !== 0) {
    return (
      (sumOfStationRatiosForFullStopsAwayFromTop +
        partialDistance *
          stationSpacingRatiosTopToBottom[Math.trunc(stopsFromTop)]) *
      zoom
    );
  }
  return pixelsFromTop;
};

/**
 * Wraps AvoidOverlaps and converts between its generic names and the ladder-specific names
 */
const avoidOverlapsTrains = (
  trainsWithDotPx: TrainWithDotPx[],
): TrainWithHeights[] =>
  avoidOverlaps(
    trainsWithDotPx.map((train: TrainWithDotPx): Start<TrainWithDotPx> => ({
      payload: train,
      start: train.dotPx,
    })),
    minSpaceBetweenTrainLabels,
  ).map((train: End<TrainWithDotPx>): TrainWithHeights => ({
    ...train.payload,
    labelPx: train.end,
  }));
