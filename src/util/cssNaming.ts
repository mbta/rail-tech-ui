import { RouteId } from "src/models/route";

/**
 * Configuration point: Route color CSS class mappings.
 * Currently hardcoded for Green Line branches.
 * For rail operations, replace with route-specific color configuration.
 */
export const routeColorClass = (route: RouteId): string => {
  switch (route) {
    case "Green-B":
      return "branch-color-glides-pink-400";
    case "Green-C":
      return "branch-color-glides-green-400";
    case "Green-D":
      return "branch-color-glides-yellow-400";
    case "Green-E":
      return "branch-color-glides-aqua-400";
    case "Mattapan":
      return "branch-color-glides-orange-400";
  }
};
