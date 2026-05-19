import React from 'react'

type Props = {
  risks: string[]
}

export default function RiskList({ risks }: Props) {
  if (!risks.length) return null
  return (
    <div className="card">
      <strong>Risk factors</strong>
      <ul className="risk-list" style={{marginTop:8}}>
        {risks.map((r, i) => (
          <li key={i}>{r}</li>
        ))}
      </ul>
    </div>
  )
}
