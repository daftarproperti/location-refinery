# Location Refinery

This Python script extracts data from OSM and export it as code.

## Prerequisites

Before running the script, ensure you have the following installed:

- Python 3
- Requests library (install using `pip install requests`)
- Pyyaml library (install using `pip install pyyaml`)

## Usage

### Creating Generator Input and Custom Filter
- Create a new directory at directory `sources`
- In the new directory, create `source.yaml`
    - Yaml must consist of 3 keys
        - name
            - City Name
        - osmId
            - City OSM ID
            - Format: `relation/<OSM ID>`
                - To Get this value, Visit [Open Street Map](https://www.openstreetmap.org/)
                - Then in the Search Bar, search for desired city name and select desired city from the search results
                - Then copy the OSM ID value from url path
                    - For example Jakarta Barat City: https://www.openstreetmap.org/relation/7626001
                    - So the value should be: `relation/7626001`
- In the same directory, create `filter.py`
    - In the py file, define a new class with the same name as directory
        - For example:
            - Directory `Sample` would have `SampleFilter` class name
            - Directory `New Sample` would have `NewSampleFilter` class name
    - In the new class, define new filter function that accepts `self` and `osm_obj` as parameters

- View `sources/Sample` for reference

### Running the script
- Run following command from location-refinery root directory
```
python scripts/generate.py
```

- Then enter desired city name to be generated
