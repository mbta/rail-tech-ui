import {
  ReactElement,
  createContext,
  useContext,
  useRef,
  useEffect,
  SetStateAction,
  Dispatch,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { LadderLabel } from "src/components/ladderPage/ladderLabel";
import { Consist, consistEq, consistToString } from "src/data";
import {
  DirectionId,
  directionIdToString,
  routeIdToSegment,
  Segment,
} from "src/models/route";
import { StationId, stationShortName } from "src/models/stop";
import { StopStatus, TrainLoc } from "src/models/trainLocation";
import { isTripRevenue } from "src/models/trainsheet";
import { scrollTo } from "src/util/browser";
import { routeColorClass } from "src/util/cssNaming";
import { className } from "src/util/dom";
import { StationSelection, VehicleSelection } from "./types";
import { TrainWithHeights, trainHeights } from "./trainHeight";

/**
 * x-component of the length of the connector between the dot and label.
 * lso how far the label is from the track.
 * Measured to the center of the route letter in the train label.
 */
const connectorLength = 40;

/**
 * Stroke width of the line connecting the label and dot
 */
const connectorWidth = 3;

/**
 * The distance away from the center of the route letter where we stop the connector
 *
 * The calculations for where to draw the connector and train label are based on the center of the route circle
 * The connector must be drawn on top of the label to show over the label's dark background.
 * In order to avoid drawing on top of and obscuring the route letter, we shorten the line by this much.
 *
 * The route circle's diameter is specified by <RouteLetter header={false}> in trainLabel.tsx
 * This value should be slightly smaller than that circle's radius.
 * If it's too small, the connector will overlap the route letter.
 * If it's too big, there could be a gap between the connector and the route cirlce.
 */
const routeLetterRadius = 12;

const ScrollToConsistContext = createContext<Consist | null>(null);

type StationConfig = {
  id: string;
  spacingRatio: number;
};

export const Ladder = ({
  segment,
  zoom,
  trainLocs,
  stationSelection,
  scrollToConsist,
  setVehicleSelection,
  setStationSelection,
  eastToWestStationConfigs,
  getInitialPredictionsDirection,
  alignsWithSegment,
}: {
  segment: Segment;
  zoom: number;
  trainLocs: TrainLoc[];
  stationSelection: StationSelection | null;
  scrollToConsist: Consist | null;
  setVehicleSelection: Dispatch<SetStateAction<VehicleSelection | null>>;
  setStationSelection: Dispatch<StationSelection | null>;
  eastToWestStationConfigs: StationConfig[];
  getInitialPredictionsDirection: () => DirectionId;
  alignsWithSegment?: (trainLoc: TrainLoc, segment: Segment) => boolean;
}): ReactElement => {
  const trainLocsOnRoute = trainLocs.filter((trainLoc) =>
    (alignsWithSegment ?? trainAlignsWithSegment)(trainLoc, segment),
  );
  const westboundTrainLocs = trainLocsOnRoute.filter(
    (trainLoc) => trainLoc.directionId === DirectionId.Westbound,
  );
  const eastboundTrainLocs = trainLocsOnRoute.filter(
    (trainLoc) => trainLoc.directionId === DirectionId.Eastbound,
  );
  const eastToWestStationIds = useMemo(
    () => eastToWestStationConfigs.map((config) => config.id),
    [eastToWestStationConfigs],
  );
  const eastToWestStationSpacingRatios = useMemo(
    () => eastToWestStationConfigs.map((config) => config.spacingRatio),
    [eastToWestStationConfigs],
  );
  const westToEastStationIds = useMemo(
    () => eastToWestStationIds.slice().reverse(),
    [eastToWestStationConfigs],
  );

  return (
    <ScrollToConsistContext.Provider value={scrollToConsist}>
      <div className="relative pb-20 sm:pb-0">
        <StationList
          zoom={zoom}
          stationConfigs={eastToWestStationConfigs}
          stationSelection={stationSelection}
          setStationSelection={setStationSelection}
          getInitialPredictionsDirection={getInitialPredictionsDirection}
        />
        <TrainList
          zoom={zoom}
          directionId={0}
          stationIdsInOrder={eastToWestStationIds}
          stationSpacingRatiosTopToBottom={eastToWestStationSpacingRatios}
          trainLocs={westboundTrainLocs}
          setVehicleSelection={setVehicleSelection}
        />
        <TrainList
          zoom={zoom}
          directionId={1}
          stationIdsInOrder={westToEastStationIds}
          stationSpacingRatiosTopToBottom={eastToWestStationSpacingRatios}
          trainLocs={eastboundTrainLocs}
          setVehicleSelection={setVehicleSelection}
        />
      </div>
    </ScrollToConsistContext.Provider>
  );
};

/**
 * Configuration point: Green-line-specific merge-point logic.
 * Checks whether this train aligns with this segment at Kenmore, Copley, and Lechmere.
 * For rail operations, pass a custom `alignsWithSegment` function to the Ladder component.
 *
 * This used to be more comprehensive, but it was too zealous and caused some
 * unconventionally-branched trains (for example, C-branch trains near Union Square) to be hidden
 * incorrectly. Additionally, it used to filter out other branches on the ladder for a specific
 * branch, but users preferred to see all of the trains along the relevant tracks. As such, now
 * this only checks for the three specific merge points in the system:
 *
 * 1. Eastbound:
 *    ```text
 *    b: Blandford St ──┐
 *    c:  St Marys St ──┼── Kenmore
 *    d:       Fenway ──┘
 *    ```
 * 2. Eastbound:
 *    ```text
 *    b,c,d,subway: Hynes ──┐
 *                          ├── Copley
 *    e:       Prudential ──┘
 *    ```
 * 3. Westbound:
 *    ```text
 *    d:     Union Sq ──┐
 *                      ├── Lechmere
 *    e: E Somerville ──┘
 *    ```
 */
export const trainAlignsWithSegment = (
  trainLoc: TrainLoc,
  segment: Segment,
): boolean => {
  const westbound = trainLoc.directionId === DirectionId.Westbound;
  const eastbound = trainLoc.directionId === DirectionId.Eastbound;

  const routeSegment = trainLoc.routeId && routeIdToSegment(trainLoc.routeId);

  const approachingKenmore =
    trainLoc.stopStatus === StopStatus.InTransitTo &&
    trainLoc.stationId === "place-kencl";
  if (approachingKenmore && eastbound) {
    // Since nothing before Kenmore is shown on the subway, only show the train if we are looking
    // at the segment matching its route.
    return segment === routeSegment;
  }

  const approachingCopley =
    trainLoc.stopStatus === StopStatus.InTransitTo &&
    trainLoc.stationId === "place-coecl";
  if (approachingCopley && eastbound) {
    // Since Hynes is shown before Copley on many segments, only show the train if the segment and
    // route agree on what comes before Copley.
    const routeBeforeCopley =
      trainLoc.routeId === "Green-E" ? "Prudential" : "Hynes";
    const segmentBeforeCopley = segment === "e" ? "Prudential" : "Hynes";
    return routeBeforeCopley === segmentBeforeCopley;
  }

  const approachingLechmere =
    trainLoc.stopStatus === StopStatus.InTransitTo &&
    trainLoc.stationId === "place-lech";
  if (approachingLechmere && westbound) {
    // Since nothing before Lechmere is shown on the subway, only show the train if we are looking
    // at the segment matching its route.
    return segment === routeSegment;
  }
  return true;
};

const StationList = ({
  zoom,
  stationConfigs,
  stationSelection,
  setStationSelection,
  getInitialPredictionsDirection,
}: {
  zoom: number;
  stationConfigs: StationConfig[];
  stationSelection: StationSelection | null;
  setStationSelection: Dispatch<StationSelection | null>;
  getInitialPredictionsDirection: () => DirectionId;
}): ReactElement => {
  const stopClass = className([
    "absolute top-0 inline-block h-[1.2rem] w-[1.2rem] -translate-y-1/2 rounded-full border-4 border-solid",
  ]);
  const selectedStopClass = className([
    "light:border-alt-blue-700 light:bg-white dark:border-glides-gray-400 dark:bg-glides-gray-200",
  ]);
  const unselectedStopClass = className([
    "light:border-slate-300 light:bg-slate-100 dark:border-glides-blue-900 dark:bg-glides-blue-700",
  ]);
  return (
    <ul
      className="light:border-slate-200 mx-auto w-32 border-0 border-x-[6px] border-solid dark:border-glides-blue-900"
      aria-label="Stations"
    >
      {stationConfigs.map((stationConfig, index) => {
        const stationId = stationConfig.id;
        const stationSpacingRatio = stationConfig.spacingRatio;
        const isSelected = stationId === stationSelection?.stationId;
        const isLastStation: boolean = index === stationConfigs.length - 1;
        const heightPx = isLastStation ? 0 : stationSpacingRatio * zoom;
        return (
          <li
            key={stationId}
            className="relative text-center"
            id={`id-ladder__station--${stationId}`}
            style={{ height: `${heightPx}px` }}
          >
            <button
              className={className([
                "-translate-y-1/2 rounded",
                isSelected
                  ? "light:-ml-7 light:w-[calc(100%+3.5rem)] light:rounded-full light:border light:border-slate-300 light:bg-white light:py-2 light:text-slate-900 light:outline light:outline-2 light:outline-offset-2 light:outline-alt-blue-700 dark:w-full dark:bg-glides-gray-200 dark:text-glides-blue-700"
                  : "light:text-slate-800 mx-auto w-full dark:text-glides-gray-200",
              ])}
              onClick={() => {
                if (isSelected) {
                  setStationSelection(null);
                } else {
                  setStationSelection({
                    stationId,
                    directionId:
                      stationSelection?.directionId ??
                      getInitialPredictionsDirection(),
                  });
                }
              }}
            >
              {stationShortName(stationId)}
            </button>
            <button
              className={className([
                stopClass,
                "left-[-12.6px]",
                isSelected &&
                stationSelection.directionId === DirectionId.Westbound
                  ? selectedStopClass
                  : unselectedStopClass,
              ])}
              onClick={() => {
                if (
                  isSelected &&
                  stationSelection.directionId === DirectionId.Westbound
                ) {
                  setStationSelection(null);
                } else {
                  setStationSelection({
                    stationId,
                    directionId: DirectionId.Westbound,
                  });
                }
              }}
            />
            <button
              className={className([
                stopClass,
                "right-[-12.6px]",
                isSelected &&
                stationSelection.directionId === DirectionId.Eastbound
                  ? selectedStopClass
                  : unselectedStopClass,
              ])}
              onClick={() => {
                if (
                  isSelected &&
                  stationSelection.directionId === DirectionId.Eastbound
                ) {
                  setStationSelection(null);
                } else {
                  setStationSelection({
                    stationId,
                    directionId: DirectionId.Eastbound,
                  });
                }
              }}
            />
          </li>
        );
      })}
    </ul>
  );
};

const TrainList = ({
  zoom,
  directionId,
  stationIdsInOrder,
  stationSpacingRatiosTopToBottom,
  trainLocs,
  setVehicleSelection,
}: {
  zoom: number;
  directionId: DirectionId;
  stationIdsInOrder: StationId[];
  stationSpacingRatiosTopToBottom: number[];
  trainLocs: TrainLoc[];
  setVehicleSelection: Dispatch<SetStateAction<VehicleSelection | null>>;
}): ReactElement => {
  const trainsWithHeights: TrainWithHeights[] = trainHeights(
    trainLocs,
    zoom,
    directionId,
    stationIdsInOrder,
    stationSpacingRatiosTopToBottom,
  );
  return (
    <ul
      className={className([
        "pointer-events-none absolute bottom-0 top-0 w-[calc(50%-4rem+3px)]",
        directionId === DirectionId.Westbound ? "left-0" : "right-0",
      ])}
      aria-label={`Trains ${directionIdToString(directionId)}`}
    >
      {trainsWithHeights.map((trainWithHeights) => (
        <li
          className="pointer-events-auto"
          key={consistToString(trainWithHeights.consist)}
        >
          <Train
            trainWithHeights={trainWithHeights}
            setVehicleSelection={setVehicleSelection}
          />
        </li>
      ))}
    </ul>
  );
};

const Train = ({
  trainWithHeights,
  setVehicleSelection,
}: {
  trainWithHeights: TrainWithHeights;
  setVehicleSelection: Dispatch<SetStateAction<VehicleSelection | null>>;
}): ReactElement => {
  const scrollToConsist = useContext(ScrollToConsistContext);
  const isSearchResult =
    scrollToConsist !== null &&
    consistEq(scrollToConsist, trainWithHeights.consist, "exact");
  const labelButtonRef = useRef<HTMLButtonElement | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    if (isSearchResult && labelButtonRef.current !== null) {
      scrollTo(labelButtonRef.current, "center", false);
      const timeout = setTimeout(
        () => navigate({ hash: "" }, { replace: true }),
        5000,
      );
      return () => clearTimeout(timeout);
    }
  }, [isSearchResult, labelButtonRef, navigate]);
  return (
    <>
      <Dot trainWithHeights={trainWithHeights} />
      <LabelButton
        buttonRef={labelButtonRef}
        trainWithHeights={trainWithHeights}
        isSearchResult={isSearchResult}
        setVehicleSelection={setVehicleSelection}
      />
      <LineBetweenDotAndLabel trainWithHeights={trainWithHeights} />
    </>
  );
};

