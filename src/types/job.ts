export type SunExposure = 'Low' | 'Medium' | 'High'

export type JobInput = {
  zip: string
  jobType: string
  startTime: string // ISO-like string from datetime-local
  durationHours: number
  sunExposure: SunExposure
}
