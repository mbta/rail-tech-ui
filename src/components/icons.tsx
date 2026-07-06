import React, { ReactElement, useId } from "react";

export type IconName =
  | "angle-down"
  | "arrow-box-in"
  | "arrow-counterclockwise"
  | "arrow-right"
  | "arrows-down-up"
  | "back"
  | "badge"
  | "ban"
  | "call"
  | "check"
  | "circle-check"
  | "clipboard"
  | "close"
  | "comment-dots"
  | "external"
  | "feedback"
  | "gear"
  | "glides-logo"
  | "green-check"
  | "hamburger"
  | "help"
  | "info"
  | "key"
  | "ladder"
  | "lightning"
  | "link-to-ladder"
  | "link-to-trip"
  | "lock"
  | "map-pin"
  | "menu"
  | "pencil"
  | "plus"
  | "search"
  | "shield"
  | "sign-out"
  | "spinner"
  | "swap"
  | "switch"
  | "temp"
  | "timeline"
  | "trainsheet"
  | "warning-circle"
  | "warning-triangle";

export const Icon = React.memo(
  ({
    name,
    title,
    className: extraClassName,
  }: {
    name: IconName;
    title: string | null;
    className?: string;
  }): ReactElement => {
    // svg4everybody can't handle in-place icon or title switching,
    // so we use key to destroy and recreate if needed
    const id = useId();
    return (
      <svg
        key={name + (title ?? "")}
        className={extraClassName}
        aria-labelledby={title !== null ? id : undefined}
        role={title !== null ? "img" : "presentation"}
      >
        {title !== null ? <title id={id}>{title}</title> : null}
        <use xlinkHref={"/images/icons.svg#icon--" + name} />
      </svg>
    );
  },
);
Icon.displayName = "Icon";
