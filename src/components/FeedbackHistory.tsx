import React, { useEffect, useState } from 'react'
import type { HourlyWorkWindowItem } from '../services/weatherApi'
import type { Weather } from '../logic/concreteScore'

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

const STORAGE_KEY = 'masonryWeatherFeedback'

function loadEntries(): FeedbackEntry[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []

  try {
    const parsed = JSON.parse(stored) as FeedbackEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function formatTimestamp(timestamp: string) {
  return new Date(timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

type Props = {
  refreshKey: number
}

export default function FeedbackHistory({ refreshKey }: Props) {
  const [entries, setEntries] = useState<FeedbackEntry[]>([])

  useEffect(() => {
    const loaded = loadEntries()
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    setEntries(loaded)
  }, [refreshKey])

  const deleteEntry = (index: number) => {
    const next = [...entries]
    next.splice(index, 1)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setEntries(next)
  }

  const clearAll = () => {
    localStorage.removeItem(STORAGE_KEY)
    setEntries([])
  }

  if (entries.length === 0) {
    return (
      <div className="card">
        <strong>Feedback History</strong>
        <div style={{marginTop:10,color:'#475569'}}>No feedback saved yet.</div>
      </div>
    )
  }

  return (
    <div className="card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <strong>Feedback History</strong>
        <button type="button" className="button" style={{padding:'8px 12px',fontSize:'0.85rem'}} onClick={clearAll}>
          Clear all feedback
        </button>
      </div>

      <div style={{marginTop:12,display:'grid',gap:12}}>
        {entries.map((entry, index) => (
          <div key={`${entry.timestamp}-${index}`} className="feedback-entry">
            <div style={{display:'flex',justifyContent:'space-between',gap:10,flexWrap:'wrap'}}>
              <div><strong>{formatTimestamp(entry.timestamp)}</strong></div>
              <div style={{color:'#6b7280',fontSize:'0.9rem'}}>{entry.location}</div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:8,marginTop:8}}>
              <div style={{display:'grid',gap:6}}>
                <div style={{fontSize:'0.95rem'}}><strong>{entry.jobType}</strong></div>
                <div style={{fontSize:'0.9rem',color:'#475569'}}>Score: {entry.score} · {entry.status}</div>
                <div style={{fontSize:'0.9rem',color:'#475569'}}>Feedback: {entry.userFeedback}</div>
                {entry.notes && <div style={{fontSize:'0.9rem',color:'#334155'}}>Notes: {entry.notes}</div>}
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',alignItems:'start'}}>
                <button type="button" className="button" style={{background:'#ef4444',margin:0,padding:'8px 12px',fontSize:'0.8rem'}} onClick={() => deleteEntry(index)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
