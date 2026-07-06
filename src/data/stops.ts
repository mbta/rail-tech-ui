import { DirectionId, Segment } from "src/models/route";
import { StationId, Station } from "src/models/stop";
import { reverse } from "src/util/array";

const buildStation = (
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
});

// prettier-ignore
export const allStationsArray: Station[] = [
  // GLX Medford
  buildStation("place-mdftf", "Medford/Tufts", 42.408179, -71.117185, "Medford"),
  buildStation("place-balsq", "Ball Square", 42.400241, -71.111278, "Ball Sq"),
  buildStation("place-mgngl", "Magoun Square", 42.394251, -71.106788, "Magoun Sq"),
  buildStation("place-gilmn", "Gilman Square", 42.387900, -71.096721, "Gilman Sq"),
  buildStation("place-esomr", "East Somerville", 42.379731, -71.086929, "E Somerville"),
  // GLX Union Sq
  buildStation("place-unsqu", "Union Square", 42.377004, -71.093974, "Union Sq"),
  // subway
  buildStation("place-lech", "Lechmere", 42.371244, -71.076134),
  buildStation("place-spmnl", "Science Park", 42.366664, -71.067666),
  buildStation("place-north", "North Station", 42.365577, -71.06129),
  buildStation("place-haecl", "Haymarket", 42.363021, -71.05829),
  buildStation("place-gover", "Government Center", 42.359705, -71.059215, "Govt Ctr"),
  buildStation("place-pktrm", "Park Street", 42.356395, -71.062424, "Park St"),
  buildStation("place-boyls", "Boylston", 42.35302, -71.06459),
  buildStation("place-armnl", "Arlington", 42.351902, -71.070893),
  buildStation("place-coecl", "Copley", 42.349974, -71.077447),
  buildStation("place-hymnl", "Hynes Convention Center", 42.347888, -71.087903, "Hynes"),
  buildStation("place-kencl", "Kenmore", 42.348949, -71.095169),
  // b branch
  buildStation("place-bland", "Blandford Street", 42.349293, -71.100258, "Blandford St"),
  buildStation("place-buest", "Boston University East", 42.349735, -71.103889, "BU East"),
  buildStation("place-bucen", "Boston University Central", 42.350082, -71.106865, "BU Central"),
  buildStation("place-amory", "Amory Street", 42.350993, -71.114667, "Amory St"),
  buildStation("place-babck", "Babcock Street", 42.351616, -71.119905, "Babcock St"),
  buildStation("place-brico", "Packard's Corner", 42.351967, -71.125031, "Packards Cnr"),
  buildStation("place-harvd", "Harvard Avenue", 42.350243, -71.131355, "Harvard Ave"),
  buildStation("place-grigg", "Griggs Street", 42.348545, -71.134949, "Griggs St"),
  buildStation("place-alsgr", "Allston Street", 42.348701, -71.137955, "Allston St"),
  buildStation("place-wrnst", "Warren Street", 42.348343, -71.140457, "Warren St"),
  buildStation("place-wascm", "Washington Street", 42.343864, -71.142853, "Wash St"),
  buildStation("place-sthld", "Sutherland Road", 42.341614, -71.146202, "Sutherlnd Rd"),
  buildStation("place-chswk", "Chiswick Road", 42.340805, -71.150711, "Chiswick Rd"),
  buildStation("place-chill", "Chestnut Hill Avenue", 42.338169, -71.15316, "Ch Hill Ave"),
  buildStation("place-sougr", "South Street", 42.3396, -71.157661, "South St"),
  buildStation("place-lake", "Boston College", 42.340081, -71.166769, "Boston Col"),
  // c branch
  buildStation("place-smary", "Saint Mary's Street", 42.345974, -71.107353, "St Marys St"),
  buildStation("place-hwsst", "Hawes Street", 42.344906, -71.111145, "Hawes St"),
  buildStation("place-kntst", "Kent Street", 42.344074, -71.114197, "Kent St"),
  buildStation("place-stpul", "Saint Paul Street", 42.343327, -71.116997, "St Paul St"),
  buildStation("place-cool", "Coolidge Corner", 42.342116, -71.121263, "Coolidge Cnr"),
  buildStation("place-sumav", "Summit Avenue", 42.34111, -71.12561, "Summit Ave"),
  buildStation("place-bndhl", "Brandon Hall", 42.340023, -71.129082),
  buildStation("place-fbkst", "Fairbanks Street", 42.339725, -71.131073, "Fairbanks St"),
  buildStation("place-bcnwa", "Washington Square", 42.339394, -71.13533, "Wash Sq"),
  buildStation("place-tapst", "Tappan Street", 42.338459, -71.138702, "Tappan St"),
  buildStation("place-denrd", "Dean Road", 42.337807, -71.141853, "Dean Rd"),
  buildStation("place-engav", "Englewood Avenue", 42.336971, -71.14566, "Englwd Ave"),
  buildStation("place-clmnl", "Cleveland Circle", 42.336142, -71.149326, "Cleveland Cir"),
  // d branch
  buildStation("place-fenwy", "Fenway", 42.345403, -71.104213),
  buildStation("place-longw", "Longwood", 42.341702, -71.109956),
  buildStation("place-bvmnl", "Brookline Village", 42.332608, -71.116857, "Brkline Village"),
  buildStation("place-brkhl", "Brookline Hills", 42.331316, -71.126683, "Brkline Hills"),
  buildStation("place-bcnfd", "Beaconsfield", 42.335765, -71.140455),
  buildStation("place-rsmnl", "Reservoir", 42.335088, -71.148758),
  buildStation("place-chhil", "Chestnut Hill", 42.326753, -71.164699),
  buildStation("place-newto", "Newton Centre", 42.329443, -71.192414, "Nwtn Ctr"),
  buildStation("place-newtn", "Newton Highlands", 42.322381, -71.205509, "Nwtn Hilands"),
  buildStation("place-eliot", "Eliot", 42.319045, -71.216684),
  buildStation("place-waban", "Waban", 42.325845, -71.230609),
  buildStation("place-woodl", "Woodland", 42.332902, -71.243362),
  buildStation("place-river", "Riverside", 42.337352, -71.252685),
  // e branch
  buildStation("place-prmnl", "Prudential", 42.34557, -71.081696),
  buildStation("place-symcl", "Symphony", 42.342687, -71.085056),
  buildStation("place-nuniv", "Northeastern University", 42.340401, -71.088806, "Northeastern"),
  buildStation("place-mfa", "Museum of Fine Arts", 42.337711, -71.095512, "MFA"),
  buildStation("place-lngmd", "Longwood Medical Area", 42.33596, -71.100052, "LMA"),
  buildStation("place-brmnl", "Brigham Circle", 42.334229, -71.104609, "Brigham Cir"),
  buildStation("place-fenwd", "Fenwood Road", 42.333706, -71.105728, "Fenwood Rd"),
  buildStation("place-mispk", "Mission Park", 42.333195, -71.109756),
  buildStation("place-rvrwy", "Riverway", 42.331684, -71.111931),
  buildStation("place-bckhl", "Back of the Hill", 42.330139, -71.111313, "Back Hill"),
  buildStation("place-hsmnl", "Heath Street", 42.328316, -71.110252, "Heath St"),
  // mattapan
  buildStation("place-asmnl", "Ashmont", 42.28452, -71.063777),
  buildStation("place-cedgr", "Cedar Grove", 42.279629, -71.060394),
  buildStation("place-butlr", "Butler", 42.272429, -71.062519),
  buildStation("place-miltt", "Milton", 42.270349, -71.067266),
  buildStation("place-cenav", "Central Avenue", 42.270027, -71.073444, "Central Ave"),
  buildStation("place-valrd", "Valley Road", 42.268347, -71.081343, "Valley Rd"),
  buildStation("place-capst", "Capen Street", 42.267563, -71.087338, "Capen St"),
  buildStation("place-matt", "Mattapan", 42.26762, -71.092486),
  // yards
  buildStation("yard-reser", "Reservoir Yard", 42.3356, -71.1485),
  buildStation("yard-rside", "Riverside Yard", 42.337, -71.254),
  buildStation("yard-lake", "Lake Street Yard", 42.3406, -71.1673),
  buildStation("yard-ibelt", "Inner Belt Yard", 42.376, -71.078),
  buildStation("yard-heath", "Heath St Yard", 42.328316, -71.110252),
  buildStation("yard-matt", "Mattapan Yard", 42.267, -71.092),
];

