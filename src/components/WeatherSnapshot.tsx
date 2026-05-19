import React from 'react'
import type { Weather } from '../logic/concreteScore'

type Props = {
  weather: Weather
  locationName?: string | null
  lat?: number | null
  lon?: number | null
}

export default function WeatherSnapshot({ weather, locationName, lat, lon }: Props) {
  return (
    <div className="card">
      <strong>Weather Snapshot</strong>
      {locationName && (
        <div style={{marginTop:8, marginBottom:6}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}>
            <div style={{color:'#6b7280',fontSize:13}}>{locationName}</div>
            {typeof lat === 'number' && typeof lon === 'number' && (
              <a
                className="button radar-link"
                href={`https://www.windy.com/-Weather-radar-radar?radar,${lat},${lon},9`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View Live Radar
              </a>
            )}
          </div>
        </div>
      )}
      <div style={{display:'flex',justifyContent:'space-between',marginTop:12}}>
        <div>
          <div style={{color:'#6b7280',fontSize:12}}>Temp</div>
          <div style={{fontWeight:700}}>{weather.tempRangeMinF}–{weather.tempRangeMaxF}°F</div>
        </div>
        <div>
          <div style={{color:'#6b7280',fontSize:12}}>Humidity</div>
          <div style={{fontWeight:700}}>{weather.humidityPercent}%</div>
        </div>
        <div>
          <div style={{color:'#6b7280',fontSize:12}}>Wind</div>
          <div style={{fontWeight:700}}>{weather.windMph} mph</div>
        </div>
      </div>

      <div style={{display:'flex',justifyContent:'space-between',marginTop:10}}>
        <div>
          <div style={{color:'#6b7280',fontSize:12}}>Rain chance</div>
          <div style={{fontWeight:700}}>{weather.rainChancePercent}%</div>
        </div>
        <div>
          <div style={{color:'#6b7280',fontSize:12}}>Overnight low</div>
          <div style={{fontWeight:700}}>{weather.overnightLowF}°F</div>
        </div>
      </div>
    </div>
  )
}
