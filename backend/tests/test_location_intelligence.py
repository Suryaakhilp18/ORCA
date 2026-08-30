"""
Location Resolution & Coastal Port Mapping Tests
SIH 2026 / ISRO Problem Statement SIH26176
"""

from orca_engine.services.location_service import LocationService


def test_coastal_location_resolution():
    # Direct match
    vizag = LocationService.resolve_location("visakhapatnam")
    assert vizag.name == "Visakhapatnam"
    assert vizag.state == "Andhra Pradesh"
    assert 17.6 <= vizag.latitude <= 17.7

    # Entity extraction from query sentence
    chennai_query = LocationService.resolve_location("I am fishing near Chennai tomorrow morning")
    assert chennai_query.name == "Chennai"
    assert chennai_query.state == "Tamil Nadu"

    # Kochi extraction
    kochi_query = LocationService.resolve_location("Is it safe off Cochin port today?")
    assert kochi_query.name == "Kochi"
    assert kochi_query.state == "Kerala"

    # Port Blair extraction
    pb_query = LocationService.resolve_location("Any tuna PFZs around Port Blair?")
    assert pb_query.name == "Port Blair"

    # Fallback to Visakhapatnam baseline if no coastal port mentioned
    fallback = LocationService.resolve_location("Should I venture out?")
    assert fallback.name == "Visakhapatnam"
