import React, { useState } from 'react'
import WeatherForm from './components/WeatherForm'
import ScoreCard from './components/ScoreCard'
import WeatherSnapshot from './components/WeatherSnapshot'
import WorkWindowBreakdown from './components/WorkWindowBreakdown'
import FeedbackCard from './components/FeedbackCard'
import FeedbackHistory from './components/FeedbackHistory'
import { calculateMasonryScore, type Weather } from './logic/concreteScore'
import type { JobInput } from './types/job'
import { getMockWeatherForZip } from './mock/weather'
import { zipToLocation } from './utils/zipToLocation'
import { fetchLocationFromZip, fetchWeatherFromOpenMeteo, type HourlyWorkWindowItem } from './services/weatherApi'

export default function App() {
  const [result, setResult] = useState<ReturnType<typeof calculateMasonryScore> | null>(null)
  const [currentJob, setCurrentJob] = useState<JobInput | null>(null)
  const [weather, setWeather] = useState<Weather | null>(null)
  const [hourlyBreakdown, setHourlyBreakdown] = useState<HourlyWorkWindowItem[]>([])
  const [locationName, setLocationName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [usingFallback, setUsingFallback] = useState(false)
  const [locationCoords, setLocationCoords] = useState<{lat: number; lon: number} | null>(null)
  const [feedbackRefresh, setFeedbackRefresh] = useState(0)

  const handleSubmit = async (job: JobInput) => {
    setError(null)
    setWarning(null)
    setLoading(true)
    setUsingFallback(false)
    setLocationName(null)
    setHourlyBreakdown([])

    try {
      setCurrentJob(job)
      let location = null
      try {
        location = await fetchLocationFromZip(job.zip)
      } catch {
        location = zipToLocation(job.zip)
        if (!location) {
          throw new Error("We couldn't find that ZIP code. Please check it and try again.")
        }
        setUsingFallback(true)
        setWarning('ZIP lookup service is unavailable. Using local ZIP fallback data.')
      }

      setLocationName(`Weather for ${location.city}, ${location.state}`)
      setLocationCoords({ lat: location.lat, lon: location.lon })

      let fetchedWeather: Weather | null = null
      let workWindowHourly: HourlyWorkWindowItem[] = []
      try {
        const response = await fetchWeatherFromOpenMeteo(location.lat, location.lon, job.startTime, job.durationHours)
        fetchedWeather = response.weather
        workWindowHourly = response.workWindowHourly
      } catch {
        fetchedWeather = getMockWeatherForZip(job.zip)
        setUsingFallback(true)
        setWarning('Weather service is unavailable. Showing fallback weather estimates.')
      }

      const score = calculateMasonryScore(job, fetchedWeather)
      setWeather(fetchedWeather)
      setHourlyBreakdown(workWindowHourly)
      setResult(score)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      setError(msg)
      setResult(null)
      setWeather(null)
      setHourlyBreakdown([])
      setLocationName(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <header>
        <h1>Masonry Weather Score</h1>
        <p className="subtitle">Quick decision aid for masonry & concrete work</p>
      </header>

      <main>
        <WeatherForm onSubmit={handleSubmit} />

        {loading && (
          <div className="card" style={{background:'#fef3c7',color:'#92400e',padding:12,borderRadius:8}}>
            <strong>Loading weather data...</strong>
          </div>
        )}

        {error && (
          <div className="card" style={{background:'#fee2e2',color:'#991b1b',padding:12,borderRadius:8}}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {warning && !error && (
          <div className="card" style={{background:'#fef3c7',color:'#92400e',padding:10,borderRadius:8,fontSize:'0.95rem'}}>
            ⚠️ {warning}
          </div>
        )}

        {!loading && !weather && !error && !warning && (
          <div className="card" style={{background:'#eff6ff',color:'#1d4ed8',padding:12,borderRadius:8}}>
            Enter a ZIP code and job details to get a masonry weather score.
          </div>
        )}

        {weather && (
          <div className="results">
            <WeatherSnapshot weather={weather} locationName={locationName} lat={locationCoords?.lat} lon={locationCoords?.lon} />
          </div>
        )}

        {result && (
          <section className="results">
            <ScoreCard
              score={result.score}
              status={result.status}
              bestStartWindow={result.bestStartWindow}
              riskFactors={result.riskFactors}
              recommendation={result.recommendation}
              optimizedFor={result.optimizedFor}
            />
          </section>
        )}

        {hourlyBreakdown.length > 0 && (
          <section className="results">
            <WorkWindowBreakdown items={hourlyBreakdown} />
          </section>
        )}

        {currentJob && weather && result && (
          <section className="results">
            <FeedbackCard
              job={currentJob}
              weather={weather}
              result={result}
              locationName={locationName}
              hourlyBreakdown={hourlyBreakdown}
              onSaved={() => setFeedbackRefresh((value) => value + 1)}
            />
          </section>
        )}

        <section className="results">
          <FeedbackHistory refreshKey={feedbackRefresh} />
        </section>
      </main>

      <footer>
        <small>
          {usingFallback
            ? 'Fallback or mock data in use.'
            : 'Live weather data from Open-Meteo.'}
        </small>
      </footer>
    </div>
  )
}
