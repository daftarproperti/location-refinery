import importlib
import json
import os
import requests
import sys
from osm_parser import OSMParser
from yaml_helper import YamlHelper

# Define the Overpass API endpoint
overpass_url = "http://overpass-api.de/api/interpreter"

# To allow more amenities, add key to this array
# Keys can be found at: https://wiki.openstreetmap.org/wiki/Key:amenity
allowed_amenities = {
    "school": "schools",
    "university": "universities",
    "aerodrome": "aerodromes",
    "place_of_worship": "places_of_worship",
    "mall": "malls",
    "hospital": "hospitals",
    "marketplace": "marketplaces",
    "bus_station": "bus_stations",
    "station": "stations",
    "bus_stop": "bus_stops",
    "fire_station": "fire_stations",
}

    
def load_osm_data(osm_id):
    relation_id = osm_id.split("/")[1]
    area_id = 3600000000 + int(relation_id)

    # Administrative levels in Indonesia for level under cities are 6-10
    # But currently only 5(City), 6 (District) and 7 (Subdistrict) are included
    # Source: https://wiki.openstreetmap.org/wiki/Tag:boundary%3Dadministrative#Country_specific_values_%E2%80%8B%E2%80%8Bof_the_key_admin_level=*
    overpass_query = f"""
    [out:json];
    area({area_id})->.city;
    (
    rel["boundary"="administrative"]["admin_level"="5"](area.city);
    rel["boundary"="administrative"]["admin_level"="6"](area.city);
    rel["boundary"="administrative"]["admin_level"="7"](area.city);
    );
    out body;
    >;
    out skel qt;

    (
    node["amenity"](area.city);
    way["amenity"](area.city);
    relation["amenity"](area.city);
    );
    out body;
    >;
    out skel qt;
    """

    response = requests.post(overpass_url, data=overpass_query)
        
    if response.status_code != 200:
        print(f"Error: getting data: {response.status_code}")
        return
            
    data = response.json()
    if 'elements' not in data:
        return None

    return data['elements']


def generate_city_data_by_name(name, osm_parser, yaml_helper):
    if name.startswith("Kota "):
        name = name[len("Kota "):]

    overpass_query = f"""
    [out:json];
    (
        rel['name'='{name}'][type=boundary];
        rel['name:en'='{name}'][type=boundary];
    );
    out body;
    >;
    out skel qt;
    """

    response = requests.post(overpass_url, data=overpass_query)
        
    if response.status_code != 200:
        print(f"Error: getting data: {response.status_code}")
        return
            
    data = response.json()

    if 'elements' not in data:
        return None

    elements = data['elements']
    osm_parser.extract_way_nodes(elements)

    city_yaml_data = {}
    boundaries_yaml_data = {}
    for element in elements:
        if 'tags' not in element:
            continue

        tags = element['tags']

        if 'name' not in tags or 'admin_level' not in tags:
            continue

        if tags['admin_level'] != "5":
            continue

        area_details = osm_parser.extract_area(element)
        if area_details is None:
                continue
            
        boundaries = osm_parser.generate_boundaries(element)
        boundaries_yaml_data = {
            'id': area_details['id'],
            'name': area_details['name'],
            'boundaries': boundaries
        }

        centroid = osm_parser.get_centroid(boundaries)
        lat = float(centroid.y)
        lon = float(centroid.x)

        area_details['lat'] = lat
        area_details['lon'] = lon

        city_yaml_data = area_details
    
    yaml_helper.parse_to_yaml(area_details['id'], boundaries_yaml_data, "boundaries")
    return city_yaml_data  


def load_filter_class(city_name):
    formatted_city_name = city_name.replace(" ", "")
    sources_path = os.path.join(os.path.dirname(__file__), '..', 'sources')
    sys.path.append(sources_path)

    try:
        filter_module = importlib.import_module(f'{city_name}.filter')
        filter_class = getattr(filter_module, f'{formatted_city_name}Filter')
        return filter_class()
    except (ModuleNotFoundError, AttributeError):
        print(f"No filter class found for city: {city_name}")
        return None


