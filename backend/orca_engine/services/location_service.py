"""
ORCA Coastal Location Database & Geocoding Intelligence
SIH 2026 / ISRO Problem Statement SIH26176
Provides complete coverage across all 9 Indian Coastal States, 2 UTs, and 2 Island Archipelagos.
"""

from typing import List, Dict, Any, Optional
from orca_engine.models.schemas import LocationContext


class CoastalLocation:
    def __init__(
        self,
        id: str,
        name: str,
        state: str,
        region: str,  # "West Coast", "East Coast", "Islands & UTs"
        district: str,
        category: str,  # "Port", "Coastal City", "Fishing Harbour", "Coastal District"
        latitude: float,
        longitude: float,
        is_demo_scenario: bool = False,
        live_data_available: bool = True
    ):
        self.id = id
        self.name = name
        self.state = state
        self.region = region
        self.district = district
        self.category = category
        self.latitude = latitude
        self.longitude = longitude
        self.is_demo_scenario = is_demo_scenario
        self.live_data_available = live_data_available

    def to_context(self) -> LocationContext:
        shelf_az = 115.0 if self.region == "East Coast" else 245.0 if self.region == "West Coast" else 180.0
        return LocationContext(
            name=self.name,
            state=self.state,
            latitude=self.latitude,
            longitude=self.longitude,
            harbour_name=f"{self.name} Fishing Harbour",
            shelf_azimuth_deg=shelf_az,
            is_supported_coastal_zone=True
        )


