import React, { useState } from 'react'
import type { JobInput } from '../types/job'

type Props = {
  onSubmit: (job: JobInput) => void
}

const defaultStart = new Date().toISOString().slice(0,16)

export default function WeatherForm({ onSubmit }: Props) {
  const [zip, setZip] = useState('10001')
  const [jobType, setJobType] = useState('Footings')
  const [startTime, setStartTime] = useState(defaultStart)
  const [duration, setDuration] = useState(4)
  const [sunExposure, setSunExposure] = useState<'Low'|'Medium'|'High'>('Medium')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ zip, jobType, startTime, durationHours: Number(duration), sunExposure })
  }

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-row">
          <label>Zip code</label>
          <input className="input" value={zip} onChange={e => setZip(e.target.value)} placeholder="Zip code" />
        </div>

        <div className="form-row">
          <label>Job type</label>
          <select className="input" value={jobType} onChange={e => setJobType(e.target.value)}>
            <option>Patio / slab</option>
            <option>Footings</option>
            <option>Walkway</option>
            <option>Steps</option>
            <option>Repair / patch</option>
            <option>Mortar / block work</option>
            <option>Pavers</option>
          </select>
        </div>
      </div>

      <div className="form-grid" style={{marginTop:8}}>
        <div className="form-row">
          <label>Start time</label>
          <input className="input" type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)} />
        </div>

        <div className="form-row">
          <label>Estimated duration (hours)</label>
          <input className="input" type="number" min={1} value={duration} onChange={e => setDuration(Number(e.target.value))} />
        </div>
      </div>

      <div style={{marginTop:8}} className="form-row">
        <label>Sun exposure</label>
        <select className="input" value={sunExposure} onChange={e => setSunExposure(e.target.value as any)}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
      </div>

      <div style={{marginTop:10,display:'flex',justifyContent:'flex-end'}}>
        <button type="submit" className="button">Check Score</button>
      </div>
    </form>
  )
}
