import { render, waitFor } from "@testing-library/react";
import { Ladder } from "src/components/ladderPage/ladder";
import { DirectionId } from "src/models/route";
import { StopStatus, TrainLoc } from "src/models/trainLocation";
import { scrollTo } from "src/util/browser";
import { LR_COLORS } from "tests/testHelpers/colors";
import { trainLocFactory } from "tests/testHelpers/factory";
import {
  DEMO_B_STATIONS,
  DEMO_C_STATIONS,
  DEMO_E_STATIONS,
} from "tests/testHelpers/stops";

jest.mock("src/util/browser", () => ({
  __esModule: true,
  scrollTo: jest.fn(),
}));

const getInitialPredictionsDirection = () => DirectionId.Eastbound;

describe("Ladder", () => {
  test("shows station names", () => {
    const view = render(
      <Ladder
        zoom={40}
        trainLocs={[]}
        stationSelection={null}
        scrollToConsist={null}
        setVehicleSelection={jest.fn()}
        setStationSelection={jest.fn()}
        eastToWestStations={DEMO_C_STATIONS}
        getInitialPredictionsDirection={getInitialPredictionsDirection}
        routeColors={LR_COLORS}
      />,
    );
    expect(view.getByText("Coolidge Cnr")).toBeInTheDocument();
  });

  test("station for open predictions is highlighted", () => {
    const view = render(
      <Ladder
        zoom={40}
        trainLocs={[]}
        stationSelection={{
          stationId: "place-kencl",
          directionId: DirectionId.Westbound,
        }}
        scrollToConsist={null}
        setVehicleSelection={jest.fn()}
        setStationSelection={jest.fn()}
        eastToWestStations={DEMO_C_STATIONS}
        routeColors={LR_COLORS}
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
    const view = render(
      <Ladder
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
        eastToWestStations={DEMO_E_STATIONS}
        routeColors={LR_COLORS}
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
    const view = render(
      <Ladder
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
        eastToWestStations={DEMO_B_STATIONS}
        routeColors={LR_COLORS}
        getInitialPredictionsDirection={getInitialPredictionsDirection}
      />,
    );
    expect(
      view.queryByRole("button", { name: /3701/ }),
    ).not.toBeInTheDocument();
  });

  test("scrolling to trains based on hash", async () => {
    const onSearchResultAcknowledged = jest.fn();

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
        zoom={80}
        trainLocs={trainLocs}
        stationSelection={null}
        scrollToConsist={["3701", "3702"]}
        onSearchResultAcknowledged={onSearchResultAcknowledged}
        setVehicleSelection={jest.fn()}
        setStationSelection={jest.fn()}
        eastToWestStations={DEMO_E_STATIONS}
        routeColors={LR_COLORS}
        getInitialPredictionsDirection={getInitialPredictionsDirection}
      />,
    );
    await waitFor(() => expect(scrollTo).toHaveBeenCalledTimes(1));
    expect(onSearchResultAcknowledged).not.toHaveBeenCalled();
  });
});
