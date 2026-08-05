import { RouteId } from "src/models/route";

/**
 * Configuration point: Route color CSS class mappings.
 * Currently hardcoded for Green Line branches.
 * For rail operations, replace with route-specific color configuration.
 */
export const routeColorClass = (route: RouteId): string => {
  switch (route) {
    case "Green-B":
      return "branch-color-light-rail-b-branch";
    case "Green-C":
      return "branch-color-light-rail-c-branch";
    case "Green-D":
      return "branch-color-light-rail-d-branch";
    case "Green-E":
      return "branch-color-light-rail-e-branch";
    case "Mattapan":
      return "branch-color-light-rail-mattapan-branch";
  }
};
