import { render, waitFor } from "@testing-library/react";
import {
  Ladder,
  trainAlignsWithSegment,
} from "src/components/ladderPage/ladder";
import { stationIdsOnSegmentInDirection } from "src/data/stops";
import { DirectionId } from "src/models/route";
import { StopStatus, TrainLoc } from "src/models/trainLocation";
import { scrollTo } from "src/util/browser";
import { trainLocFactory } from "tests/testHelpers/factory";

jest.mock("src/util/browser", () => ({
  __esModule: true,
  scrollTo: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useNavigate: jest.fn(),
}));

const getInitialPredictionsDirection = () => DirectionId.Eastbound;

describe("Ladder", () => {
  test("shows station names", () => {
    const eastToWestStationIds = stationIdsOnSegmentInDirection("d", 0);
    const westToEastStationIds = stationIdsOnSegmentInDirection("d", 1);

    const view = render(
      <Ladder
        segment={"d"}
        zoom={40}
        trainLocs={[]}
        stationSelection={null}
        scrollToConsist={null}
        setVehicleSelection={jest.fn()}
        setStationSelection={jest.fn()}
        eastToWestStationIds={eastToWestStationIds}
        westToEastStationIds={westToEastStationIds}
        getInitialPredictionsDirection={getInitialPredictionsDirection}
      />,
    );
    expect(view.getByText("Kenmore")).toBeInTheDocument();
  });

  test("station for open predictions is highlighted", () => {
    const eastToWestStationIds = stationIdsOnSegmentInDirection("subway", 0);
    const westToEastStationIds = stationIdsOnSegmentInDirection("subway", 1);

    const view = render(
      <Ladder
        segment={"subway"}
        zoom={40}
        trainLocs={[]}
        stationSelection={{
          stationId: "place-kencl",
          directionId: DirectionId.Westbound,
        }}
        scrollToConsist={null}
        setVehicleSelection={jest.fn()}
        setStationSelection={jest.fn()}
        eastToWestStationIds={eastToWestStationIds}
        westToEastStationIds={westToEastStationIds}
        getInitialPredictionsDirection={getInitialPredictionsDirection}
      />,
    );
    const station = view.getByText("Kenmore");
    // eslint-disable-next-line -- no way to select these buttons via getByX
    const [, westboundStop, eastboundStop] = station.parentNode!.children;
    const highlightedClass = "dark:bg-glides-gray-200";
    const westboundClass = "left-[-12.6px]";
    const eastboundClass = "right-[-12.6px]";
    expect(station).toHaveClass(highlightedClass);
    expect(westboundStop).toHaveClass(westboundClass, highlightedClass);
    expect(eastboundStop).toHaveClass(eastboundClass);
    expect(eastboundStop).not.toHaveClass(highlightedClass);
  });

  test("shows trains", () => {
    const eastToWestStationIds = stationIdsOnSegmentInDirection("e", 0);
    const westToEastStationIds = stationIdsOnSegmentInDirection("e", 1);

    const view = render(
      <Ladder
        segment={"e"}
        zoom={40}
        trainLocs={[
          trainLocFactory.build({
            consist: ["3701", "3702"],
            directionId: DirectionId.Westbound,
            stationId: "place-boyls",
          }),
          trainLocFactory.build({
            consist: ["3703", "3704"],
            directionId: DirectionId.Eastbound,
            stationId: "place-haecl",
          }),
        ]}
        stationSelection={null}
        scrollToConsist={null}
        setVehicleSelection={jest.fn()}
        setStationSelection={jest.fn()}
        eastToWestStationIds={eastToWestStationIds}
        westToEastStationIds={westToEastStationIds}
        getInitialPredictionsDirection={getInitialPredictionsDirection}
      />,
    );
    const westboundClass = "left-0";
    const eastboundClass = "right-0";
    expect(view.getByRole("button", { name: /3701/ })).toBeContainedWithClass(
      westboundClass,
    );
    expect(view.getByRole("button", { name: /3703/ })).toBeContainedWithClass(
      eastboundClass,
    );
  });

  test("doesn't show train on other branch", () => {
    const eastToWestStationIds = stationIdsOnSegmentInDirection("d", 0);
    const westToEastStationIds = stationIdsOnSegmentInDirection("d", 1);

    const view = render(
      <Ladder
        segment={"d"}
        zoom={40}
        trainLocs={[
          trainLocFactory.build({
            consist: ["3701", "3702"],
            routeId: "Green-E",
            stationId: "place-nuniv",
          }),
        ]}
        stationSelection={null}
        scrollToConsist={null}
        setVehicleSelection={jest.fn()}
        setStationSelection={jest.fn()}
        eastToWestStationIds={eastToWestStationIds}
        westToEastStationIds={westToEastStationIds}
        getInitialPredictionsDirection={getInitialPredictionsDirection}
      />,
    );
    expect(
      view.queryByRole("button", { name: /3701/ }),
    ).not.toBeInTheDocument();
  });

  test("scrolling to trains based on hash", async () => {
    const eastToWestStationIds = stationIdsOnSegmentInDirection("e", 0);
    const westToEastStationIds = stationIdsOnSegmentInDirection("e", 1);

    const trainLocs: TrainLoc[] = [
      trainLocFactory.build({
        consist: ["3701", "3702"],
        routeId: "Green-E",
        stationId: "place-gover",
      }),
      trainLocFactory.build({
        consist: ["3703", "3704"],
        routeId: "Green-E",
        stationId: "place-pktrm",
      }),
    ];
    render(
      <Ladder
        segment="e"
        zoom={80}
        trainLocs={trainLocs}
        stationSelection={null}
        scrollToConsist={["3701", "3702"]}
        setVehicleSelection={jest.fn()}
        setStationSelection={jest.fn()}
        eastToWestStationIds={eastToWestStationIds}
        westToEastStationIds={westToEastStationIds}
        getInitialPredictionsDirection={getInitialPredictionsDirection}
      />,
    );
    await waitFor(() => expect(scrollTo).toHaveBeenCalledTimes(1));
  });
});