INDIA_COASTAL_DATABASE: List[CoastalLocation] = [
    # --- WEST COAST ---
    # Gujarat
    CoastalLocation("kandla", "Kandla", "Gujarat", "West Coast", "Kutch", "Port", 23.0033, 70.2195, False, True),
    CoastalLocation("porbandar", "Porbandar", "Gujarat", "West Coast", "Porbandar", "Fishing Harbour", 21.6417, 69.6293, False, True),
    CoastalLocation("veraval", "Veraval", "Gujarat", "West Coast", "Gir Somnath", "Fishing Harbour", 20.9000, 70.3667, False, True),
    CoastalLocation("surat", "Surat (Hazira)", "Gujarat", "West Coast", "Surat", "Port", 21.1167, 72.6500, False, True),
    
    # Maharashtra
    CoastalLocation("mumbai", "Mumbai", "Maharashtra", "West Coast", "Mumbai", "Port", 18.9220, 72.8347, False, True),
    CoastalLocation("sasoon_dock", "Sassoon Dock", "Maharashtra", "West Coast", "Mumbai City", "Fishing Harbour", 18.9130, 72.8250, False, True),
    CoastalLocation("ratnagiri", "Ratnagiri", "Maharashtra", "West Coast", "Ratnagiri", "Coastal City", 16.9902, 73.3120, False, True),
    CoastalLocation("malvan", "Malvan", "Maharashtra", "West Coast", "Sindhudurg", "Fishing Harbour", 16.0560, 73.4680, False, True),
    
    # Goa
    CoastalLocation("panaji", "Panaji (Mormugao)", "Goa", "West Coast", "North Goa", "Port", 15.4167, 73.8000, False, True),
    CoastalLocation("betul", "Betul Harbour", "Goa", "West Coast", "South Goa", "Fishing Harbour", 15.1500, 73.9500, False, True),

    # Karnataka
    CoastalLocation("mangalore", "Mangalore", "Karnataka", "West Coast", "Dakshina Kannada", "Port", 12.8700, 74.8800, False, True),
    CoastalLocation("malpe", "Malpe Harbour", "Karnataka", "West Coast", "Udupi", "Fishing Harbour", 13.3500, 74.7000, False, True),
    CoastalLocation("karwar", "Karwar", "Karnataka", "West Coast", "Uttara Kannada", "Fishing Harbour", 14.8100, 74.1300, False, True),

    # Kerala
    CoastalLocation("kochi", "Kochi", "Kerala", "West Coast", "Ernakulam", "Port", 9.9312, 76.2673, False, True),
    CoastalLocation("munambam", "Munambam Harbour", "Kerala", "West Coast", "Ernakulam", "Fishing Harbour", 10.1800, 76.1700, False, True),
    CoastalLocation("kozhikode", "Kozhikode (Beypore)", "Kerala", "West Coast", "Kozhikode", "Fishing Harbour", 11.1667, 75.8000, False, True),
    CoastalLocation("kollam", "Kollam (Neendakara)", "Kerala", "West Coast", "Kollam", "Fishing Harbour", 8.9400, 76.5300, False, True),
    CoastalLocation("vizhinjam", "Vizhinjam", "Kerala", "West Coast", "Thiruvananthapuram", "Port", 8.3750, 76.9900, False, True),

    # --- EAST COAST ---
    # Tamil Nadu
    CoastalLocation("chennai", "Chennai", "Tamil Nadu", "East Coast", "Chennai", "Port", 13.0827, 80.2707, False, True),
    CoastalLocation("kasimedu", "Kasimedu Fishing Harbour", "Tamil Nadu", "East Coast", "Chennai", "Fishing Harbour", 13.1200, 80.3000, False, True),
    CoastalLocation("cuddalore", "Cuddalore", "Tamil Nadu", "East Coast", "Cuddalore", "Fishing Harbour", 11.7500, 79.7700, False, True),
    CoastalLocation("nagapattinam", "Nagapattinam", "Tamil Nadu", "East Coast", "Nagapattinam", "Fishing Harbour", 10.7667, 79.8400, False, True),
    CoastalLocation("tuticorin", "Tuticorin (V.O.C Port)", "Tamil Nadu", "East Coast", "Thoothukudi", "Port", 8.7642, 78.1348, False, True),
    CoastalLocation("kanyakumari", "Kanyakumari", "Tamil Nadu", "East Coast", "Kanyakumari", "Coastal City", 8.0883, 77.5385, False, True),

    # Andhra Pradesh
    CoastalLocation("visakhapatnam", "Visakhapatnam", "Andhra Pradesh", "East Coast", "Visakhapatnam", "Port", 17.6868, 83.2185, True, True),
    CoastalLocation("kakinada", "Kakinada", "Andhra Pradesh", "East Coast", "Kakinada", "Fishing Harbour", 16.9891, 82.2475, False, True),
    CoastalLocation("machilipatnam", "Machilipatnam", "Andhra Pradesh", "East Coast", "Krishna", "Fishing Harbour", 16.1875, 81.1389, False, True),
    CoastalLocation("nizampatnam", "Nizampatnam", "Andhra Pradesh", "East Coast", "Bapatla", "Fishing Harbour", 15.9040, 80.6680, False, True),
    CoastalLocation("krishnapatnam", "Krishnapatnam", "Andhra Pradesh", "East Coast", "Nellore", "Port", 14.2500, 80.1200, False, True),

    # Odisha
    CoastalLocation("paradip", "Paradip", "Odisha", "East Coast", "Jagatsinghpur", "Port", 20.3167, 86.6167, False, True),
    CoastalLocation("puri", "Puri", "Odisha", "East Coast", "Puri", "Fishing Harbour", 19.8135, 85.8312, False, True),
    CoastalLocation("dhamra", "Dhamra", "Odisha", "East Coast", "Bhadrak", "Port", 20.7900, 86.9600, False, True),
    CoastalLocation("gopalpur", "Gopalpur", "Odisha", "East Coast", "Ganjam", "Port", 19.2600, 84.9100, False, True),

    # West Bengal
    CoastalLocation("digha", "Digha (Sankarpur)", "West Bengal", "East Coast", "Purba Medinipur", "Fishing Harbour", 21.6266, 87.5074, False, True),
    CoastalLocation("haldia", "Haldia", "West Bengal", "East Coast", "Purba Medinipur", "Port", 22.0667, 88.0667, False, True),
    CoastalLocation("kakdwip", "Kakdwip", "West Bengal", "East Coast", "South 24 Parganas", "Fishing Harbour", 21.8700, 88.1800, False, True),

    # --- ISLANDS & UNION TERRITORIES ---
    # Union Territories
    CoastalLocation("puducherry", "Puducherry", "Puducherry", "Islands & UTs", "Puducherry", "Coastal City", 11.9416, 79.8083, False, True),
    CoastalLocation("daman", "Daman", "Dadra and Nagar Haveli and Daman and Diu", "Islands & UTs", "Daman", "Fishing Harbour", 20.3974, 72.8328, False, True),
    CoastalLocation("diu", "Diu (Vanani)", "Dadra and Nagar Haveli and Daman and Diu", "Islands & UTs", "Diu", "Fishing Harbour", 20.7144, 70.9874, False, True),

    # Andaman & Nicobar Islands
    CoastalLocation("port_blair", "Port Blair", "Andaman & Nicobar Islands", "Islands & UTs", "South Andaman", "Port", 11.6234, 92.7265, False, True),
    CoastalLocation("junglighat", "Junglighat Harbour", "Andaman & Nicobar Islands", "Islands & UTs", "South Andaman", "Fishing Harbour", 11.6500, 92.7300, False, True),
    CoastalLocation("mayabunder", "Mayabunder", "Andaman & Nicobar Islands", "Islands & UTs", "North & Middle Andaman", "Coastal City", 12.9200, 92.9300, False, True),

    # Lakshadweep
    CoastalLocation("kavaratti", "Kavaratti", "Lakshadweep", "Islands & UTs", "Lakshadweep", "Coastal City", 10.5667, 72.6417, False, True),
    CoastalLocation("agatti", "Agatti Island", "Lakshadweep", "Islands & UTs", "Lakshadweep", "Fishing Harbour", 10.8500, 72.1800, False, True),
    CoastalLocation("andrott", "Andrott Island", "Lakshadweep", "Islands & UTs", "Lakshadweep", "Fishing Harbour", 10.8200, 73.6700, False, True),
]


