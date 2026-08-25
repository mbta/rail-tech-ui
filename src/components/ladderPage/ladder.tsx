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
import { LadderLabel } from "src/components/ladderPage/ladderLabel";
import { CarId, Consist, consistEq, consistToString } from "src/data";
import {
  DirectionId,
  directionIdToString,
  RouteId,
  RoutePatternId,
} from "src/models/route";
import { Station, StationId, StationMap } from "src/models/stop";
import { StopStatus, TrainLoc } from "src/models/trainLocation";
import { isTripRevenue } from "src/models/trainsheet";
import { scrollTo } from "src/util/browser";
import { className } from "src/util/dom";
import { LabelMode, StationSelection, VehicleSelection } from "./types";
import { TrainWithHeights, trainHeights } from "./trainHeight";
import { DepArrow } from "../icons/DepArrow";

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

type SearchResultContextValue = {
  scrollToConsist: Consist | null;
  onSearchResultTimeout: (() => void) | null;
};

const SearchResultContext = createContext<SearchResultContextValue>({
  scrollToConsist: null,
  onSearchResultTimeout: null,
});

export const Ladder = ({
  zoom,
  trainLocs,
  letterFn,
  routeColorFn,
  trainsClickable,
  labelMode,
  labelRemap,
  stationSelection,
  scrollToConsist,
  onSearchResultTimeout,
  onVehicleSelection,
  setStationSelection,
  eastToWestStations,
  getInitialPredictionsDirection,
}: {
  zoom: number;
  letterFn: (routeId: RouteId, routePatternId?: RoutePatternId) => string;
  routeColorFn: (routeId: RouteId, routePatternId?: RoutePatternId) => string;
  trainsClickable: boolean;
  trainLocs: TrainLoc[];
  labelMode: LabelMode;
  labelRemap?: (car: CarId) => CarId;
  stationSelection: StationSelection | null;
  scrollToConsist: Consist | null;

  // Called 5s after a search result has been scrolled into view so a consumer
  //  can choose to clear e.g. a URL state
  onSearchResultTimeout?: () => void;

  onVehicleSelection: (selection: VehicleSelection) => void;
  setStationSelection: Dispatch<StationSelection | null>;
  eastToWestStations: Station[];
  getInitialPredictionsDirection: () => DirectionId;
}): ReactElement => {
  const westboundTrainLocs = trainLocs.filter(
    (trainLoc) => trainLoc.directionId === DirectionId.Westbound,
  );
  const eastboundTrainLocs = trainLocs.filter(
    (trainLoc) => trainLoc.directionId === DirectionId.Eastbound,
  );
  const eastToWestStationIds = useMemo(
    () => eastToWestStations.map((station) => station.id),
    [eastToWestStations],
  );
  const eastToWestStationSpacingRatios = useMemo(
    () => eastToWestStations.map((station) => station.spacingRatio),
    [eastToWestStations],
  );
  const westToEastStationIds = useMemo(
    () => eastToWestStationIds.slice().reverse(),
    [eastToWestStationIds],
  );
  const stationMap: StationMap = useMemo(
    () =>
      Object.fromEntries(
        eastToWestStations.map((station) => [station.id, station]),
      ),
    [eastToWestStations],
  );

  const searchResultContextValue = useMemo<SearchResultContextValue>(
    () => ({
      scrollToConsist,
      onSearchResultTimeout: onSearchResultTimeout ?? null,
    }),
    [scrollToConsist, onSearchResultTimeout],
  );

  return (
    <SearchResultContext.Provider value={searchResultContextValue}>
      <div className="relative pb-20 sm:pb-0">
        <StationList
          zoom={zoom}
          eastToWestStations={eastToWestStations}
          stationSelection={stationSelection}
          setStationSelection={setStationSelection}
          getInitialPredictionsDirection={getInitialPredictionsDirection}
        />
        <TrainList
          trainsClickable={trainsClickable}
          zoom={zoom}
          directionId={0}
          labelMode={labelMode}
          labelRemap={labelRemap}
          stationIdsInOrder={eastToWestStationIds}
          stationSpacingRatiosTopToBottom={eastToWestStationSpacingRatios}
          trainLocs={westboundTrainLocs}
          letterFn={letterFn}
          routeColorFn={routeColorFn}
          stationMap={stationMap}
          onVehicleSelection={onVehicleSelection}
        />
        <TrainList
          trainsClickable={trainsClickable}
          zoom={zoom}
          directionId={1}
          labelMode={labelMode}
          labelRemap={labelRemap}
          stationIdsInOrder={westToEastStationIds}
          stationSpacingRatiosTopToBottom={eastToWestStationSpacingRatios}
          trainLocs={eastboundTrainLocs}
          letterFn={letterFn}
          routeColorFn={routeColorFn}
          stationMap={stationMap}
          onVehicleSelection={onVehicleSelection}
        />
      </div>
    </SearchResultContext.Provider>
  );
};