describe("trainAlignsWithSegment", () => {
  test("segment for the same route", () => {
    const trainLoc = trainLocFactory.build({
      routeId: "Green-D",
      directionId: DirectionId.Westbound,
      stationId: "place-longw",
      stopStatus: StopStatus.StoppedAt,
    });
    expect(trainAlignsWithSegment(trainLoc, "d")).toBe(true);
  });

  test("on subway, not moving", () => {
    const trainLoc = trainLocFactory.build({
      routeId: "Green-C",
      directionId: DirectionId.Westbound,
      stationId: "place-armnl",
      stopStatus: StopStatus.StoppedAt,
    });
    expect(trainAlignsWithSegment(trainLoc, "subway")).toBe(true);
  });

  test("moving along subway", () => {
    const trainLoc = trainLocFactory.build({
      routeId: "Green-B",
      directionId: DirectionId.Westbound,
      stationId: "place-coecl",
      stopStatus: StopStatus.InTransitTo,
    });
    expect(trainAlignsWithSegment(trainLoc, "subway")).toBe(true);
  });

  test("moving, almost off subway", () => {
    const trainLoc = trainLocFactory.build({
      routeId: "Green-E",
      directionId: DirectionId.Westbound,
      stationId: "place-coecl",
      stopStatus: StopStatus.InTransitTo,
    });
    expect(trainAlignsWithSegment(trainLoc, "subway")).toBe(true);
  });

  test("Don't show E train on subway as it approaches Copley Eastbound", () => {
    const comingIntoCopley = trainLocFactory.build({
      routeId: "Green-E",
      directionId: DirectionId.Eastbound,
      stationId: "place-coecl",
      stopStatus: StopStatus.InTransitTo,
    });
    expect(trainAlignsWithSegment(comingIntoCopley, "subway")).toBe(false);
    expect(trainAlignsWithSegment(comingIntoCopley, "e")).toBe(true);
    const boardingAtCopley = trainLocFactory.build({
      routeId: "Green-E",
      directionId: DirectionId.Eastbound,
      stationId: "place-coecl",
      stopStatus: StopStatus.StoppedAt,
    });
    expect(trainAlignsWithSegment(boardingAtCopley, "subway")).toBe(true);
  });

  test("Subway ladder shows non-E trains past North Station", () => {
    const trainLoc = trainLocFactory.build({
      routeId: "Green-C",
      directionId: DirectionId.Westbound,
      stationId: "place-spmnl",
      stopStatus: StopStatus.InTransitTo,
    });
    expect(trainAlignsWithSegment(trainLoc, "subway")).toBe(true);
  });
});
