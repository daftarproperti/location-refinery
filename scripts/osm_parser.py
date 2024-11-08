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

        if 'members' not in element:
            print(f"Boundaries not found for {element['id']}")

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

        boundaries.sort(key=lambda x: x['osmId'])

        return boundaries

    
    def extract_area(self, element):
        tags = element['tags']
        name = self.extract_name(tags)

        area_details = {
            'id': element['id'],
            'name': name,
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

        if (not lat or not lon) and 'nodes' in element:
            node_coordinates = self.get_node_coordinates(element['nodes'])
            print(f"Calculating centroid for id: {element['id']}")

            # To get rough centroid of boundaries, calculate average of latitudes and longitudes
            if node_coordinates:
                lat = sum(coordinate['lat'] for coordinate in node_coordinates) / len(node_coordinates)
                lon = sum(coordinate['lon'] for coordinate in node_coordinates) / len(node_coordinates)
    
        amenity_details = {
            'id': element['id'],
            'name': self.extract_name(tags),
            'latitude': lat,
            'longitude': lon,
            'type': tags['amenity']
        }

        return amenity_details


    def get_node_coordinates(self, node_ids):
        node_coordinates = []
        for node_id in node_ids:
            node = self.nodes.get(node_id)
            if node and 'lat' in node and 'lon' in node:
                node_coordinates.append({'lat': node['lat'], 'lon': node['lon']})
        return node_coordinates