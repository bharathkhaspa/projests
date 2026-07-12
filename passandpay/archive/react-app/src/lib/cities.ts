// A small set of Indian cities with approximate [lng, lat] coordinates.
// Used for the location picker, route lines and distance estimation.

export interface City {
  name: string
  state: string
  coord: [number, number] // [lng, lat]
}

export const CITIES: City[] = [
  { name: 'Mumbai', state: 'Maharashtra', coord: [72.8777, 19.076] },
  { name: 'Pune', state: 'Maharashtra', coord: [73.8567, 18.5204] },
  { name: 'Delhi', state: 'Delhi', coord: [77.1025, 28.7041] },
  { name: 'Gurugram', state: 'Haryana', coord: [77.0266, 28.4595] },
  { name: 'Bengaluru', state: 'Karnataka', coord: [77.5946, 12.9716] },
  { name: 'Hyderabad', state: 'Telangana', coord: [78.4867, 17.385] },
  { name: 'Chennai', state: 'Tamil Nadu', coord: [80.2707, 13.0827] },
  { name: 'Kolkata', state: 'West Bengal', coord: [88.3639, 22.5726] },
  { name: 'Ahmedabad', state: 'Gujarat', coord: [72.5714, 23.0225] },
  { name: 'Surat', state: 'Gujarat', coord: [72.8311, 21.1702] },
  { name: 'Jaipur', state: 'Rajasthan', coord: [75.7873, 26.9124] },
  { name: 'Lucknow', state: 'Uttar Pradesh', coord: [80.9462, 26.8467] },
  { name: 'Nagpur', state: 'Maharashtra', coord: [79.0882, 21.1458] },
  { name: 'Indore', state: 'Madhya Pradesh', coord: [75.8577, 22.7196] },
  { name: 'Coimbatore', state: 'Tamil Nadu', coord: [76.9558, 11.0168] },
  { name: 'Kochi', state: 'Kerala', coord: [76.2673, 9.9312] },
  { name: 'Chandigarh', state: 'Chandigarh', coord: [76.7794, 30.7333] },
  { name: 'Bhopal', state: 'Madhya Pradesh', coord: [77.4126, 23.2599] },
]

export const CITY_NAMES = CITIES.map((c) => c.name)

export function getCity(name: string): City | undefined {
  return CITIES.find((c) => c.name.toLowerCase() === name.toLowerCase())
}

/** Haversine great-circle distance in km between two [lng, lat] points. */
export function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b[1] - a[1])
  const dLng = toRad(b[0] - a[0])
  const lat1 = toRad(a[1])
  const lat2 = toRad(b[1])
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * R * Math.asin(Math.sqrt(h))
}

/**
 * Road distance estimate. Great-circle distance scaled by a 1.25 detour
 * factor to approximate real highway routing.
 */
export function roadDistanceKm(from: string, to: string): number {
  const a = getCity(from)
  const b = getCity(to)
  if (!a || !b) return 0
  return Math.round(haversineKm(a.coord, b.coord) * 1.25)
}

/** Linear interpolation between two coordinates (for live-tracking position). */
export function lerpCoord(
  a: [number, number],
  b: [number, number],
  t: number,
): [number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
}
