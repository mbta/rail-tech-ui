import { ReactElement } from "react";
import { Icon } from "src/components/icons";
import { CarId, Consist } from "src/data";
import { RouteId, routeLetter } from "src/models/route";
import { className } from "src/util/dom";

export interface LadderLabelProps {
  consist: Consist;
  routeId: RouteId;
  revenue: boolean;
}

export const LadderLabel = ({
  consist,
  routeId,
  revenue,
  primaryColor = "route",
  routeColor,
  routeOnRight,
  searchResult = false,
}: LadderLabelProps & {
  primaryColor?: "route" | "bg";
  routeColor: string;
  routeOnRight?: boolean;
  searchResult?: boolean;
}): ReactElement => {
  return (
    <div
      className={className([
        "rounded-4xl light:border light:border-slate-300 light:shadow-sm flex h-[2.625rem] w-24 p-1.5",
        revenue
          ? primaryColor === "bg"
            ? "light:bg-white dark:bg-glides-blue-900"
            : "bg-glides-branch"
          : primaryColor === "bg"
            ? "light:border-glides-gray-500 light:bg-slate-100 border-2 border-solid dark:border-glides-gray-400"
            : "light:bg-white dark:bg-glides-blue-900",
        routeColor,
        searchResult
          ? "ring-glides-branch/50 light:animate-train-label-search-result-light dark:animate-train-label-search-result ring-8"
          : primaryColor === "route"
            ? "light:ring-1 light:ring-inset light:ring-black/30"
            : null,
      ])}
    >
      {routeOnRight ? (
        <>
          <TrainConsist
            consist={consist}
            primaryColor={revenue ? primaryColor : "nonrev"}
            searchResult={searchResult}
          />
          <RouteIcon
            routeId={routeId}
            iconStyle={revenue ? "letter" : "nonrev"}
            primaryColor={primaryColor}
            searchResult={searchResult}
          />
        </>
      ) : (
        <>
          <RouteIcon
            routeId={routeId}
            iconStyle={revenue ? "letter" : "nonrev"}
            primaryColor={primaryColor}
            searchResult={searchResult}
          />
          <TrainConsist
            consist={consist}
            primaryColor={revenue ? primaryColor : "nonrev"}
            searchResult={searchResult}
          />
        </>
      )}
    </div>
  );
};

const RouteIcon = ({
  routeId,
  primaryColor,
  iconStyle,
  searchResult,
}: {
  routeId: RouteId;
  primaryColor: "route" | "bg";
  iconStyle: "letter" | "nonrev";
  searchResult: boolean;
}): ReactElement => {
  if (iconStyle === "letter") {
    return (
      <p
        className={className([
          "flex basis-auto items-center justify-center rounded-full text-center font-semibold",
          primaryColor === "bg"
            ? "bg-glides-branch light:text-slate-800 dark:text-glides-blue-900"
            : "text-glides-branch light:bg-slate-800 dark:bg-glides-blue-700",
          "h-[1.875rem] w-[1.875rem]",
          searchResult
            ? "light:animate-train-label-search-result-light-branch dark:animate-train-label-search-result-branch"
            : null,
        ])}
      >
        {routeLetter(routeId)}
      </p>
    );
  } else {
    return (
      <Icon
        name="ban"
        title={"Non-revenue"}
        className="mx-auto w-7 fill-glides-gray-300"
      />
    );
  }
};

const TrainConsist = ({
  consist,
  primaryColor,
  searchResult,
}: {
  consist: Consist;
  primaryColor: "route" | "bg" | "nonrev";
  searchResult: boolean;
}): ReactElement => (
  <div
    className={className([
      "flex flex-auto flex-col items-center justify-center",
      primaryColor === "bg"
        ? "light:text-slate-800 dark:text-glides-branch"
        : primaryColor === "nonrev"
          ? "light:text-gray-600 dark:text-glides-gray-200"
          : "text-glides-blue-700",
    ])}
  >
    {consist.map((carId: CarId, index) => (
      <div
        className={className([
          index === 0 ? "font-semibold" : null,
          "leading-none",
          index === 0 ? "text-base" : "text-sm",
          searchResult ? "animate-train-label-search-result-car-id" : null,
        ])}
        key={index}
      >
        {carId}
      </div>
    ))}
  </div>
);
