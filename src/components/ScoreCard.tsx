import React from 'react'

type Props = {
  score: number
  status: 'Good' | 'Caution' | 'Avoid'
  bestStartWindow?: string
  riskFactors: string[]
  recommendation: string
  optimizedFor?: string
  suggestions?: string[]
}

export default function ScoreCard({ score, status, bestStartWindow, riskFactors, recommendation, optimizedFor, suggestions }: Props) {
  const statusClass = status === 'Good' ? 'status-good' : status === 'Caution' ? 'status-caution' : 'status-avoid'

  return (
    <div className="card">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}> 
        <div>
          <div style={{color:'#6b7280',fontSize:12}}>Masonry Score</div>
          <div className="score-value">{score}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div className={`status-badge ${statusClass}`}>{status}</div>
          {optimizedFor && <div style={{marginTop:6,color:'#6b7280',fontSize:12}}>Optimized for: <span style={{fontWeight:700,color:'#111'}}>{optimizedFor}</span></div>}
          {bestStartWindow && <div style={{marginTop:6,color:'#6b7280',fontSize:12}}>Best start: <span style={{fontWeight:700,color:'#111'}}>{bestStartWindow}</span></div>}
        </div>
      </div>

      <div style={{marginTop:12}}>
        <strong>Recommendation</strong>
        <div style={{marginTop:6,color:'#374151'}}>{recommendation}</div>
      </div>

      {suggestions && suggestions.length > 0 && (
        <div style={{marginTop:12}}>
          <strong>Suggested Actions</strong>
          <ul className="risk-list" style={{marginTop:8}}>
            {suggestions.map((suggestion, i) => (
              <li key={`suggestion-${i}`}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}

      {riskFactors && riskFactors.length > 0 && (
        <div style={{marginTop:12}}>
          <strong>Risk factors</strong>
          <ul className="risk-list" style={{marginTop:8}}>
            {riskFactors.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
