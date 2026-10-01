import { fireEvent, render, waitFor, within } from "@testing-library/react";
import { Ladder, PillAccessoryProps } from "src/components/ladderPage/ladder";
import { CarId } from "src/data";
import { DirectionId } from "src/models/route";
import { Station } from "src/models/stop";
import { StopStatus, TrainLoc } from "src/models/trainLocation";
import { scrollTo } from "src/util/browser";
import { trainLocFactory } from "tests/testHelpers/factory";
import {
  DEMO_B_STATIONS,
  DEMO_C_STATIONS,
  DEMO_E_STATIONS,
  DEMO_RL_STATIONS,
  buildStation,
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
    const kenmoreItem = within(station.closest("li") as HTMLElement);
    const westboundStop = kenmoreItem.getByTestId(
      "ladder-station-dot-westbound",
    );
    const eastboundStop = kenmoreItem.getByTestId(
      "ladder-station-dot-eastbound",
    );
    const highlightedClass = "dark:bg-glides-gray-200";
    expect(station).toHaveClass(highlightedClass);
    expect(westboundStop).toHaveClass(highlightedClass);
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

  test("renders customizable accessories on applicable trains", () => {
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
    const renderAccessory = ({ trainLoc }: PillAccessoryProps) => {
      if (trainLoc.consist.includes("3701")) {
        return <div>{trainLoc.stationId}</div>;
      }
      return null;
    };
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
        renderAccessoryForTrainLoc={renderAccessory}
      />,
    );
    expect(view.getByText("place-gover")).toBeInTheDocument();
    expect(view.queryByText("place-pktrm")).not.toBeInTheDocument();
  });

  describe("station display options", () => {
    const westboundDotTestId = "ladder-station-dot-westbound";
    const eastboundDotTestId = "ladder-station-dot-eastbound";

    const station = (overrides: Partial<Station> = {}): Station => ({
      ...buildStation("place-kencl", "Kenmore", 42.348949, -71.095169),
      ...overrides,
    });

    const renderStations = (
      stations: Station[],
      setStationSelection: jest.Mock = jest.fn(),
    ) =>
      render(
        <Ladder
          trainsClickable={true}
          zoom={40}
          labelMode="lead"
          trainLocs={[]}
          stationSelection={null}
          scrollToConsist={null}
          highlight={null}
          onVehicleSelection={jest.fn()}
          setStationSelection={setStationSelection}
          eastToWestStations={stations}
          letterFn={() => "A"}
          routeColorFn={() => "branch-color-light-rail-e-branch"}
          getInitialPredictionsDirection={getInitialPredictionsDirection}
        />,
      );

    const getStationItem = (
      container: HTMLElement,
      stationId: string,
    ): HTMLElement => {
      const item = container.querySelector<HTMLElement>(
        `#id-ladder__station--${stationId}`,
      );
      if (item === null) {
        throw new Error(`No ladder station item for ${stationId}`);
      }
      return item;
    };

    const getButtons = (item: HTMLElement): HTMLButtonElement[] =>
      Array.from(item.querySelectorAll("button"));

    const getArrows = (item: HTMLElement): HTMLElement[] =>
      within(item).queryAllByTestId(/^ladder-station-arrow-/);

    const getDots = (item: HTMLElement): HTMLElement[] =>
      within(item).queryAllByTestId(/^ladder-station-dot-/);

    describe("showName", () => {
      test.each([
        ["undefined", undefined],
        ["true", true],
      ])("shows the station name when showName is %s", (_, showName) => {
        const view = renderStations([station({ showName })]);
        expect(view.getByRole("button", { name: "Kenmore" })).toBeVisible();
      });

      test("hides the station name when showName is false", () => {
        const view = renderStations([station({ showName: false })]);
        expect(view.queryByText("Kenmore")).not.toBeInTheDocument();

        const [nameButton] = getButtons(
          getStationItem(view.container, "place-kencl"),
        );
        expect(nameButton).toBeInTheDocument();
        expect(nameButton).toHaveTextContent("");
      });
    });

    describe("showDots", () => {
      test.each([
        ["undefined", undefined],
        ["true", true],
      ])("shows both stop dots when showDots is %s", (_, showDots) => {
        const view = renderStations([station({ showDots })]);
        const item = getStationItem(view.container, "place-kencl");
        expect(getDots(item)).toHaveLength(2);
        expect(within(item).getByTestId(westboundDotTestId)).toBeVisible();
        expect(within(item).getByTestId(eastboundDotTestId)).toBeVisible();
      });

      test("hides both stop dots when showDots is false", () => {
        const view = renderStations([station({ showDots: false })]);
        const item = getStationItem(view.container, "place-kencl");
        expect(getDots(item)).toHaveLength(0);
        expect(
          within(item).getByRole("button", { name: "Kenmore" }),
        ).toBeVisible();
      });

      test.each([
        ["westbound", westboundDotTestId, DirectionId.Westbound],
        ["eastbound", eastboundDotTestId, DirectionId.Eastbound],
      ])("%s dot selects that direction", (_, testId, expectedDirectionId) => {
        const setStationSelection = jest.fn();
        const view = renderStations([station()], setStationSelection);
        fireEvent.click(view.getByTestId(testId));
        expect(setStationSelection).toHaveBeenCalledWith({
          stationId: "place-kencl",
          directionId: expectedDirectionId,
        });
      });

      test("only affects the station it is set on", () => {
        const view = renderStations([
          station({ showDots: false }),
          buildStation("place-hwsst", "Hawes Street", 42.344906, -71.111145),
        ]);
        expect(
          getDots(getStationItem(view.container, "place-kencl")),
        ).toHaveLength(0);
        expect(
          getDots(getStationItem(view.container, "place-hwsst")),
        ).toHaveLength(2);
      });
    });

    describe("arrows", () => {
      test("renders no arrows by default", () => {
        const view = renderStations([station()]);
        expect(
          getArrows(getStationItem(view.container, "place-kencl")),
        ).toHaveLength(0);
      });

      test.each<{
        side: "arrowLeft" | "arrowRight";
        direction: "up" | "down";
        testId: string;
      }>([
        {
          side: "arrowLeft",
          direction: "up",
          testId: "ladder-station-arrow-left-up",
        },
        {
          side: "arrowLeft",
          direction: "down",
          testId: "ladder-station-arrow-left-down",
        },
        {
          side: "arrowRight",
          direction: "up",
          testId: "ladder-station-arrow-right-up",
        },
        {
          side: "arrowRight",
          direction: "down",
          testId: "ladder-station-arrow-right-down",
        },
      ])(
        "$side: $direction renders a single $direction arrow on that side",
        ({ side, direction, testId }) => {
          const view = renderStations([station({ [side]: direction })]);
          const item = getStationItem(view.container, "place-kencl");
          const arrows = getArrows(item);
          expect(arrows).toHaveLength(1);
          expect(arrows[0]).toHaveAttribute("data-testid", testId);
        },
      );

      test.each<["up" | "down", "up" | "down"]>([
        ["up", "up"],
        ["up", "down"],
        ["down", "up"],
        ["down", "down"],
      ])(
        "renders both arrows when arrowLeft is %s and arrowRight is %s",
        (arrowLeft, arrowRight) => {
          const view = renderStations([station({ arrowLeft, arrowRight })]);
          const item = getStationItem(view.container, "place-kencl");
          expect(getArrows(item)).toHaveLength(2);
          expect(
            within(item).getByTestId(`ladder-station-arrow-left-${arrowLeft}`),
          ).toBeInTheDocument();
          expect(
            within(item).getByTestId(
              `ladder-station-arrow-right-${arrowRight}`,
            ),
          ).toBeInTheDocument();
        },
      );

      test("arrows render alongside hidden name and dots", () => {
        const view = renderStations([
          station({
            showName: false,
            showDots: false,
            arrowLeft: "down",
            arrowRight: "up",
          }),
        ]);
        const item = getStationItem(view.container, "place-kencl");
        expect(getArrows(item)).toHaveLength(2);
        expect(getDots(item)).toHaveLength(0);
        expect(view.queryByText("Kenmore")).not.toBeInTheDocument();
      });
    });
  });
});
