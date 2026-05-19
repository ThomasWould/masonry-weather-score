import React, { useState } from 'react'
import type { JobInput } from '../types/job'
import type { Weather } from '../logic/concreteScore'
import type { HourlyWorkWindowItem } from '../services/weatherApi'

export type FeedbackEntry = {
  timestamp: string
  zip: string
  location: string
  jobType: string
  startTime: string
  durationHours: number
  sunExposure: string
  score: number
  status: 'Good' | 'Caution' | 'Avoid'
  recommendation: string
  weatherSnapshot: Weather
  userFeedback: string
  notes: string
  hourlyBreakdown?: HourlyWorkWindowItem[]
}

type Props = {
  job: JobInput
  weather: Weather
  result: {
    score: number
    status: 'Good' | 'Caution' | 'Avoid'
    recommendation: string
  }
  locationName: string | null
  hourlyBreakdown: HourlyWorkWindowItem[]
  onSaved?: () => void
}

const options = ['Accurate', 'Too cautious', 'Too optimistic'] as const

export default function FeedbackCard({ job, weather, result, locationName, hourlyBreakdown, onSaved }: Props) {
  const [selected, setSelected] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    if (!selected) {
      return
    }

    const entry: FeedbackEntry = {
      timestamp: new Date().toISOString(),
      zip: job.zip,
      location: locationName || '',
      jobType: job.jobType,
      startTime: job.startTime,
      durationHours: job.durationHours,
      sunExposure: job.sunExposure,
      score: result.score,
      status: result.status,
      recommendation: result.recommendation,
      weatherSnapshot: weather,
      hourlyBreakdown,
      userFeedback: selected,
      notes,
    }

    const stored = localStorage.getItem('masonryWeatherFeedback')
    const parsed = stored ? JSON.parse(stored) as FeedbackEntry[] : []
    localStorage.setItem('masonryWeatherFeedback', JSON.stringify([...parsed, entry]))
    setSaved(true)
    setTimeout(() => setSaved(false), 4000)
    if (onSaved) {
      onSaved()
    }
  }

  return (
    <div className="card">
      <strong>Was this recommendation accurate?</strong>
      <div style={{marginTop:12,display:'flex',flexWrap:'wrap',gap:8}}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`button feedback-button ${selected === option ? 'feedback-selected' : ''}`}
            onClick={() => setSelected(option)}
          >
            {option}
          </button>
        ))}
      </div>

      <div style={{marginTop:14}}>
        <label style={{display:'block',marginBottom:6,fontWeight:700,color:'#374151'}}>What actually happened?</label>
        <textarea
          className="input feedback-textarea"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes"
          rows={4}
        />
      </div>

      <div style={{marginTop:12,display:'flex',justifyContent:'flex-end'}}>
        <button
          type="button"
          className="button"
          onClick={handleSave}
          disabled={!selected}
        >
          Save feedback
        </button>
      </div>

      {saved && (
        <div style={{marginTop:10,color:'#166534',background:'#dcfce7',padding:10,borderRadius:8}}>
          Feedback saved for this job.
        </div>
      )}
    </div>
  )
}
