import { z } from "zod";

export interface LatLng {
  latitude: number;
  longitude: number;
}

export const LatLng = z.object({
  latitude: z.number(),
  longitude: z.number(),
}) satisfies z.ZodType<LatLng>;

/**
 * Find how far between a start an finish and intermediate point is,
 * by projecting it onto the vector between the start and finish.
 *
 * If the point is at the start, then the result is 0.0
 * If the point is at the finish, then the result is 1.0
 * If the point projects to a point halfway between the start and finish, the result is 0.5
 *
 * Doesn't do any fancy spherical projection stuff. It just treats the coordinates as vectors.
 * This is fine for the scale of the Green Line.
 *
 * Uses the straight line between the start and finish.
 * The Green Line's tracks curve between stations, but it's a close enough approximation.
 */
export const proportionBetweenLatLngs = (
  start: LatLng,
  finish: LatLng,
  point: LatLng,
): number => {
  const totalLatDelta: number = finish.latitude - start.latitude;
  const totalLngDelta: number = finish.longitude - start.longitude;
  const pointLatDelta: number = point.latitude - start.latitude;
  const pointLngDelta: number = point.longitude - start.longitude;
  const dotProductStartToPoint: number =
    totalLatDelta * pointLatDelta + totalLngDelta * pointLngDelta;
  const startToFinishMagnitudeSquared: number =
    totalLatDelta * totalLatDelta + totalLngDelta * totalLngDelta;
  return dotProductStartToPoint / startToFinishMagnitudeSquared;
};
