export default function SmartAlerts({ data }) {
  if (!data || !data.length) return null

  const alerts = []
  const cols = Object.keys(data[0])
  const numCols = cols.filter(c => {
    const vals = data.slice(0, 10).map(r => parseFloat(r[c])).filter(v => !isNaN(v))
    return vals.length > 5
  })

  if (!numCols.length) return null
  const metric = numCols[0]

  const values = data.map(r => parseFloat(r[metric]) || 0).filter(v => v > 0)
  if (!values.length) return null

  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const max = Math.max(...values)
  const min = Math.min(...values)
  const stdDev = Math.sqrt(values.map(v => (v - avg) ** 2).reduce((a, b) => a + b, 0) / values.length)

  // High value alert
  alerts.push({
    type: 'success', icon: '🏆',
    title: 'Peak Value',
    msg: `Highest ${metric}: ${max.toLocaleString()} — ${((max/avg-1)*100).toFixed(0)}% above average`
  })

  // Low value alert
  if (min < avg * 0.5) {
    alerts.push({
      type: 'warning', icon: '⚠️',
      title: 'Low Value Detected',
      msg: `Lowest ${metric}: ${min.toLocaleString()} — significantly below average (${avg.toFixed(0)})`
    })
  }

  // Anomaly
  const anomalies = values.filter(v => Math.abs(v - avg) > 2 * stdDev)
  if (anomalies.length) {
    alerts.push({
      type: 'danger', icon: '🔍',
      title: 'Anomalies Found',
      msg: `${anomalies.length} data point(s) are unusual — more than 2x standard deviation from mean`
    })
  }

  // Data quality
  const missing = data.filter(r => !r[metric] || isNaN(parseFloat(r[metric]))).length
  if (missing > 0) {
    alerts.push({
      type: 'info', icon: '📋',
      title: 'Data Quality',
      msg: `${missing} rows have missing ${metric} values`
    })
  }

  const colors = {
    danger:  { bg: 'rgba(239,68,68,0.1)',  border: '#ef4444', text: '#fca5a5' },
    success: { bg: 'rgba(16,185,129,0.1)', border: '#10b981', text: '#6ee7b7' },
    warning: { bg: 'rgba(245,158,11,0.1)', border: '#f59e0b', text: '#fcd34d' },
    info:    { bg: 'rgba(59,130,246,0.1)', border: '#3b82f6', text: '#93c5fd' },
  }

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <div style={{ fontSize: '12px', fontWeight: '600', color: '#718096', marginBottom: '10px' }}>
        🔔 Smart Alerts ({alerts.length})
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
        {alerts.map((a, i) => {
          const c = colors[a.type]
          return (
            <div key={i} style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: '10px', padding: '12px 14px', display: 'flex', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>{a.icon}</span>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: c.text, marginBottom: '2px' }}>{a.title}</div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>{a.msg}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}