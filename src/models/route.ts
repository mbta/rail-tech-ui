import { z } from "zod";
import type { Mutable } from "src/util/ts";

// RouteId matches GTFS route_id
export type RouteId = string;

// DirectionId matches GTFS
export enum DirectionId {
  Westbound = 0,
  Eastbound = 1,
}

export const DirectionIdData = z.enum(["westbound", "eastbound"]);
export type DirectionIdData = z.infer<typeof DirectionIdData>;

export const directionIdFromData = (data: DirectionIdData): DirectionId => {
  switch (data) {
    case "eastbound":
      return DirectionId.Eastbound;
    case "westbound":
      return DirectionId.Westbound;
  }
};

export const directionIdToData = (data: DirectionId): DirectionIdData => {
  switch (data) {
    case DirectionId.Westbound:
      return "westbound";
    case DirectionId.Eastbound:
      return "eastbound";
  }
};

export const switchDirection = (directionId: DirectionId): DirectionId =>
  directionId === DirectionId.Westbound
    ? DirectionId.Eastbound
    : DirectionId.Westbound;

// Result is title case, caller can toLowerCase if needed
export const directionIdToString = (directionId: DirectionId) =>
  directionId === DirectionId.Westbound ? "Westbound" : "Eastbound";

export type RouteNumber = string;

export const routeLetter = (routeId: RouteId): string => {
  switch (routeId) {
    case "Green-B":
      return "B";
    case "Green-C":
      return "C";
    case "Green-D":
      return "D";
    case "Green-E":
      return "E";
    case "Mattapan":
      return "M";
  }

  return "";
};
