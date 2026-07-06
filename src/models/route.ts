import { z } from "zod";
import type { Mutable } from "src/util/ts";

// RouteId matches GTFS route_id
const routeIds = [
  "Green-B",
  "Green-C",
  "Green-D",
  "Green-E",
  "Mattapan",
] as const;

export type RouteId = (typeof routeIds)[number];
export const RouteId = z.enum(routeIds);

export const allRouteIds: RouteId[] = routeIds as Mutable<typeof routeIds>;

export const isRouteId = (s: string): s is RouteId =>
  (allRouteIds as string[]).includes(s);

export const routeIdFromString = (s: string): RouteId => {
  if (isRouteId(s)) {
    return s;
  } else {
    throw new Error(`invalid route_id ${s}`);
  }
};

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

// Segment matches the url path param on the ladder
const segments = ["b", "c", "d", "e", "subway", "m"] as const;

export type Segment = (typeof segments)[number];
export type RouteSegment = Exclude<Segment, "subway">;

export const allSegments: Segment[] = segments as Mutable<typeof segments>;

export const isSegment = (s: string): s is Segment =>
  (allSegments as string[]).includes(s);

export const segmentToRouteId = (segment: Segment): RouteId | null => {
  switch (segment) {
    case "b":
      return "Green-B";
    case "c":
      return "Green-C";
    case "d":
      return "Green-D";
    case "e":
      return "Green-E";
    case "subway":
      return null;
    case "m":
      return "Mattapan";
  }
};

export const routeIdToSegment = (route: RouteId): RouteSegment => {
  switch (route) {
    case "Green-B":
      return "b";
    case "Green-C":
      return "c";
    case "Green-D":
      return "d";
    case "Green-E":
      return "e";
    case "Mattapan":
      return "m";
  }
};

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
};

export const segmentShortName = (segment: Segment): string => {
  switch (segment) {
    case "b":
      return "B";
    case "c":
      return "C";
    case "d":
      return "D";
    case "e":
      return "E";
    case "subway":
      return "Subway";
    case "m":
      return "M";
  }
};

export const routeName = (routeId: RouteId): string => {
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
      return "Mattapan";
  }
};