const Dot = ({
  trainWithHeights,
}: {
  trainWithHeights: TrainWithHeights;
}): ReactElement => (
  <div
    className={className([
      "bg-glides-branch ring-glides-branch/[.33] pointer-events-none absolute mx-[-5px] h-[10px] w-[10px] -translate-y-1/2 rounded-full ring-4",
      isTripRevenue(trainWithHeights.trip)
        ? routeColorClass(trainWithHeights.routeId)
        : "bg-glides-gray-400 ring-glides-gray-400/[.33]",
    ])}
    style={{
      top: `${trainWithHeights.dotPx}px`,
      [trainWithHeights.directionId === DirectionId.Westbound
        ? "right"
        : "left"]: "0px",
    }}
  />
);

const LabelButton = ({
  trainWithHeights,
  buttonRef,
  isSearchResult,
  setVehicleSelection,
}: {
  trainWithHeights: TrainWithHeights;
  buttonRef: React.MutableRefObject<HTMLButtonElement | null>;
  isSearchResult: boolean;
  setVehicleSelection: Dispatch<SetStateAction<VehicleSelection | null>>;
}): ReactElement => {
  return (
    <button
      ref={buttonRef}
      className={className([
        "absolute mx-[-21px] -translate-y-1/2",
        isSearchResult ? "z-object" : null,
      ])}
      onClick={() => {
        const vehicleSelection: VehicleSelection = {
          routeId: trainWithHeights.routeId,
          consist: trainWithHeights.consist,
        };
        setVehicleSelection(vehicleSelection);
      }}
      style={{
        top: `${trainWithHeights.labelPx}px`,
        [trainWithHeights.directionId === DirectionId.Westbound
          ? "right"
          : "left"]: `${connectorLength}px`,
      }}
    >
      <LadderLabel
        consist={trainWithHeights.consist}
        routeId={trainWithHeights.routeId}
        primaryColor={isSearchResult ? "route" : "bg"}
        revenue={isTripRevenue(trainWithHeights.trip)}
        routeOnRight={trainWithHeights.directionId === DirectionId.Westbound}
        searchResult={isSearchResult}
      />
    </button>
  );
};

