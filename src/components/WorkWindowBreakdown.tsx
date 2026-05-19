import React from 'react'
import type { HourlyWorkWindowItem } from '../services/weatherApi'

type Props = {
  items: HourlyWorkWindowItem[]
}

function formatTime(time: string) {
  return new Date(time).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function getTag(item: HourlyWorkWindowItem) {
  if (item.rainChancePercent >= 60) {
    return { label: 'Heavy rain risk', className: 'tag-wet' }
  }
  if (item.rainChancePercent >= 30) {
    return { label: 'Showers likely', className: 'tag-wet' }
  }
  if (item.tempF >= 90) {
    return { label: 'Hot', className: 'tag-hot' }
  }
  if (item.tempF <= 40) {
    return { label: 'Cold', className: 'tag-cold' }
  }
  return { label: 'Typical', className: 'tag-dry' }
}

export default function WorkWindowBreakdown({ items }: Props) {
  return (
    <div className="card">
      <strong>Hourly Work Window</strong>
      <div className="hourly-grid">
        {items.map((item) => {
          const tag = getTag(item)
          return (
            <div key={item.time} className="hourly-row">
              <span className="hourly-label">{formatTime(item.time)}</span>
              <span className="hourly-detail">{item.tempF}°F</span>
              <span className="hourly-detail">Rain {item.rainChancePercent}%</span>
              <span className="hourly-detail">Hum {item.humidityPercent}%</span>
              <span className={`hourly-tag ${tag.className}`}>{tag.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
