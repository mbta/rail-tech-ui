import { Consist } from "src/data";
import { DirectionId, RouteId } from "src/models/route";
import { StationId } from "src/models/stop";

export interface StationSelection {
  stationId: StationId;
  directionId: DirectionId;
}

export interface VehicleSelection {
  routeId: RouteId;
  consist: Consist;
}
