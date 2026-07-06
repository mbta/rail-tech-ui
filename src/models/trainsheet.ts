export interface ManualTripEnd {
  revenue: boolean;
}

export interface ScheduledTripEnd {
  revenue: boolean;
}

export interface TripEnd {
  scheduled: ScheduledTripEnd | null;
  manual: ManualTripEnd | null;
}

export const isTripRevenue = (trip: TripEnd | null) =>
  trip?.manual?.revenue ?? trip?.scheduled?.revenue ?? true;
