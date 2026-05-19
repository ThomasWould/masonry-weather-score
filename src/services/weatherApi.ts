import type { Weather } from '../logic/concreteScore'

export type Location = {
  lat: number
  lon: number
  city: string
  state: string
}

export type HourlyWorkWindowItem = {
  time: string
  tempF: number
  humidityPercent: number
  rainChancePercent: number
  windMph: number
  precipitationMm: number
}

type ZippoPlace = {
  'place name': string
  'state abbreviation': string
  latitude: string
  longitude: string
}

type ZippoResponse = {
  'post code': string
  country: string
  'country abbreviation': string
  places: ZippoPlace[]
}

type OpenMeteoResponse = {
  hourly: {
    time: string[]
    temperature_2m: number[]
    relative_humidity_2m: number[]
    precipitation_probability: number[]
    precipitation: number[]
    wind_speed_10m: number[]
    wind_gusts_10m: number[]
    cloud_cover: number[]
  }
  daily: {
    time: string[]
    temperature_2m_min: number[]
    temperature_2m_max: number[]
    precipitation_probability_max: number[]
  }
}

export async function fetchLocationFromZip(zip: string): Promise<Location> {
  const zip5 = zip.trim()
  const isFiveDigit = /^[0-9]{5}$/.test(zip5)

  if (!isFiveDigit) {
    throw new Error("We couldn't find that ZIP code. Please check it and try again.")
  }

  const response = await fetch(`https://api.zippopotam.us/us/${zip5}`)
  if (!response.ok) {
    throw new Error("We couldn't find that ZIP code. Please check it and try again.")
  }

  const data: ZippoResponse = await response.json()
  if (!data.places || data.places.length === 0) {
    throw new Error("We couldn't find that ZIP code. Please check it and try again.")
  }

  const place = data.places[0]
  const lat = Number(place.latitude)
  const lon = Number(place.longitude)
  const city = place['place name']
  const state = place['state abbreviation']

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    throw new Error("We couldn't find that ZIP code. Please check it and try again.")
  }

  return {
    lat,
    lon,
    city,
    state,
  }
}

export async function fetchWeatherFromOpenMeteo(
  lat: number,
  lon: number,
  startTimeISO: string,
  durationHours: number
): Promise<{ weather: Weather; workWindowHourly: HourlyWorkWindowItem[] }> {
  const baseUrl = 'https://api.open-meteo.com/v1/forecast'
  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,wind_speed_10m,wind_gusts_10m,cloud_cover',
    daily: 'temperature_2m_min,temperature_2m_max,precipitation_probability_max',
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    timezone: 'auto',
  })

  const url = `${baseUrl}?${params.toString()}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Weather API error: ${response.statusText}`)
  }

  const data: OpenMeteoResponse = await response.json()

  const startDate = new Date(startTimeISO)
  const endDate = new Date(startDate.getTime() + durationHours * 60 * 60 * 1000)

  const selectedHours = data.hourly.time
    .map((timeStr, idx) => ({ timeStr, time: new Date(timeStr), idx }))
    .filter(({ time }) => time >= startDate && time < endDate)

  let tempMin = Infinity
  let tempMax = -Infinity
  let humiditySum = 0
  let humidityCount = 0
  let windMax = 0
  let rainChanceMax = 0
  let precipSum = 0

  const workWindowHourly = selectedHours.map(({ timeStr, idx }) => {
    const temp = data.hourly.temperature_2m[idx]
    const humidity = data.hourly.relative_humidity_2m[idx]
    const wind = data.hourly.wind_speed_10m[idx]
    const rainChance = data.hourly.precipitation_probability[idx]
    const precipitation = data.hourly.precipitation[idx] || 0

    tempMin = Math.min(tempMin, temp)
    tempMax = Math.max(tempMax, temp)
    humiditySum += humidity
    humidityCount += 1
    windMax = Math.max(windMax, wind)
    rainChanceMax = Math.max(rainChanceMax, rainChance)
    precipSum += precipitation

    return {
      time: timeStr,
      tempF: Math.round(temp),
      humidityPercent: Math.round(humidity),
      rainChancePercent: Math.round(rainChance),
      windMph: Math.round(wind),
      precipitationMm: parseFloat(precipitation.toFixed(2)),
    }
  })

  if (workWindowHourly.length === 0) {
    const dayIdx = data.daily.time.findIndex((d) => d.startsWith(startDate.toISOString().split('T')[0]))
    if (dayIdx >= 0) {
      tempMin = data.daily.temperature_2m_min[dayIdx]
      tempMax = data.daily.temperature_2m_max[dayIdx]
      rainChanceMax = data.daily.precipitation_probability_max[dayIdx]
      humiditySum = 50
      humidityCount = 1
    }
  }

  const avgHumidity = humidityCount > 0 ? Math.round(humiditySum / humidityCount) : 50
  const totalPrecip = precipSum

  const tomorrow = new Date(startDate)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowDateStr = tomorrow.toISOString().split('T')[0]
  const tomorrowIdx = data.daily.time.findIndex((d) => d.startsWith(tomorrowDateStr))
  const overnightLow = tomorrowIdx >= 0 ? data.daily.temperature_2m_min[tomorrowIdx] : tempMin - 5

  const fallbackWorkWindow = workWindowHourly.length === 0
    ? [{
        time: startTimeISO,
        tempF: Math.round(tempMax === -Infinity ? 50 : tempMax),
        humidityPercent: avgHumidity,
        rainChancePercent: Math.round(rainChanceMax),
        windMph: Math.round(windMax),
        precipitationMm: parseFloat(totalPrecip.toFixed(2)),
      }]
    : workWindowHourly

  return {
    weather: {
      tempRangeMinF: Math.round(tempMin),
      tempRangeMaxF: Math.round(tempMax),
      precipitationMm: parseFloat(totalPrecip.toFixed(2)),
      rainChancePercent: Math.round(rainChanceMax),
      windMph: Math.round(windMax),
      humidityPercent: avgHumidity,
      cloudinessPercent: 50,
      overnightLowF: Math.round(overnightLow),
    },
    workWindowHourly: fallbackWorkWindow,
  }
}