def get_all_locations() -> List[CoastalLocation]:
    return INDIA_COASTAL_DATABASE


def get_all_locations_dict() -> List[Dict[str, Any]]:
    return [
        {
            "id": loc.id,
            "name": loc.name,
            "state": loc.state,
            "region": loc.region,
            "district": loc.district,
            "category": loc.category,
            "latitude": loc.latitude,
            "longitude": loc.longitude,
            "is_demo_scenario": loc.is_demo_scenario,
            "live_data_available": loc.live_data_available
        }
        for loc in INDIA_COASTAL_DATABASE
    ]


def search_coastal_locations(query: str) -> List[Dict[str, Any]]:
    q = query.strip().lower()
    if not q:
        return get_all_locations_dict()
    
    matches = [
        loc for loc in INDIA_COASTAL_DATABASE
        if q in loc.name.lower() or q in loc.state.lower() or q in loc.district.lower() or q in loc.category.lower() or q in loc.id.lower()
    ]

    return [
        {
            "id": loc.id,
            "name": loc.name,
            "state": loc.state,
            "region": loc.region,
            "district": loc.district,
            "category": loc.category,
            "latitude": loc.latitude,
            "longitude": loc.longitude,
            "is_demo_scenario": loc.is_demo_scenario,
            "live_data_available": loc.live_data_available
        }
        for loc in matches
    ]


def resolve_coastal_location(query_text: str) -> LocationContext:
    q = query_text.lower()

    # Common aliases
    alias_map = {
        "cochin": "kochi",
        "vizag": "visakhapatnam",
        "bombay": "mumbai",
        "madras": "chennai",
        "calicut": "kozhikode",
        "trivandrum": "vizhinjam",
        "mangalore": "mangalore",
        "panaji": "panaji",
        "goa": "panaji",
        "blair": "port_blair",
        "port blair": "port_blair"
    }

    for alias, target_id in alias_map.items():
        if alias in q:
            for loc in INDIA_COASTAL_DATABASE:
                if loc.id == target_id:
                    return loc.to_context()

    # Search for explicit match in text (avoiding single generic words like 'port')
    for loc in INDIA_COASTAL_DATABASE:
        loc_name_lower = loc.name.lower()
        if loc.id in q:
            return loc.to_context()
        if loc_name_lower in q:
            return loc.to_context()
        # Check first token only if it is distinct
        first_token = loc_name_lower.split(" ")[0].replace("(", "").replace(")", "")
        if first_token not in ["port", "east", "west", "south", "north", "andaman", "dadra"] and first_token in q:
            return loc.to_context()

    # Match state names
    for loc in INDIA_COASTAL_DATABASE:
        if loc.state.lower() in q:
            return loc.to_context()

    # Default to Visakhapatnam baseline
    for loc in INDIA_COASTAL_DATABASE:
        if loc.id == "visakhapatnam":
            return loc.to_context()
    return INDIA_COASTAL_DATABASE[0].to_context()


class LocationService:
    @staticmethod
    def resolve_location(query_text: str) -> LocationContext:
        return resolve_coastal_location(query_text)

    @staticmethod
    def extract_location_name(query_text: str) -> Optional[str]:
        q = query_text.lower()
        alias_map = {
            "cochin": "Kochi",
            "vizag": "Visakhapatnam",
            "bombay": "Mumbai",
            "madras": "Chennai",
            "calicut": "Kozhikode",
            "trivandrum": "Vizhinjam",
            "mangalore": "Mangalore",
            "panaji": "Panaji",
            "goa": "Panaji",
            "blair": "Port Blair",
            "port blair": "Port Blair"
        }
        for alias, name in alias_map.items():
            if alias in q:
                return name
        for loc in INDIA_COASTAL_DATABASE:
            if loc.name.lower() in q or loc.id in q:
                return loc.name
            first_token = loc.name.lower().split(" ")[0].replace("(", "").replace(")", "")
            if first_token not in ["port", "east", "west", "south", "north", "andaman", "dadra"] and first_token in q:
                return loc.name
        return None

    @staticmethod
    def get_supported_locations() -> List[str]:
        return [loc.name for loc in INDIA_COASTAL_DATABASE]

    @staticmethod
    def search_locations(q: str) -> List[Dict[str, Any]]:
        return search_coastal_locations(q)

