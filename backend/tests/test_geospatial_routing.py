"""
Geospatial Navigation & Tactical Routing Tests
SIH 2026 / ISRO Problem Statement SIH26176
"""

from orca_engine.models.schemas import Coordinates, RestrictedZone, GeoJSONGeometry
from orca_engine.agents.geospatial import (
    haversine_distance_km, calculate_bearing_deg, project_coordinate,
    point_in_polygon, path_intersects_polygon, build_safe_route
)


def test_haversine_distance_accuracy():
    # Visakhapatnam Fishing Harbour (17.6868, 83.2185) to Bheemunipatnam (17.8900, 83.4500)
    p1 = Coordinates(lat=17.6868, lon=83.2185)
    p2 = Coordinates(lat=17.8900, lon=83.4500)
    dist = haversine_distance_km(p1, p2)
    assert 32.0 <= dist <= 35.0


def test_bearing_calculation():
    p1 = Coordinates(lat=17.0, lon=83.0)
    # Directly north
    p_north = Coordinates(lat=18.0, lon=83.0)
    assert calculate_bearing_deg(p1, p_north) == 0.0

    # Directly east
    p_east = Coordinates(lat=17.0, lon=84.0)
    assert 88.0 <= calculate_bearing_deg(p1, p_east) <= 92.0


def test_point_in_polygon():
    square = [
        [83.0, 17.0],
        [83.2, 17.0],
        [83.2, 17.2],
        [83.0, 17.2],
        [83.0, 17.0]
    ]
    inside_pt = Coordinates(lat=17.1, lon=83.1)
    outside_pt = Coordinates(lat=17.3, lon=83.3)

    assert point_in_polygon(inside_pt, square) is True
    assert point_in_polygon(outside_pt, square) is False


def test_tactical_route_avoids_naval_geofence():
    origin = Coordinates(lat=17.6868, lon=83.2185)
    destination = Coordinates(lat=17.7500, lon=83.4500)

    # Place a restricted naval polygon directly between origin and destination
    naval_poly = [
        [83.28, 17.69],
        [83.35, 17.69],
        [83.35, 17.74],
        [83.28, 17.74],
        [83.28, 17.69]
    ]
    restricted_zone = RestrictedZone(
        id="zone-naval-enc",
        name="ENC Naval Exercise Area",
        zone_type="MILITARY_EXERCISE",
        authority="Indian Navy",
        geometry=GeoJSONGeometry(type="Polygon", coordinates=[naval_poly]),
        description="Active surface firing",
        effective_dates="PERMANENT"
    )

    route = build_safe_route(origin, destination, [restricted_zone], standoff_buffer_km=3.5)
    assert route.conflict_resolution_applied is True
    assert route.route_status == "TACTICAL_AVOIDANCE_RECOMMENDED"
    assert len(route.waypoints) == 3
    assert route.safe_distance_km > route.direct_distance_km

    # Verify waypoint clears polygon
    wp = route.waypoints[1]
    assert point_in_polygon(wp, naval_poly) is False