const LineBetweenDotAndLabel = ({
  trainWithHeights,
}: {
  trainWithHeights: TrainWithHeights;
}): ReactElement => {
  const { dotPx, labelPx, routeId, trip } = trainWithHeights;
  // svg 0,0 is at the dot
  const labelX =
    trainWithHeights.directionId === DirectionId.Westbound
      ? -connectorLength
      : connectorLength;
  const labelY = trainWithHeights.labelPx - trainWithHeights.dotPx;
  // add a connectorWidth of margin to Y
  const viewBoxMinX = Math.min(labelX, 0);
  const viewBoxMinY = Math.min(labelY, 0) - connectorWidth;
  const viewBoxWidth = connectorLength;
  const viewBoxHeight = Math.abs(dotPx - labelPx) + 2 * connectorWidth;

  // We scale the connector back to the edge of the route circle
  // to avoid overlapping the letter
  const connectorDiagonalLength = Math.sqrt(labelX * labelX + labelY * labelY);
  const fractionOfConnectorInRouteCircle =
    routeLetterRadius / connectorDiagonalLength;
  const connectorLengthScale = 1 - fractionOfConnectorInRouteCircle;

  return (
    <svg
      className={className(["pointer-events-none absolute"])}
      width={`${viewBoxWidth}px`}
      height={`${viewBoxHeight}px`}
      style={{
        top: `${dotPx + viewBoxMinY}px`,
        [trainWithHeights.directionId === DirectionId.Westbound
          ? "right"
          : "left"]: "0px",
      }}
      viewBox={`${viewBoxMinX} ${viewBoxMinY} ${viewBoxWidth} ${viewBoxHeight}`}
    >
      <line
        x1={0}
        y1={0}
        x2={labelX * connectorLengthScale}
        y2={labelY * connectorLengthScale}
        strokeWidth={connectorWidth}
        className={className([
          "text-glides-branch stroke-current",
          isTripRevenue(trip)
            ? routeColorClass(routeId)
            : "text-glides-gray-400",
        ])}
      />
    </svg>
  );
};