def main():
    city_name = input("Enter City Name: ")
    print(f"Generating for '{city_name}' . . .")

    yaml_helper = YamlHelper(city_name)
    yaml_file = yaml_helper.load_source_yaml()
    if yaml_file is None:
        print("Source Yaml File not found. Aborting . . .")
        return

    osm_id = yaml_file.get("osmId", "")
    elements = load_osm_data(osm_id)
    if elements is None:
        print("Empty data from OSM. Aborting . . .")
        return

    filter_class = load_filter_class(city_name)

    osm_parser = OSMParser(city_name)
    osm_parser.extract_way_nodes(elements)

    city_yaml_data = {}
    district_yaml_data = {}
    subdistrict_yaml_data = {}

    districts = []
    subdistricts = []
    amenities_by_type = {}

    city_data_found = False
    for element in elements:
        if 'tags' not in element:
            continue

        tags = element['tags']

        if 'name' not in tags:
            continue
        
        if filter_class and hasattr(filter_class, 'filter'):
            filtered_element = filter_class.filter(element)
            if filtered_element is None:
                continue

        if 'amenity' in tags:
            amenity_type = tags['amenity']
            if amenity_type not in allowed_amenities:
                continue

            amenity_details = osm_parser.extract_amenity(element)
            if amenity_details is None:
                continue

            plural_amenity_type = allowed_amenities[amenity_type]

            if plural_amenity_type not in amenities_by_type:
                amenities_by_type[plural_amenity_type] = []

            amenities_by_type[plural_amenity_type].append(amenity_details)
        
        elif 'admin_level' in tags:
            admin_level = tags['admin_level']
            area_details = osm_parser.extract_area(element)
            if area_details is None:
                continue
            
            boundaries = osm_parser.generate_boundaries(element)
            boundaries_yaml_data = {
                'id': area_details['id'],
                'name': area_details['name'],
                'boundaries': boundaries
            }

            centroid = osm_parser.get_centroid(boundaries)
            lat = float(centroid.y)
            lon = float(centroid.x)

            area_details['lat'] = lat
            area_details['lon'] = lon

            if admin_level == "5":
                city_data_found = True
                city_yaml_data = area_details
                yaml_helper.parse_to_yaml(area_details['id'], boundaries_yaml_data, "boundaries")
            elif admin_level == "6":
                districts.append(area_details)
                yaml_helper.parse_to_yaml(area_details['id'], boundaries_yaml_data, "areas/boundaries")
            elif admin_level == "7":
                subdistricts.append(area_details)
                yaml_helper.parse_to_yaml(area_details['id'], boundaries_yaml_data, "areas/boundaries")

    if city_data_found is False:
        city_yaml_data = generate_city_data_by_name(yaml_file.get("name", ""), osm_parser, yaml_helper)

    districts.sort(key=lambda x: x['id'])
    subdistricts.sort(key=lambda x: x['id'])

    district_yaml_data = {
        'districts': districts
    }

    subdistrict_yaml_data = {
        'sub-districts': subdistricts
    }

    yaml_helper.parse_to_yaml("city", city_yaml_data)
    yaml_helper.parse_to_yaml("districts", district_yaml_data, "areas")
    yaml_helper.parse_to_yaml("sub-districts", subdistrict_yaml_data, "areas")

    for plural_amenity_type, amenity_list in amenities_by_type.items():
        amenity_list.sort(key=lambda x: x['id'])
        amenity_data = {'objects': amenity_list}
        yaml_helper.parse_to_yaml(plural_amenity_type, amenity_data, "amenities")

    print(f"Output is generated in directory: output/{city_name}/")
    print("Generating success . . .")

if __name__ == "__main__":
    main()