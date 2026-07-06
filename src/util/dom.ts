export const className = (
  classes: (string | null | undefined | false)[],
): string =>
  classes
    .filter((c): c is string => typeof c === "string" && c !== "")
    .join(" ");
