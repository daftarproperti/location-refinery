from shapely.geometry import Polygon


class OSMParser:
    def __init__(self, city_name):
        self.city_name = city_name
        self.ways = {}
        self.nodes = {}

    
    def extract_name(self, tags):
        if 'name' not in tags:
            return ""
    
        name = tags['name']
        if 'name:id' in tags:
            name = tags['name:id']

        return name

    
    # Alt names are separated by semi-colon
    # Ref: https://wiki.openstreetmap.org/wiki/Key:alt_name
    def extract_alt_name(self, tags):
        if 'alt_name:id' in tags:
            alt_name = tags['alt_name:id']
        elif 'alt_name' in tags:
            alt_name = tags['alt_name']
        else:
            return []

        return [name.strip() for name in alt_name.split(';')]

    
    # Extract Nodes and Ways and store it
    # Usage: Defining Boundaries Coordinate
    def extract_way_nodes(self, elements):
        for element in elements:
            if element['type'] == 'way':
                self.ways[element['id']] = element
            elif element['type'] == 'node':
                self.nodes[element['id']] = element


    def generate_boundaries(self, element):
        boundaries = []
        seen_ids = set()

        if 'members' in element:
            for member in element['members']:
                if member['type'] == 'way' and member['ref'] in self.ways:
                    way = self.ways[member['ref']]
                    for node_id in way.get('nodes', []):
                        if node_id in seen_ids:
                            continue

                        node = self.nodes.get(node_id)
                        if node and 'lat' in node and 'lon' in node:
                            boundaries.append({
                                'osmId': node_id,
                                'lat': node['lat'],
                                'lon': node['lon']
                            })
                            seen_ids.add(node_id)

        elif 'nodes' in element:
            for node_id in element['nodes']:
                if node_id in seen_ids:
                    continue

                node = self.nodes.get(node_id)
                if node and 'lat' in node and 'lon' in node:
                    boundaries.append({
                        'osmId': node_id,
                        'lat': node['lat'],
                        'lon': node['lon']
                    })
                    seen_ids.add(node_id)


        boundaries.sort(key=lambda x: x['osmId'])

        return boundaries

    
    def extract_area(self, element):
        tags = element['tags']

        area_details = {
            'id': element['id'],
            'name': self.extract_name(tags),
            'alt_name': self.extract_alt_name(tags),
            'type': element['type'],
            'admin_level': tags['admin_level'],
            'boundaries': f"boundaries/{element['id']}.yaml"
        }

        return area_details

    
    def extract_amenity(self, element):
        tags = element['tags']

        lat = element.get('lat')
        lon = element.get('lon')
        if (not lat or not lon) and 'center' in element:
            lat = element['center']['lat']
            lon = element['center']['lon']

        if (not lat or not lon):
            node_coordinates = self.generate_boundaries(element)
            # Calculate centroid using Shapely Polygon
            if node_coordinates:
                centroid = self.get_centroid(node_coordinates)
                lat = float(centroid.y)
                lon = float(centroid.x)
    
        amenity_details = {
            'id': element['id'],
            'name': self.extract_name(tags),
            'alt_name': self.extract_alt_name(tags),
            'latitude': lat,
            'longitude': lon,
            'type': element['type'],
            'amenity_type': tags['amenity']
        }

        return amenity_details


    def get_centroid(self, coordinates):
        coordinate_points = [(coordinate['lon'], coordinate['lat']) for coordinate in coordinates]
        node_polygon = Polygon(coordinate_points)
        centroid = node_polygon.centroid

        return centroid
        

