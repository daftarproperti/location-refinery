import path from "path";
import readYamlFile from "./readYamlFile";
import { ObjectType } from "./types";

const loadCityData = (cityName: string) => {
  const cityDir = path.join("..", "output", cityName);
  const cityInfo = readYamlFile(path.join(cityDir, "city.yaml"));

  const districtObject = readYamlFile(
    path.join(cityDir, "areas", "district.yaml")
  );
  const districtsObject = districtObject?.["districts"] as ObjectType[];
  const districts = districtsObject?.map((item) => ({
    ...item,
    boundaries: readYamlFile(
      path.join(cityDir, "areas", item?.["boundaries"] as string)
    )?.["boundaries"],
  }));

  const subDistrictObject = readYamlFile(
    path.join(cityDir, "areas", "sub-district.yaml")
  );
  const subDistrictsObject = subDistrictObject?.["sub-districts"] as ObjectType[];
  const subDistricts = subDistrictsObject?.map((item) => ({
    ...item,
    boundaries: readYamlFile(
      path.join(cityDir, "areas", item?.["boundaries"] as string)
    )?.["boundaries"],
  }));

  const schoolsObject = readYamlFile(
    path.join(cityDir, "amenities", "schools.yaml")
  );
  const hospitalsObject = readYamlFile(
    path.join(cityDir, "amenities", "hospitals.yaml")
  );
  const busStationObject = readYamlFile(
    path.join(cityDir, "amenities", "bus_stations.yaml")
  );
  const fireStationObject = readYamlFile(
    path.join(cityDir, "amenities", "fire_stations.yaml")
  );
  const marketplacesObject = readYamlFile(
    path.join(cityDir, "amenities", "marketplaces.yaml")
  );
  const universitiesObject = readYamlFile(
    path.join(cityDir, "amenities", "universities.yaml")
  );
  const placesOfWorshipObject = readYamlFile(
    path.join(cityDir, "amenities", "places_of_worship.yaml")
  );

  const locations = {
    districts,
    subDistricts,
    schools: schoolsObject?.["objects"],
    hospitals: hospitalsObject?.["objects"],
    busStations: busStationObject?.["objects"],
    fireStations: fireStationObject?.["objects"],
    marketplaces: marketplacesObject?.["objects"],
    universities: universitiesObject?.["objects"],
    placesOfWorship: placesOfWorshipObject?.["objects"],
  };

  return { cityInfo, locations };
};

export default loadCityData;
