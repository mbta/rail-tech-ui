import {
  trainHeights,
  TrainWithHeights,
} from "src/components/ladderPage/trainHeight";
import { DirectionId } from "src/models/route";
import { StopStatus, TrainLoc } from "src/models/trainLocation";
import { reverse } from "src/util/array";
import { dateTimeFromUnix } from "src/util/dateTime";
import { trainLocFactory } from "tests/testHelpers/factory";
import {
  DEMO_B_STATIONS,
  DEMO_C_STATIONS,
  byId,
} from "tests/testHelpers/stops";

const stationIdsWestbound = [
  "place-north",
  "place-kencl",
  "place-cool",
  "place-clmnl",
];
const stationSpacingRatios = [1.0, 1.0, 1.0, 1.0];
const stationIdsEastbound = reverse(stationIdsWestbound);

const stationIdsEastboundM = [
  "place-matt",
  "place-capst",
  "place-cenav",
  "place-asmnl",
];

const cTrainFactory = trainLocFactory.params({ routeId: "Green-C" });
const matTrainFactory = trainLocFactory.params({ routeId: "Mattapan" });

describe("trainHeights", () => {
  test("westbound before top station doesn't show", () => {
    const trainLoc: TrainLoc = cTrainFactory.build({
      consist: ["3900"],
      directionId: DirectionId.Westbound,
      stationId: "place-north",
      stopStatus: StopStatus.InTransitTo,
    });
    expect(
      trainHeights(
        [trainLoc],
        40,
        0,
        stationIdsWestbound,
        stationSpacingRatios,
        byId(DEMO_C_STATIONS),
      ),
    ).toEqual([]);
  });

  test("westbound at top station", () => {
    const trainLoc: TrainLoc = cTrainFactory.build({
      consist: ["3900"],
      directionId: DirectionId.Westbound,
      stationId: "place-north",
      stopStatus: StopStatus.StoppedAt,
    });
    const [result]: TrainWithHeights[] = trainHeights(
      [trainLoc],
      40,
      0,
      stationIdsWestbound,
      stationSpacingRatios,
      byId(DEMO_B_STATIONS),
    );
    expect(result.dotPx).toEqual(0);
  });

  test("westbound between middle stations", () => {
    const trainLoc: TrainLoc = cTrainFactory.build({
      consist: ["3900"],
      directionId: DirectionId.Westbound,
      stationId: "place-cool",
      stopStatus: StopStatus.InTransitTo,
    });
    const [result]: TrainWithHeights[] = trainHeights(
      [trainLoc],
      40,
      0,
      stationIdsWestbound,
      stationSpacingRatios,
      byId(DEMO_C_STATIONS),
    );
    expect(result.dotPx).toBeWithinRange(41, 79);
  });

  test("westbound at middle station", () => {
    const trainLoc: TrainLoc = cTrainFactory.build({
      consist: ["3900"],
      directionId: DirectionId.Westbound,
      stationId: "place-cool",
      stopStatus: StopStatus.StoppedAt,
    });
    const [result]: TrainWithHeights[] = trainHeights(
      [trainLoc],
      40,
      0,
      stationIdsWestbound,
      stationSpacingRatios,
      byId(DEMO_C_STATIONS),
    );
    expect(result.dotPx).toEqual(80);
  });

  test("westbound before bottom station", () => {
    const trainLoc: TrainLoc = cTrainFactory.build({
      consist: ["3900"],
      directionId: DirectionId.Westbound,
      stationId: "place-clmnl",
      stopStatus: StopStatus.InTransitTo,
    });
    const [result]: TrainWithHeights[] = trainHeights(
      [trainLoc],
      40,
      0,
      stationIdsWestbound,
      stationSpacingRatios,
      byId(DEMO_C_STATIONS),
    );
    expect(result.dotPx).toBeWithinRange(81, 119);
  });

  test("westbound at bottom station", () => {
    const trainLoc: TrainLoc = cTrainFactory.build({
      consist: ["3900"],
      directionId: DirectionId.Westbound,
      stationId: "place-clmnl",
      stopStatus: StopStatus.StoppedAt,
    });
    const [result]: TrainWithHeights[] = trainHeights(
      [trainLoc],
      40,
      0,
      stationIdsWestbound,
      stationSpacingRatios,
      byId(DEMO_C_STATIONS),
    );
    expect(result.dotPx).toEqual(120);
  });

  test("eastbound before bottom station doesn't show", () => {
    const trainLoc: TrainLoc = cTrainFactory.build({
      consist: ["3900"],
      directionId: DirectionId.Eastbound,
      stationId: "place-clmnl",
      stopStatus: StopStatus.InTransitTo,
    });
    expect(
      trainHeights(
        [trainLoc],
        40,
        1,
        stationIdsEastbound,
        stationSpacingRatios,
        byId(DEMO_C_STATIONS),
      ),
    ).toEqual([]);
  });

  test("eastbound before Mattapan shows", () => {
    const trainLoc: TrainLoc = matTrainFactory.build({
      consist: ["3234"],
      directionId: DirectionId.Eastbound,
      stationId: "place-matt",
      stopStatus: StopStatus.InTransitTo,
    });
    const [result] = trainHeights(
      [trainLoc],
      40,
      1,
      stationIdsEastboundM,
      stationSpacingRatios,
      byId(DEMO_C_STATIONS),
    );
    expect(result.dotPx).toEqual(120);
  });

  test("eastbound at bottom station", () => {
    const trainLoc: TrainLoc = cTrainFactory.build({
      consist: ["3900"],
      directionId: DirectionId.Eastbound,
      stationId: "place-clmnl",
      stopStatus: StopStatus.StoppedAt,
    });
    const [result]: TrainWithHeights[] = trainHeights(
      [trainLoc],
      40,
      1,
      stationIdsEastbound,
      stationSpacingRatios,
      byId(DEMO_C_STATIONS),
    );
    expect(result.dotPx).toEqual(120);
  });

  test("eastbound before middle station", () => {
    const trainLoc: TrainLoc = cTrainFactory.build({
      consist: ["3900"],
      directionId: DirectionId.Eastbound,
      stationId: "place-cool",
      stopStatus: StopStatus.InTransitTo,
    });
    const [result]: TrainWithHeights[] = trainHeights(
      [trainLoc],
      40,
      1,
      stationIdsEastbound,
      stationSpacingRatios,
      byId(DEMO_C_STATIONS),
    );
    expect(result.dotPx).toBeWithinRange(81, 119);
  });

  test("eastbound at middle station", () => {
    const trainLoc: TrainLoc = cTrainFactory.build({
      consist: ["3900"],
      directionId: DirectionId.Eastbound,
      stationId: "place-cool",
      stopStatus: StopStatus.StoppedAt,
    });
    const [result]: TrainWithHeights[] = trainHeights(
      [trainLoc],
      40,
      1,
      stationIdsEastbound,
      stationSpacingRatios,
      byId(DEMO_C_STATIONS),
    );
    expect(result.dotPx).toEqual(80);
  });

  test("eastbound before top station", () => {
    const trainLoc: TrainLoc = cTrainFactory.build({
      consist: ["3900"],
      directionId: DirectionId.Eastbound,
      stationId: "place-north",
      stopStatus: StopStatus.InTransitTo,
    });
    const [result]: TrainWithHeights[] = trainHeights(
      [trainLoc],
      40,
      1,
      stationIdsEastbound,
      stationSpacingRatios,
      byId(DEMO_C_STATIONS),
    );
    expect(result.dotPx).toBeWithinRange(0, 39);
  });

  test("eastbound at top station", () => {
    const trainLoc: TrainLoc = cTrainFactory.build({
      consist: ["3900"],
      directionId: DirectionId.Eastbound,
      stationId: "place-north",
      stopStatus: StopStatus.StoppedAt,
    });
    const [result]: TrainWithHeights[] = trainHeights(
      [trainLoc],
      40,
      1,
      stationIdsEastbound,
      stationSpacingRatios,
      byId(DEMO_C_STATIONS),
    );
    expect(result.dotPx).toEqual(0);
  });

  test("westbound overlapping trains are sorted by timestamp", () => {
    const trainLocs: TrainLoc[] = [
      cTrainFactory.build({
        consist: ["3901"],
        directionId: DirectionId.Westbound,
        stationId: "place-cool",
        stopStatus: StopStatus.StoppedAt,
        timestamp: dateTimeFromUnix(101),
      }),
      cTrainFactory.build({
        consist: ["3902"],
        directionId: DirectionId.Westbound,
        stationId: "place-cool",
        stopStatus: StopStatus.StoppedAt,
        timestamp: dateTimeFromUnix(102),
      }),
    ];
    const result: TrainWithHeights[] = trainHeights(
      trainLocs,
      40,
      0,
      stationIdsWestbound,
      stationSpacingRatios,
      byId(DEMO_C_STATIONS),
    );
    const [train1, train2] =
      result[0].consist[0] === "3901" ? result : reverse(result);
    expect(train1).toMatchObject({
      routeId: "Green-C",
      consist: ["3901"],
      directionId: DirectionId.Westbound,
      dotPx: 80,
    });
    expect(train2).toMatchObject({
      routeId: "Green-C",
      consist: ["3902"],
      directionId: DirectionId.Westbound,
      dotPx: 80,
    });
    expect(train1.labelPx).toBeGreaterThan(train2.labelPx);
  });

  test("eastbound overlapping trains are sorted by timestamp", () => {
    const trainLocs: TrainLoc[] = [
      cTrainFactory.build({
        consist: ["3901"],
        directionId: DirectionId.Eastbound,
        stationId: "place-cool",
        stopStatus: StopStatus.StoppedAt,
        timestamp: dateTimeFromUnix(101),
      }),
      cTrainFactory.build({
        consist: ["3902"],
        directionId: DirectionId.Eastbound,
        stationId: "place-cool",
        stopStatus: StopStatus.StoppedAt,
        timestamp: dateTimeFromUnix(102),
      }),
    ];
    const result: TrainWithHeights[] = trainHeights(
      trainLocs,
      40,
      1,
      stationIdsEastbound,
      stationSpacingRatios,
      byId(DEMO_C_STATIONS),
    );
    const [train1, train2] =
      result[0].consist[0] === "3901" ? result : reverse(result);
    expect(train1).toMatchObject({
      routeId: "Green-C",
      consist: ["3901"],
      directionId: DirectionId.Eastbound,
      dotPx: 80,
    });
    expect(train2).toMatchObject({
      routeId: "Green-C",
      consist: ["3902"],
      directionId: DirectionId.Eastbound,
      dotPx: 80,
    });
    expect(train1.labelPx).toBeLessThan(train2.labelPx);
  });
});
