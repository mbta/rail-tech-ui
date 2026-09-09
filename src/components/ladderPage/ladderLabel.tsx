import { ReactElement } from "react";
import { Icon } from "src/components/icons";
import { CarId, Consist } from "src/data";
import { className } from "src/util/dom";
import { LabelMode } from "./types";

export const LadderLabel = ({
  consist,
  letter,
  color,
  labelMode,
  labelRemap,
  revenue,
  primaryColor = "route",
  routeOnRight,
  highlight = false,
}: {
  consist: Consist;
  letter: string;
  color: string;
  labelMode: LabelMode;
  labelRemap?: (car: CarId) => string;
  revenue: boolean;
  primaryColor?: "route" | "bg";
  routeOnRight?: boolean;
  highlight?: boolean;
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
        color,
        highlight
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
            n={labelMode === "lead" ? 1 : undefined}
            primaryColor={revenue ? primaryColor : "nonrev"}
            highlight={highlight}
            labelRemap={labelRemap}
          />
          <RouteIcon
            letter={letter}
            iconStyle={revenue ? "letter" : "nonrev"}
            primaryColor={primaryColor}
            highlight={highlight}
          />
        </>
      ) : (
        <>
          <RouteIcon
            letter={letter}
            iconStyle={revenue ? "letter" : "nonrev"}
            primaryColor={primaryColor}
            highlight={highlight}
          />
          <TrainConsist
            consist={consist}
            n={labelMode === "lead" ? 1 : undefined}
            primaryColor={revenue ? primaryColor : "nonrev"}
            highlight={highlight}
            labelRemap={labelRemap}
          />
        </>
      )}
    </div>
  );
};

const RouteIcon = ({
  letter,
  primaryColor,
  iconStyle,
  highlight,
}: {
  letter: string;
  primaryColor: "route" | "bg";
  iconStyle: "letter" | "nonrev";
  highlight: boolean;
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
          highlight
            ? "light:animate-train-label-search-result-light-branch dark:animate-train-label-search-result-branch"
            : null,
        ])}
      >
        {letter}
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
  n,
  primaryColor,
  highlight,
  labelRemap,
}: {
  consist: Consist;
  n?: number;
  primaryColor: "route" | "bg" | "nonrev";
  highlight: boolean;
  labelRemap?: (car: CarId) => CarId;
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
    {consist.slice(0, n).map((carId: CarId, index) => (
      <div
        className={className([
          index === 0 ? "font-semibold" : null,
          "leading-none",
          index === 0 ? "text-base" : "text-sm",
          highlight ? "animate-train-label-search-result-car-id" : null,
        ])}
        key={index}
      >
        {labelRemap ? labelRemap(carId) : carId}
      </div>
    ))}
  </div>
);
