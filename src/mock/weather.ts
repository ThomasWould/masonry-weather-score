import type { Weather } from '../logic/concreteScore'

export function getMockWeatherForZip(zip: string): Weather {
  // Deterministic mock based on zip numeric sum; returns realistic non-perfect scores
  const n = zip.split('').reduce((s, c) => s + (parseInt(c) || 0), 0)

  // Generate Fahrenheit temps (realistic range 35-85°F)
  const minTempF = 42 + (n % 25)  // 42-66°F
  const maxTempF = minTempF + (n % 18)  // spread of 0-17°F above min
  const overnightLowF = Math.max(25, minTempF - 5 - (n % 8))  // typically 5-8°F colder than min

  // Precipitation and rain chance (lower base rates for realism)
  const precip = (n % 7) === 0 ? 0.3 : (n % 5) === 0 ? 0.1 : 0
  const rainChance = Math.min(100, Math.round((precip * 50) + (n % 20)))

  // Wind in mph (typical ranges 3-20 mph, occasional higher)
  const windMph = 3 + (n % 18)

  // Humidity (realistic 30-75%)
  const humidity = 35 + (n % 50)

  return {
    tempRangeMinF: minTempF,
    tempRangeMaxF: maxTempF,
    precipitationMm: precip,
    rainChancePercent: rainChance,
    windMph: windMph,
    humidityPercent: humidity,
    cloudinessPercent: Math.min(100, Math.round(humidity * 0.7)),
    overnightLowF: overnightLowF,
  }
}