// east to west
const stationIdsOnSegment = (segment: Segment): StationId[] => {
  switch (segment) {
    case "subway":
      return [
        "place-lech",
        "place-spmnl",
        "place-north",
        "place-haecl",
        "place-gover",
        "place-pktrm",
        "place-boyls",
        "place-armnl",
        "place-coecl",
        "place-hymnl",
        "place-kencl",
      ];

    case "b":
      return [
        "place-gover",
        "place-pktrm",
        "place-boyls",
        "place-armnl",
        "place-coecl",
        "place-hymnl",
        "place-kencl",
        "place-bland",
        "place-buest",
        "place-bucen",
        "place-amory",
        "place-babck",
        "place-brico",
        "place-harvd",
        "place-grigg",
        "place-alsgr",
        "place-wrnst",
        "place-wascm",
        "place-sthld",
        "place-chswk",
        "place-chill",
        "place-sougr",
        "place-lake",
      ];

    case "c":
      return [
        "place-gover",
        "place-pktrm",
        "place-boyls",
        "place-armnl",
        "place-coecl",
        "place-hymnl",
        "place-kencl",
        "place-smary",
        "place-hwsst",
        "place-kntst",
        "place-stpul",
        "place-cool",
        "place-sumav",
        "place-bndhl",
        "place-fbkst",
        "place-bcnwa",
        "place-tapst",
        "place-denrd",
        "place-engav",
        "place-clmnl",
      ];

    case "d":
      return [
        "place-unsqu",
        "place-lech",
        "place-spmnl",
        "place-north",
        "place-haecl",
        "place-gover",
        "place-pktrm",
        "place-boyls",
        "place-armnl",
        "place-coecl",
        "place-hymnl",
        "place-kencl",
        "place-fenwy",
        "place-longw",
        "place-bvmnl",
        "place-brkhl",
        "place-bcnfd",
        "place-rsmnl",
        "place-chhil",
        "place-newto",
        "place-newtn",
        "place-eliot",
        "place-waban",
        "place-woodl",
        "place-river",
      ];

    case "e":
      return [
        "place-mdftf",
        "place-balsq",
        "place-mgngl",
        "place-gilmn",
        "place-esomr",
        "place-lech",
        "place-spmnl",
        "place-north",
        "place-haecl",
        "place-gover",
        "place-pktrm",
        "place-boyls",
        "place-armnl",
        "place-coecl",
        "place-prmnl",
        "place-symcl",
        "place-nuniv",
        "place-mfa",
        "place-lngmd",
        "place-brmnl",
        "place-fenwd",
        "place-mispk",
        "place-rvrwy",
        "place-bckhl",
        "place-hsmnl",
      ];

    case "m":
      return [
        "place-asmnl",
        "place-cedgr",
        "place-butlr",
        "place-miltt",
        "place-cenav",
        "place-valrd",
        "place-capst",
        "place-matt",
      ];
  }
};

export const allStations: Partial<Record<StationId, Station>> =
  Object.fromEntries(allStationsArray.map((station) => [station.id, station]));

export const stationIdsOnSegmentInDirection = (
  segment: Segment,
  direction: DirectionId,
): StationId[] => {
  const eastToWestStationIds = stationIdsOnSegment(segment);
  if (direction === DirectionId.Westbound) {
    return eastToWestStationIds;
  } else {
    return reverse(eastToWestStationIds);
  }
};
