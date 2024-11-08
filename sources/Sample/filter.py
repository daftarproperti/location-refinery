class SampleFilter:
    def filter(self, osm_obj):
        tags = osm_obj['tags']
        name = tags['name']
        
        if name == 'Rumah Sakit TNI AL Dr. Oepomo':
            return None
        
        return osm_obj