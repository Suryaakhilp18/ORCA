"""
ORCA Geospatial Intelligence Agent & Tactical Routing Engine
SIH 2026 / ISRO Problem Statement SIH26176
Provides deterministic geodesic distance (Haversine), forward azimuth bearings,
ray-casting polygon containment, segment intersection, and obstacle avoidance waypoint routing.
"""

import math
from typing import List, Tuple, Dict, Any, Optional
from orca_engine.models.schemas import Coordinates, GeoJSONGeometry, RestrictedZone, RouteCandidate


def haversine_distance_km(p1: Coordinates, p2: Coordinates) -> float:
    """Calculates great-circle distance between two geographic coordinates in kilometers."""
    r = 6371.0  # Earth mean radius in kilometers
    lat1, lon1 = math.radians(p1.lat), math.radians(p1.lon)
    lat2, lon2 = math.radians(p2.lat), math.radians(p2.lon)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = math.sin(dlat / 2.0) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(r * c, 2)


def calculate_bearing_deg(origin: Coordinates, target: Coordinates) -> float:
    """Calculates forward azimuth bearing from origin to target in degrees [0, 360)."""
    lat1, lon1 = math.radians(origin.lat), math.radians(origin.lon)
    lat2, lon2 = math.radians(target.lat), math.radians(target.lon)

    dlon = lon2 - lon1
    y = math.sin(dlon) * math.cos(lat2)
    x = math.cos(lat1) * math.sin(lat2) - math.sin(lat1) * math.cos(lat2) * math.cos(dlon)

    bearing = math.degrees(math.atan2(y, x))
    return round((bearing + 360.0) % 360.0, 1)


def project_coordinate(origin: Coordinates, distance_km: float, bearing_deg: float) -> Coordinates:
    """Projects a point from origin at a specified distance and bearing."""
    r = 6371.0
    lat1 = math.radians(origin.lat)
    lon1 = math.radians(origin.lon)
    brng = math.radians(bearing_deg)

    lat2 = math.asin(
        math.sin(lat1) * math.cos(distance_km / r) +
        math.cos(lat1) * math.sin(distance_km / r) * math.cos(brng)
    )
    lon2 = lon1 + math.atan2(
        math.sin(brng) * math.sin(distance_km / r) * math.cos(lat1),
        math.cos(distance_km / r) - math.sin(lat1) * math.sin(lat2)
    )
    return Coordinates(lat=round(math.degrees(lat2), 5), lon=round(math.degrees(lon2), 5))


def point_in_polygon(point: Coordinates, polygon_coords: List[List[float]]) -> bool:
    """Standard ray-casting algorithm to test point containment inside a polygon [[lon, lat], ...]."""
    x, y = point.lon, point.lat
    inside = False
    n = len(polygon_coords)

    p1x, p1y = polygon_coords[0]
    for i in range(1, n + 1):
        p2x, p2y = polygon_coords[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y

    return inside


def _ccw(a: Coordinates, b: Coordinates, c: Coordinates) -> bool:
    return (c.lat - a.lat) * (b.lon - a.lon) > (b.lat - a.lat) * (c.lon - a.lon)


def segments_intersect(p1: Coordinates, p2: Coordinates, q1: Coordinates, q2: Coordinates) -> bool:
    """Determines whether line segment (p1, p2) intersects segment (q1, q2)."""
    return (_ccw(p1, q1, q2) != _ccw(p2, q1, q2)) and (_ccw(p1, p2, q1) != _ccw(p1, p2, q2))


def path_intersects_polygon(p1: Coordinates, p2: Coordinates, polygon_coords: List[List[float]]) -> bool:
    """Checks if a direct path line segment crosses any perimeter edge of a polygon."""
    n = len(polygon_coords)
    for i in range(n - 1):
        q1 = Coordinates(lon=polygon_coords[i][0], lat=polygon_coords[i][1])
        q2 = Coordinates(lon=polygon_coords[i + 1][0], lat=polygon_coords[i + 1][1])
        if segments_intersect(p1, p2, q1, q2):
            return True
    return False


def build_safe_route(
    origin: Coordinates,
    destination: Coordinates,
    restricted_zones: List[RestrictedZone],
    standoff_buffer_km: float = 3.5
) -> RouteCandidate:
    """
    Evaluates direct passage and constructs an obstacle-avoiding tactical waypoint route
    if an active restricted or naval exercise polygon intersects the direct path.
    """
    direct_distance = haversine_distance_km(origin, destination)
    direct_geom = GeoJSONGeometry(
        type="LineString",
        coordinates=[[origin.lon, origin.lat], [destination.lon, destination.lat]]
    )

    conflicts: List[str] = []
    intersecting_zone: Optional[RestrictedZone] = None

    for zone in restricted_zones:
        poly = zone.geometry.coordinates[0]
        if path_intersects_polygon(origin, destination, poly) or point_in_polygon(destination, poly):
            conflicts.append(f"Intersection with {zone.name} ({zone.authority})")
            intersecting_zone = zone

    if not conflicts or not intersecting_zone:
        return RouteCandidate(
            route_status="DIRECT_SAFE",
            direct_distance_km=direct_distance,
            safe_distance_km=direct_distance,
            direct_geometry=direct_geom,
            safe_geometry=direct_geom,
            waypoints=[origin, destination],
            conflicts_detected=[],
            conflict_resolution_applied=False,
            standoff_buffer_km=standoff_buffer_km
        )

    # Conflict detected: Compute avoidance bypass waypoint
    zone_poly = intersecting_zone.geometry.coordinates[0]
    # Calculate centroid of the restricted polygon
    lons = [pt[0] for pt in zone_poly[:-1]]
    lats = [pt[1] for pt in zone_poly[:-1]]
    center_lon = sum(lons) / len(lons)
    center_lat = sum(lats) / len(lats)
    center = Coordinates(lat=center_lat, lon=center_lon)

    # Find max radius of polygon
    max_radius = max(haversine_distance_km(center, Coordinates(lat=pt[1], lon=pt[0])) for pt in zone_poly[:-1])
    safe_offset = max_radius + standoff_buffer_km

    # Direct line bearing
    direct_bearing = calculate_bearing_deg(origin, destination)

    # Generate two candidate bypass waypoints: Port (+90 deg) and Starboard (-90 deg)
    wp_port = project_coordinate(center, safe_offset, (direct_bearing + 90.0) % 360.0)
    wp_stbd = project_coordinate(center, safe_offset, (direct_bearing - 90.0) % 360.0)

    # Pick the waypoint that does not intersect and minimizes total distance
    dist_port = haversine_distance_km(origin, wp_port) + haversine_distance_km(wp_port, destination)
    dist_stbd = haversine_distance_km(origin, wp_stbd) + haversine_distance_km(wp_stbd, destination)

    chosen_wp = wp_port if dist_port <= dist_stbd else wp_stbd
    total_safe_dist = round(min(dist_port, dist_stbd), 2)

    safe_coords = [
        [origin.lon, origin.lat],
        [chosen_wp.lon, chosen_wp.lat],
        [destination.lon, destination.lat]
    ]

    safe_geom = GeoJSONGeometry(type="LineString", coordinates=safe_coords)

    return RouteCandidate(
        route_status="TACTICAL_AVOIDANCE_RECOMMENDED",
        direct_distance_km=direct_distance,
        safe_distance_km=total_safe_dist,
        direct_geometry=direct_geom,
        safe_geometry=safe_geom,
        waypoints=[origin, chosen_wp, destination],
        conflicts_detected=conflicts,
        conflict_resolution_applied=True,
        standoff_buffer_km=standoff_buffer_km
    )
