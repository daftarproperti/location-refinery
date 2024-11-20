import path from "path";
import readYamlFile from "./readYamlFile";
import { Amenity, Area, City, Data } from "@/types";

const loadCityData = (cityName: string): Data => {
  const cityDir = path.join("..", "output", cityName);
  const cityInfo = readYamlFile<City>(path.join(cityDir, "city.yaml"));

  const districtObject = readYamlFile<{ districts: Area[] }>(
    path.join(cityDir, "areas", "districts.yaml")
  );
  const districtsObject = districtObject.districts;
  const districts = districtsObject?.map((item) => ({
    ...item,
    boundaries: readYamlFile<Area>(
      path.join(cityDir, "areas", item.boundaries as string)
    ).boundaries,
  }));

  const subDistrictObject = readYamlFile<{ "sub-districts": Area[] }>(
    path.join(cityDir, "areas", "sub-districts.yaml")
  );
  const subDistrictsObject = subDistrictObject["sub-districts"];
  const subDistricts = subDistrictsObject?.map((item) => ({
    ...item,
    boundaries: readYamlFile<Area>(
      path.join(cityDir, "areas", item.boundaries as string)
    ).boundaries,
  }));

  const schools = readYamlFile<{ objects: Amenity[] }>(
    path.join(cityDir, "amenities", "schools.yaml")
  ).objects;
  const hospitals = readYamlFile<{ objects: Amenity[] }>(
    path.join(cityDir, "amenities", "hospitals.yaml")
  ).objects;
  const busStations = readYamlFile<{ objects: Amenity[] }>(
    path.join(cityDir, "amenities", "bus_stations.yaml")
  ).objects;
  const fireStations = readYamlFile<{ objects: Amenity[] }>(
    path.join(cityDir, "amenities", "fire_stations.yaml")
  ).objects;
  const marketplaces = readYamlFile<{ objects: Amenity[] }>(
    path.join(cityDir, "amenities", "marketplaces.yaml")
  ).objects;
  const universities = readYamlFile<{ objects: Amenity[] }>(
    path.join(cityDir, "amenities", "universities.yaml")
  ).objects;
  const placesOfWorship = readYamlFile<{ objects: Amenity[] }>(
    path.join(cityDir, "amenities", "places_of_worship.yaml")
  ).objects;

  const locations = {
    districts,
    subDistricts,
    schools,
    hospitals,
    busStations,
    fireStations,
    marketplaces,
    universities,
    placesOfWorship,
  };

  return { cityInfo, locations };
};

export default loadCityData;
