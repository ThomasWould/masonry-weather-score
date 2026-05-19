import type { JobInput } from '../types/job'

export type Weather = {
  tempRangeMinF: number
  tempRangeMaxF: number
  precipitationMm: number
  rainChancePercent: number
  windMph: number
  humidityPercent: number
  cloudinessPercent: number
  overnightLowF: number
}

export function calculateMasonryScore(job: JobInput, weather: Weather) {
  let score = 100
  const risks: string[] = []

  const maxT = weather.tempRangeMaxF
  const minT = weather.tempRangeMinF
  const overnightLow = weather.overnightLowF
  const windMph = weather.windMph
  const humid = weather.humidityPercent
  const rainChance = weather.rainChancePercent

  const typeKey = job.jobType.toLowerCase()
  const isPatio = /patio|slab/.test(typeKey)
  const isFootings = /footings?/.test(typeKey)
  const isMortar = /mortar|block/.test(typeKey)
  const isPavers = /pavers?/.test(typeKey)

  const rainPenaltyMultiplier = isPatio ? 1.2 : isPavers ? 0.85 : 1
  const heatPenaltyMultiplier = isPatio ? 1.2 : isPavers ? 0.85 : 1
  const sunPenaltyMultiplier = isPatio ? 1.5 : isFootings ? 0.5 : 1
  const humidityWindPenaltyMultiplier = isPatio ? 1.2 : isFootings ? 0.8 : 1
  const coldPenaltyMultiplier = isMortar ? 1.25 : 1

  const optimizedFor = job.jobType

  // Cold temperature penalties
  if (maxT < 50) {
    score -= 15 * (isPavers ? 0.8 : 1)
    risks.push(`Cool temperatures: high ${maxT}°F`)
  }
  if (maxT < 41) {
    score -= 30 * coldPenaltyMultiplier
    risks.push(`Very cold: high only ${maxT}°F`)
  }
  if (overnightLow < 41) {
    score -= 15 * coldPenaltyMultiplier
    risks.push(`Freezing overnight: low ${overnightLow}°F`)
  }
  if (overnightLow < 32) {
    score -= 40 * coldPenaltyMultiplier
    risks.push(`Extreme cold overnight: low ${overnightLow}°F`)
  }

  // Hot/dry/windy penalties
  if (maxT > 89) {
    score -= 15 * heatPenaltyMultiplier
    risks.push(`Very hot: high ${maxT}°F`)
  }

  const dryWindThreshold = isFootings ? 20 : 15
  if (humid < 35 && windMph > dryWindThreshold) {
    score -= 15 * humidityWindPenaltyMultiplier
    risks.push(`Dry and windy: ${humid}% humidity, ${windMph} mph wind`)
  }
  if (windMph > 25) {
    const windPenalty = isFootings ? 10 : 15
    score -= windPenalty
    risks.push(`High wind: ${windMph} mph`)
  }

  // Rain penalties — stronger impact
  if (rainChance > 30 && rainChance <= 49) {
    const moderateRainPenalty = isMortar ? 10 : 20 * rainPenaltyMultiplier
    score -= moderateRainPenalty
    risks.push(`Moderate rain risk: ${rainChance}% chance`)
  }
  if (rainChance >= 50 && rainChance <= 69) {
    const highRainPenalty = isPavers ? 30 : 35 * rainPenaltyMultiplier
    score -= highRainPenalty
    risks.push(`High rain risk: ${rainChance}% chance`)
  }
  if (rainChance >= 70) {
    score -= 55
    risks.push(`Very high rain risk: ${rainChance}% chance`)
  }

  // Sun exposure risk
  if (job.sunExposure === 'High') {
    const sunPenalty = 5 * sunPenaltyMultiplier
    score -= sunPenalty
    risks.push('High sun exposure increases evaporation risk')
  }

  // Long job duration risk
  if (job.durationHours > 8) {
    score -= 6
    risks.push(`Long duration: ${job.durationHours} hours`)
  }

  // Clamp and round
  score = Math.max(0, Math.min(100, Math.round(score)))

  // Determine status based on thresholds
  let status: 'Good' | 'Caution' | 'Avoid' = 'Good'
  let recommendation = 'Conditions look suitable. Proceed with standard precautions.'
  const suggestions: string[] = []

  if (score >= 80 && rainChance <= 40) {
    status = 'Good'
  } else if (score >= 60) {
    status = 'Caution'
  } else {
    status = 'Avoid'
  }

  if (isPatio) {
    recommendation = 'Surface finishing conditions may become difficult in high heat.'
  } else if (isFootings) {
    recommendation = 'Conditions are generally suitable for below-grade concrete work.'
  } else if (isMortar) {
    recommendation = 'Cold overnight temperatures may affect mortar curing.'
  } else if (isPavers) {
    recommendation = 'Pavers are more tolerant, but avoid heavy rain for best results.'
  } else if (status === 'Good') {
    recommendation = 'Conditions look suitable. Proceed with standard precautions.'
  } else if (status === 'Caution') {
    recommendation = 'Proceed only if timing can avoid the listed risks. Monitor weather closely.'
  } else {
    recommendation = 'Conditions are risky for masonry/concrete work. Consider rescheduling.'
  }

  if (maxT > 89) {
    suggestions.push('Start early to avoid peak afternoon heat.')
    suggestions.push('Keep concrete moist during curing.')
  }

  if (rainChance > 30) {
    suggestions.push('Monitor radar before final finishing.')
    suggestions.push('Prepare coverings in case of sudden rain.')
  }

  if (overnightLow < 41) {
    suggestions.push('Consider insulated blankets overnight.')
  }

  if (humid < 35 && windMph > dryWindThreshold) {
    suggestions.push('Rapid surface drying possible. Monitor curing carefully.')
  }

  // Best start window heuristic
  let bestStartWindow = 'Now'
  if (rainChance >= 50) {
    bestStartWindow = 'Avoid current window — rain likely'
  } else if (rainChance > 30) {
    bestStartWindow = 'Wait — rain likely'
  } else if (maxT > 89) {
    bestStartWindow = 'Early morning or evening'
  } else if (maxT < 41) {
    bestStartWindow = 'Check overnight forecast first'
  } else if (maxT >= 50 && maxT <= 85 && humid >= 35 && windMph <= 20) {
    bestStartWindow = 'Now — good window'
  } else {
    bestStartWindow = 'Monitor and plan carefully'
  }

  return { score, status, riskFactors: risks, recommendation, bestStartWindow, optimizedFor, suggestions }
}
