import { Station, StationId } from "src/models/stop";

export const buildStation = (
  id: string,
  name: string,
  latitude: number,
  longitude: number,
  shortName?: string,
): Station => ({
  id,
  name,
  shortName: shortName ?? name,
  latLng: { latitude, longitude },
  spacingRatio: 1.0,
});

export const DEMO_B_STATIONS = [
  buildStation(
    "place-bland",
    "Blandford Street",
    42.349293,
    -71.100258,
    "Blandford St",
  ),
  buildStation(
    "place-buest",
    "Boston University East",
    42.349735,
    -71.103889,
    "BU East",
  ),
  buildStation(
    "place-bucen",
    "Boston University Central",
    42.350082,
    -71.106865,
    "BU Central",
  ),
  buildStation(
    "place-amory",
    "Amory Street",
    42.350993,
    -71.114667,
    "Amory St",
  ),
];

export const DEMO_C_STATIONS = [
  buildStation("place-north", "North Station", 42.365577, -71.06129),
  buildStation("place-kencl", "Kenmore", 42.348949, -71.095169),
  buildStation(
    "place-hwsst",
    "Hawes Street",
    42.344906,
    -71.111145,
    "Hawes St",
  ),
  buildStation("place-kntst", "Kent Street", 42.344074, -71.114197, "Kent St"),
  buildStation(
    "place-stpul",
    "Saint Paul Street",
    42.343327,
    -71.116997,
    "St Paul St",
  ),
  buildStation(
    "place-cool",
    "Coolidge Corner",
    42.342116,
    -71.121263,
    "Coolidge Cnr",
  ),
  buildStation(
    "place-sumav",
    "Summit Avenue",
    42.34111,
    -71.12561,
    "Summit Ave",
  ),
  buildStation("place-bndhl", "Brandon Hall", 42.340023, -71.129082),
  buildStation(
    "place-fbkst",
    "Fairbanks Street",
    42.339725,
    -71.131073,
    "Fairbanks St",
  ),
  buildStation(
    "place-bcnwa",
    "Washington Square",
    42.339394,
    -71.13533,
    "Wash Sq",
  ),
  buildStation(
    "place-tapst",
    "Tappan Street",
    42.338459,
    -71.138702,
    "Tappan St",
  ),
  buildStation(
    "place-clmnl",
    "Cleveland Circle",
    42.336142,
    -71.149326,
    "Cleveland Cir",
  ),
];

export const DEMO_E_STATIONS = [
  buildStation(
    "place-mdftf",
    "Medford/Tufts",
    42.408179,
    -71.117185,
    "Medford",
  ),
  buildStation("place-balsq", "Ball Square", 42.400241, -71.111278, "Ball Sq"),
  buildStation(
    "place-mgngl",
    "Magoun Square",
    42.394251,
    -71.106788,
    "Magoun Sq",
  ),
  buildStation(
    "place-gilmn",
    "Gilman Square",
    42.3879,
    -71.096721,
    "Gilman Sq",
  ),
  buildStation(
    "place-esomr",
    "East Somerville",
    42.379731,
    -71.086929,
    "E Somerville",
  ),
  buildStation("place-lech", "Lechmere", 42.371244, -71.076134),
  buildStation("place-spmnl", "Science Park", 42.366664, -71.067666),
  buildStation("place-north", "North Station", 42.365577, -71.06129),
  buildStation("place-haecl", "Haymarket", 42.363021, -71.05829),
  buildStation(
    "place-gover",
    "Government Center",
    42.359705,
    -71.059215,
    "Govt Ctr",
  ),
  buildStation("place-pktrm", "Park Street", 42.356395, -71.062424, "Park St"),
  buildStation("place-boyls", "Boylston", 42.35302, -71.06459),
  buildStation("place-armnl", "Arlington", 42.351902, -71.070893),
  buildStation("place-coecl", "Copley", 42.349974, -71.077447),
];

export const DEMO_RL_STATIONS = [
  buildStation("place-pktrm", "Park Street", 42.356395, -71.062424, "Park St"),
  buildStation(
    "place-dwnxg",
    "Downtown Crossing",
    42.355518,
    -71.060225,
    "Dwt Xing",
  ),
  buildStation("place-sstat", "South Station", 42.352271, -71.055242),
  buildStation("place-brdwy", "Broadway", 42.342622, -71.056967),
  buildStation("place-andrw", "Andrew", 42.330154, -71.057655),
];

export const byId = (
  stations: Station[],
): Partial<Record<StationId, Station>> => {
  return Object.fromEntries(stations.map((station) => [station.id, station]));
};
