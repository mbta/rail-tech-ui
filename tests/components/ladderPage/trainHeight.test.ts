import {
  trainHeights,
  TrainWithHeights,
  willTrainShowOnRouteLadder,
} from "src/components/ladderPage/trainHeight";
import { DirectionId } from "src/models/route";
import { StopStatus, TrainLoc } from "src/models/trainLocation";
import { reverse } from "src/util/array";
import { dateTimeFromUnix } from "src/util/dateTime";
import { trainLocFactory } from "tests/testHelpers/factory";

const stationIdsWestbound = [
  "place-north",
  "place-kencl",
  "place-cool",
  "place-clmnl",
];
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
    expect(trainHeights([trainLoc], 40, 0, stationIdsWestbound)).toEqual([]);
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
    expect(trainHeights([trainLoc], 40, 1, stationIdsEastbound)).toEqual([]);
  });

  test("eastbound before Mattapan shows", () => {
    const trainLoc: TrainLoc = matTrainFactory.build({
      consist: ["3234"],
      directionId: DirectionId.Eastbound,
      stationId: "place-matt",
      stopStatus: StopStatus.InTransitTo,
    });
    const [result] = trainHeights([trainLoc], 40, 1, stationIdsEastboundM);
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

describe("willTrainShowOnRouteLadder", () => {
  const factory = trainLocFactory.params({
    consist: ["3901"],
    routeId: "Green-B",
    directionId: DirectionId.Westbound,
  });

  test("a normal train will", () => {
    const train: TrainLoc = factory.build({
      stationId: "place-hymnl",
      stopStatus: StopStatus.InTransitTo,
    });
    expect(willTrainShowOnRouteLadder(train)).toBe(true);
  });

  test("a next-stop-unknown train won't", () => {
    const train: TrainLoc = factory.build({
      stationId: null,
      stopStatus: StopStatus.InTransitTo,
    });
    expect(willTrainShowOnRouteLadder(train)).toBe(false);
  });

  test("a train before the start of its route won't", () => {
    const train: TrainLoc = factory.build({
      stationId: "place-gover",
      stopStatus: StopStatus.InTransitTo,
    });
    expect(willTrainShowOnRouteLadder(train)).toBe(false);
  });

  test("a train at a stop with no position will", () => {
    const train: TrainLoc = factory.build({
      stationId: "place-hymnl",
      stopStatus: StopStatus.StoppedAt,
      latLng: null,
    });
    expect(willTrainShowOnRouteLadder(train)).toBe(true);
  });

  test("a train between stops with no position won't", () => {
    const train: TrainLoc = factory.build({
      stationId: "place-hymnl",
      stopStatus: StopStatus.InTransitTo,
      latLng: null,
    });
    expect(willTrainShowOnRouteLadder(train)).toBe(false);
  });
});
