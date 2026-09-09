import { render, waitFor } from "@testing-library/react";
import { Ladder } from "src/components/ladderPage/ladder";
import { CarId } from "src/data";
import { DirectionId } from "src/models/route";
import { StopStatus, TrainLoc } from "src/models/trainLocation";
import { scrollTo } from "src/util/browser";
import { trainLocFactory } from "tests/testHelpers/factory";
import {
  DEMO_B_STATIONS,
  DEMO_C_STATIONS,
  DEMO_E_STATIONS,
  DEMO_RL_STATIONS,
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
        trainsClickable={true}
        zoom={40}
        labelMode="lead"
        trainLocs={[]}
        stationSelection={null}
        scrollToConsist={null}
        highlight={null}
        onVehicleSelection={jest.fn()}
        setStationSelection={jest.fn()}
        eastToWestStations={DEMO_C_STATIONS}
        getInitialPredictionsDirection={getInitialPredictionsDirection}
        letterFn={() => "A"}
        routeColorFn={() => "branch-color-light-rail-e-branch"}
      />,
    );
    expect(view.getByText("Coolidge Cnr")).toBeInTheDocument();
  });

  test("station for open predictions is highlighted", () => {
    const view = render(
      <Ladder
        trainsClickable={true}
        zoom={40}
        labelMode="lead"
        trainLocs={[]}
        stationSelection={{
          stationId: "place-kencl",
          directionId: DirectionId.Westbound,
        }}
        scrollToConsist={null}
        highlight={null}
        onVehicleSelection={jest.fn()}
        setStationSelection={jest.fn()}
        eastToWestStations={DEMO_C_STATIONS}
        letterFn={() => "A"}
        routeColorFn={() => "branch-color-light-rail-e-branch"}
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
        trainsClickable={true}
        zoom={40}
        labelMode="lead"
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
        highlight={null}
        onVehicleSelection={jest.fn()}
        setStationSelection={jest.fn()}
        eastToWestStations={DEMO_E_STATIONS}
        letterFn={() => "A"}
        routeColorFn={() => "branch-color-light-rail-e-branch"}
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

  test("shows trains with consist remap", () => {
    const view = render(
      <Ladder
        trainsClickable={true}
        zoom={40}
        labelMode="lead"
        labelRemap={(car: CarId) => {
          return "2" + car.slice(1);
        }}
        trainLocs={[
          trainLocFactory.build({
            consist: ["1747", "1746", "1732", "1733", "1507", "1506"],
            directionId: DirectionId.Westbound,
            stationId: "place-brdwy",
          }),
        ]}
        stationSelection={null}
        scrollToConsist={null}
        highlight={null}
        onVehicleSelection={jest.fn()}
        setStationSelection={jest.fn()}
        eastToWestStations={DEMO_RL_STATIONS}
        letterFn={() => "A"}
        routeColorFn={() => "branch-color-heavy-rail-ashmont"}
        getInitialPredictionsDirection={getInitialPredictionsDirection}
      />,
    );
    expect(view.getByRole("button", { name: /2747/ })).toBeInTheDocument();
  });

  test("doesn't show train on other branch", () => {
    const view = render(
      <Ladder
        trainsClickable={true}
        zoom={40}
        labelMode="lead"
        trainLocs={[
          trainLocFactory.build({
            consist: ["3701", "3702"],
            routeId: "Green-E",
            stationId: "place-nuniv",
          }),
        ]}
        stationSelection={null}
        scrollToConsist={null}
        highlight={null}
        onVehicleSelection={jest.fn()}
        setStationSelection={jest.fn()}
        eastToWestStations={DEMO_B_STATIONS}
        letterFn={() => "A"}
        routeColorFn={() => "branch-color-light-rail-e-branch"}
        getInitialPredictionsDirection={getInitialPredictionsDirection}
      />,
    );
    expect(
      view.queryByRole("button", { name: /3701/ }),
    ).not.toBeInTheDocument();
  });

  test("scrolling to trains based on hash", async () => {
    const onSearchResultTimeout = jest.fn();

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
        trainsClickable={true}
        zoom={80}
        labelMode="lead"
        trainLocs={trainLocs}
        stationSelection={null}
        scrollToConsist={["3701", "3702"]}
        highlight={null}
        onSearchResultTimeout={onSearchResultTimeout}
        onVehicleSelection={jest.fn()}
        setStationSelection={jest.fn()}
        eastToWestStations={DEMO_E_STATIONS}
        letterFn={() => "A"}
        routeColorFn={() => "branch-color-light-rail-e-branch"}
        getInitialPredictionsDirection={getInitialPredictionsDirection}
      />,
    );
    await waitFor(() => expect(scrollTo).toHaveBeenCalledTimes(1));
    expect(onSearchResultTimeout).not.toHaveBeenCalled();
  });

  test("highlights trains", () => {
    const trainLocs: TrainLoc[] = [
      trainLocFactory.build({
        consist: ["3701", "3802"],
        routeId: "Green-E",
        stationId: "place-gover",
      }),
      trainLocFactory.build({
        consist: ["3900", "3901"],
        routeId: "Green-E",
        stationId: "place-pktrm",
      }),
    ];
    const view = render(
      <Ladder
        trainsClickable={true}
        zoom={80}
        labelMode="lead"
        trainLocs={trainLocs}
        stationSelection={null}
        scrollToConsist={null}
        highlight={["3701", "3802"]}
        onSearchResultTimeout={jest.fn()}
        onVehicleSelection={jest.fn()}
        setStationSelection={jest.fn()}
        eastToWestStations={DEMO_E_STATIONS}
        letterFn={() => "E"}
        routeColorFn={() => "branch-color-light-rail-e-branch"}
        getInitialPredictionsDirection={getInitialPredictionsDirection}
      />,
    );
    expect(view.getByRole("button", { name: /3900/ })).not.toHaveClass(
      "z-object",
    );
    expect(view.getByRole("button", { name: /3701/ })).toHaveClass("z-object");
  });
});
