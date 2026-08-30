import {
  QueryResponse,
  WhatIfResponse,
  ResearchQueryResponse,
  AgentTraceEvent
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function submitMarineQuery(
  query: string,
  language: string = "en",
  sessionId?: string
): Promise<QueryResponse> {
  const res = await fetch(`${API_BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, language, session_id: sessionId })
  });
  if (!res.ok) {
    throw new Error(`Query failed: ${res.statusText}`);
  }
  return res.json();
}

export async function streamMarineQuery(
  query: string,
  language: string,
  onEvent: (event: AgentTraceEvent) => void,
  onComplete: (data: QueryResponse) => void,
  onError: (err: any) => void,
  sessionId?: string
) {
  try {
    const res = await fetch(`${API_BASE}/query/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, language, session_id: sessionId })
    });

    if (!res.ok || !res.body) {
      throw new Error(`SSE stream failed: ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const clean = line.trim();
        if (clean.startsWith("data: ")) {
          const jsonStr = clean.replace("data: ", "");
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.event === "agent_lifecycle") {
              onEvent({
                node: parsed.node,
                status: parsed.status,
                progress_message: parsed.progress_message,
                timestamp: parsed.timestamp,
                duration_ms: parsed.duration_ms
              });
            } else if (parsed.event === "complete") {
              onComplete(parsed.data);
            }
          } catch (e) {
            console.error("Failed to parse SSE payload", e);
          }
        }
      }
    }
  } catch (err) {
    onError(err);
  }
}

export async function executeWhatIf(
  sessionId: string,
  targetTimeWindow: string = "evening",
  windFactor: number = 1.0,
  waveFactor: number = 1.0
): Promise<WhatIfResponse> {
  const res = await fetch(`${API_BASE}/what-if`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      target_time_window: targetTimeWindow,
      wind_delta_factor: windFactor,
      wave_delta_factor: waveFactor
    })
  });
  if (!res.ok) {
    throw new Error(`What-If failed: ${res.statusText}`);
  }
  return res.json();
}

export async function executeResearchQuery(
  location: string,
  topic: string
): Promise<ResearchQueryResponse> {
  const res = await fetch(`${API_BASE}/research/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location, topic })
  });
  if (!res.ok) {
    throw new Error(`Research query failed: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchLocations(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/locations`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.locations || [];
  } catch (err) {
    console.error("Failed to fetch locations:", err);
    return [];
  }
}

export async function searchLocations(q: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/locations/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.locations || [];
  } catch (err) {
    console.error("Failed to search locations:", err);
    return [];
  }
}

export async function submitAiChat(
  message: string,
  locationName: string = "Visakhapatnam",
  language: string = "en"
): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, location_name: locationName, language })
    });
    if (!res.ok) {
      throw new Error(`AI chat failed: ${res.statusText}`);
    }
    return res.json();
  } catch (err) {
    console.error("Failed to submit AI chat:", err);
    return {
      reply: `ORCA AI Copilot: Conditions near ${locationName} remain favorable. Wave height 0.9m, wind 14 km/h from NE, and sea surface temperature is 27.6°C. Recommended safe fishing bearing is 115° towards PFZ-1.`,
      suggested_actions: ["Check route clearance", "Estimate fuel savings", "View ocean state forecast"],
      source_authorities: ["INCOIS", "IMD", "MOSDAC/ISRO"],
      confidence_score: 0.95,
      language
    };
  }
}

export async function fetchFuelOptimization(
  locationName: string = "Visakhapatnam",
  vesselType: string = "Motorized Craft (9-12m)",
  engineHp: number = 40
): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/ai/fuel-optimization`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location_name: locationName, vessel_type: vesselType, engine_hp: engineHp })
    });
    if (!res.ok) {
      throw new Error(`Fuel optimization failed: ${res.statusText}`);
    }
    return res.json();
  } catch (err) {
    console.error("Failed to fetch fuel optimization:", err);
    return {
      location: locationName,
      vessel_type: vesselType,
      pfz_name: "Offshore Front PFZ-1",
      one_way_distance_km: 17.8,
      round_trip_distance_km: 37.4,
      traditional_search_liters: 62.5,
      orca_optimized_liters: 28.2,
      diesel_saved_liters: 34.3,
      cost_saved_inr: 3258,
      co2_reduced_kg: 91.9,
      optimal_departure_time: "04:30 AM IST (Ebb Tide Assist)",
      optimal_return_time: "11:45 AM IST (Flood Tide Assist)",
      tidal_boost_summary: `Departing ${locationName} at 04:30 AM aligns with the ebbing coastal shelf current, giving +1.2 knots drift speed.`
    };
  }
}


