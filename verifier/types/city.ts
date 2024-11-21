export type Data = {
  cityInfo?: City;
  locations?: Locations;
};

export type City = {
  id: string;
  name: string;
  lat: number;
  lon: number;
};

export type Locations = {
  districts: Area[];
  subDistricts: Area[];
  schools: Amenity[];
  hospitals: Amenity[];
  busStations: Amenity[];
  fireStations: Amenity[];
  marketplaces: Amenity[];
  universities: Amenity[];
  placesOfWorship: Amenity[];
};

export type Area = {
  id: number;
  name: string;
  boundaries: Boundary[] | string;
  alt_name: string[];
  lat: number;
  lon: number;
};

export type Boundary = {
  id: number;
  lat: number;
  lon: number;
  wayId: number;
};

export type Amenity = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  alt_name: string[];
};
