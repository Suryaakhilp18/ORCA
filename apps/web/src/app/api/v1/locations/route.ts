import { NextResponse } from 'next/server';

const LOCATIONS = [
  { id: "visakhapatnam", name: "Visakhapatnam", state: "Andhra Pradesh", region: "East Coast", district: "Visakhapatnam", category: "Port", latitude: 17.6868, longitude: 83.2185, is_demo_scenario: true, live_data_available: true },
  { id: "chennai", name: "Chennai", state: "Tamil Nadu", region: "East Coast", district: "Chennai", category: "Port", latitude: 13.0827, longitude: 80.2707, is_demo_scenario: false, live_data_available: true },
  { id: "mumbai", name: "Mumbai", state: "Maharashtra", region: "West Coast", district: "Mumbai", category: "Port", latitude: 18.9220, longitude: 72.8347, is_demo_scenario: false, live_data_available: true },
  { id: "kochi", name: "Kochi", state: "Kerala", region: "West Coast", district: "Ernakulam", category: "Port", latitude: 9.9312, longitude: 76.2673, is_demo_scenario: false, live_data_available: true },
  { id: "paradip", name: "Paradip", state: "Odisha", region: "East Coast", district: "Jagatsinghpur", category: "Port", latitude: 20.3167, longitude: 86.6167, is_demo_scenario: false, live_data_available: true },
  { id: "kandla", name: "Kandla", state: "Gujarat", region: "West Coast", district: "Kutch", category: "Port", latitude: 23.0033, longitude: 70.2195, is_demo_scenario: false, live_data_available: true },
  { id: "panaji", name: "Panaji (Mormugao)", state: "Goa", region: "West Coast", district: "North Goa", category: "Port", latitude: 15.4167, longitude: 73.8000, is_demo_scenario: false, live_data_available: true },
  { id: "mangalore", name: "Mangalore", state: "Karnataka", region: "West Coast", district: "Dakshina Kannada", category: "Port", latitude: 12.8700, longitude: 74.8800, is_demo_scenario: false, live_data_available: true },
  { id: "kakinada", name: "Kakinada", state: "Andhra Pradesh", region: "East Coast", district: "Kakinada", category: "Fishing Harbour", latitude: 16.9891, longitude: 82.2475, is_demo_scenario: false, live_data_available: true },
  { id: "tuticorin", name: "Tuticorin (V.O.C Port)", state: "Tamil Nadu", region: "East Coast", district: "Thoothukudi", category: "Port", latitude: 8.7642, longitude: 78.1348, is_demo_scenario: false, live_data_available: true },
  { id: "digha", name: "Digha (Shankarpur)", state: "West Bengal", region: "East Coast", district: "Purba Medinipur", category: "Fishing Harbour", latitude: 21.6266, longitude: 87.5074, is_demo_scenario: false, live_data_available: true },
  { id: "port_blair", name: "Port Blair", state: "Andaman & Nicobar Islands", region: "Islands & UTs", district: "South Andaman", category: "Port", latitude: 11.6234, longitude: 92.7265, is_demo_scenario: false, live_data_available: true },
  { id: "kavaratti", name: "Kavaratti", state: "Lakshadweep", region: "Islands & UTs", district: "Lakshadweep", category: "Island Port", latitude: 10.5667, longitude: 72.6417, is_demo_scenario: false, live_data_available: true },
  { id: "porbandar", name: "Porbandar", state: "Gujarat", region: "West Coast", district: "Porbandar", category: "Fishing Harbour", latitude: 21.6417, longitude: 69.6293, is_demo_scenario: false, live_data_available: true },
  { id: "veraval", name: "Veraval", state: "Gujarat", region: "West Coast", district: "Gir Somnath", category: "Fishing Harbour", latitude: 20.9000, longitude: 70.3667, is_demo_scenario: false, live_data_available: true },
  { id: "ratnagiri", name: "Ratnagiri", state: "Maharashtra", region: "West Coast", district: "Ratnagiri", category: "Coastal City", latitude: 16.9902, longitude: 73.3120, is_demo_scenario: false, live_data_available: true },
  { id: "malpe", name: "Malpe Harbour", state: "Karnataka", region: "West Coast", district: "Udupi", category: "Fishing Harbour", latitude: 13.3500, longitude: 74.7000, is_demo_scenario: false, live_data_available: true },
  { id: "munambam", name: "Munambam Harbour", state: "Kerala", region: "West Coast", district: "Ernakulam", category: "Fishing Harbour", latitude: 10.1800, longitude: 76.1700, is_demo_scenario: false, live_data_available: true },
  { id: "kasimedu", name: "Kasimedu Fishing Harbour", state: "Tamil Nadu", region: "East Coast", district: "Chennai", category: "Fishing Harbour", latitude: 13.1200, longitude: 80.3000, is_demo_scenario: false, live_data_available: true },
  { id: "puri", name: "Puri", state: "Odisha", region: "East Coast", district: "Puri", category: "Fishing Harbour", latitude: 19.8135, longitude: 85.8312, is_demo_scenario: false, live_data_available: true }
];

export async function GET() {
  const backendUrl = process.env.PYTHON_BACKEND_URL;
  if (backendUrl) {
    try {
      const resp = await fetch(`${backendUrl}/locations`, { signal: AbortSignal.timeout(2000) });
      if (resp.ok) {
        return NextResponse.json(await resp.json());
      }
    } catch (e) {}
  }

  return NextResponse.json({
    total: LOCATIONS.length,
    locations: LOCATIONS
  });
}
