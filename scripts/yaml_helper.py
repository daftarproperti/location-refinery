import os
import sys
import yaml

class YamlHelper:
    def __init__(self, city_name):
        self.city_name = city_name
        self.base_dir = os.path.dirname(os.path.abspath(__file__))


    def load_source_yaml(self):
        path = os.path.join(self.base_dir, '../sources', self.city_name, 'source.yaml')
        try:
            with open(path, 'r') as file:
                return yaml.safe_load(file)
        except FileNotFoundError:
            print(f"Error: source.yaml not found for city '{self.city_name}'. Please look at sources directory for city name")
            return None

    
    def parse_to_yaml(self, yaml_file_name, yaml_data, subdir = None):
        base_path = os.path.join(self.base_dir, '../output', self.city_name)
        if subdir:
            base_path = os.path.join(base_path, subdir)

        os.makedirs(base_path, exist_ok=True)
        output_path = os.path.join(base_path, f'{yaml_file_name}.yaml')

        with open(output_path, 'w') as yaml_file:
            yaml.dump(
                yaml_data,
                yaml_file,
                default_flow_style=False,
                allow_unicode=True,
                sort_keys=False,
                indent=2,
                width=80 
            )