const StationList = ({
  zoom,
  eastToWestStations,
  stationSelection,
  setStationSelection,
  getInitialPredictionsDirection,
}: {
  zoom: number;
  eastToWestStations: Station[];
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
      {eastToWestStations.map((station, index) => {
        const stationId = station.id;
        const stationSpacingRatio = station.spacingRatio;
        const isSelected = stationId === stationSelection?.stationId;
        const isLastStation: boolean = index === eastToWestStations.length - 1;
        const heightPx = isLastStation ? 0 : stationSpacingRatio * zoom;
        return (
          <li
            key={stationId}
            className="relative text-center"
            id={`id-ladder__station--${stationId}`}
            style={{ height: `${heightPx}px` }}
          >
            {station.externalUrl ? (
              <a
                href={station.externalUrl}
                className="absolute inset-0 -top-10 hidden text-ladder-text-primary-light md:block dark:text-ladder-text-primary-dark"
              >
                <DepArrow
                  className="mx-auto h-5 w-5"
                  title="External Trainsheet"
                />
              </a>
            ) : null}
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
              {station.shortName}
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
  labelMode,
  labelRemap,
  trainLocs,
  letterFn,
  routeColorFn,
  trainsClickable,
  stationMap,
  onVehicleSelection,
}: {
  zoom: number;
  directionId: DirectionId;
  stationIdsInOrder: StationId[];
  stationSpacingRatiosTopToBottom: number[];
  labelMode: LabelMode;
  labelRemap?: (car: CarId) => string;
  trainLocs: TrainLoc[];
  letterFn: (routeId: RouteId, routePatternId?: RoutePatternId) => string;
  routeColorFn: (routeId: RouteId, routePatternId?: RoutePatternId) => string;
  trainsClickable: boolean;
  stationMap: StationMap;
  onVehicleSelection: (selection: VehicleSelection) => void;
}): ReactElement => {
  const trainsWithHeights: TrainWithHeights[] = trainHeights(
    trainLocs,
    zoom,
    directionId,
    stationIdsInOrder,
    stationSpacingRatiosTopToBottom,
    stationMap,
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
            clickable={trainsClickable}
            trainWithHeights={trainWithHeights}
            labelMode={labelMode}
            labelRemap={labelRemap}
            onVehicleSelection={onVehicleSelection}
            letterFn={letterFn}
            routeColorFn={routeColorFn}
          />
        </li>
      ))}
    </ul>
  );
};

const Train = ({
  trainWithHeights,
  labelMode,
  labelRemap,
  letterFn,
  routeColorFn,
  clickable,
  onVehicleSelection,
}: {
  trainWithHeights: TrainWithHeights;
  labelMode: LabelMode;
  labelRemap?: (car: CarId) => string;
  letterFn: (routeId: RouteId, routePatternId?: RoutePatternId) => string;
  routeColorFn: (routeId: RouteId, routePatternId?: RoutePatternId) => string;
  clickable: boolean;
  onVehicleSelection: (selection: VehicleSelection) => void;
}): ReactElement => {
  const { scrollToConsist, onSearchResultTimeout } =
    useContext(SearchResultContext);
  const isSearchResult =
    scrollToConsist !== null &&
    consistEq(scrollToConsist, trainWithHeights.consist, "exact");
  const labelButtonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (isSearchResult && labelButtonRef.current !== null) {
      scrollTo(labelButtonRef.current, "center", false);
      if (onSearchResultTimeout === null) return;
      const timeout = setTimeout(onSearchResultTimeout, 5000);
      return () => clearTimeout(timeout);
    }
  }, [isSearchResult, labelButtonRef, onSearchResultTimeout]);

  const letter = useMemo(() => {
    return letterFn(trainWithHeights.routeId, trainWithHeights.routePatternId);
  }, [trainWithHeights.routeId, trainWithHeights.routePatternId]);
  const color = useMemo(() => {
    return routeColorFn(
      trainWithHeights.routeId,
      trainWithHeights.routePatternId,
    );
  }, [trainWithHeights.routeId, trainWithHeights.routePatternId]);
  return (
    <>
      <Dot color={color} trainWithHeights={trainWithHeights} />
      <LabelButton
        clickable={clickable}
        mode={labelMode}
        letter={letter}
        color={color}
        buttonRef={labelButtonRef}
        trainWithHeights={trainWithHeights}
        isSearchResult={isSearchResult}
        onVehicleSelection={onVehicleSelection}
        labelRemap={labelRemap}
      />
      <LineBetweenDotAndLabel
        color={color}
        trainWithHeights={trainWithHeights}
      />
    </>
  );
};

const Dot = ({
  trainWithHeights,
  color,
}: {
  trainWithHeights: TrainWithHeights;
  color: string;
}): ReactElement => (
  <div
    className={className([
      "bg-glides-branch ring-glides-branch/[.33] pointer-events-none absolute mx-[-5px] h-[10px] w-[10px] -translate-y-1/2 rounded-full ring-4",
      isTripRevenue(trainWithHeights.trip)
        ? color
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
  mode,
  letter,
  color,
  clickable,
  buttonRef,
  isSearchResult,
  onVehicleSelection,
  labelRemap,
}: {
  trainWithHeights: TrainWithHeights;
  mode: LabelMode;
  letter: string;
  color: string;
  clickable: boolean;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  isSearchResult: boolean;
  onVehicleSelection: (selection: VehicleSelection) => void;
  labelRemap?: (car: CarId) => string;
}): ReactElement => {
  return (
    <button
      disabled={!clickable}
      ref={buttonRef}
      className={className([
        "absolute mx-[-21px] -translate-y-1/2",
        isSearchResult ? "z-object" : null,
      ])}
      onClick={(e) => {
        e.stopPropagation();
        const vehicleSelection: VehicleSelection = {
          routeId: trainWithHeights.routeId,
          consist: trainWithHeights.consist,
        };
        onVehicleSelection(vehicleSelection);
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
        letter={letter}
        color={color}
        primaryColor={isSearchResult ? "route" : "bg"}
        revenue={isTripRevenue(trainWithHeights.trip)}
        routeOnRight={trainWithHeights.directionId === DirectionId.Westbound}
        searchResult={isSearchResult}
        labelMode={mode}
        labelRemap={labelRemap}
      />
    </button>
  );
};

const LineBetweenDotAndLabel = ({
  trainWithHeights,
  color,
}: {
  trainWithHeights: TrainWithHeights;
  color: string;
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
          isTripRevenue(trip) ? color : "text-glides-gray-400",
        ])}
      />
    </svg>
  );
};
