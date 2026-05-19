export type Location = {
  lat: number
  lon: number
  city: string
  state: string
}

export function zipToLocation(zip: string): Location | null {
  const mapping: Record<string, Location> = {
    '10001': { lat: 40.7506, lon: -73.9972, city: 'New York', state: 'NY' },
    '19365': { lat: 39.9517, lon: -75.6842, city: 'Parkesburg', state: 'PA' },
    '19320': { lat: 39.8264, lon: -75.8543, city: 'Coatesville', state: 'PA' },
  }
  return mapping[zip] || null
}
