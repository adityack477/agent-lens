'use client';

export default function AIRScorePanel({ airScore }) {
  const { overallScore, grade, recommendationLikelihood, headlineInsight, dimensions, summary } = airScore;
  const r = 70;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (overallScore / 100) * circumference;

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '20px', padding: '36px'
    }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'flex-start' }}>

        {/* Score ring */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <svg width="192" height="192" viewBox="0 0 192 192">
            <circle cx="96" cy="96" r={r} fill="none" stroke="#1a1a2e" strokeWidth="14" />
            <circle cx="96" cy="96" r={r} fill="none"
              stroke={grade.color} strokeWidth="14" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              transform="rotate(-90 96 96)"
              style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
            />
            <text x="96" y="88" textAnchor="middle" fill={grade.color}
              fontSize="38" fontWeight="800" fontFamily="var(--font-syne, sans-serif)">
              {overallScore}
            </text>
            <text x="96" y="108" textAnchor="middle" fill="#6b7280" fontSize="12">
              AIR Score
            </text>
          </svg>

          <div style={{
            marginTop: '8px', padding: '6px 16px', borderRadius: '99px',
            border: `1px solid ${grade.color}`, color: grade.color,
            background: grade.color + '18', fontSize: '13px', fontWeight: '700'
          }}>
            {grade.letter} - {grade.label}
          </div>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <p style={{ color: '#6b7280', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px' }}>
              AI Recommendation Likelihood
            </p>
            <p style={{ fontSize: '36px', fontWeight: '800', color: '#f0f0f5', margin: 0, fontFamily: 'var(--font-syne, sans-serif)' }}>
              {recommendationLikelihood}%
            </p>
          </div>
        </div>

        {/* Right panel */}
        <div style={{ flex: 1, minWidth: '280px' }}>
          {/* Headline */}
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '12px', padding: '16px', marginBottom: '24px'
          }}>
            <p style={{ color: '#d1d5db', lineHeight: '1.6', margin: 0, fontSize: '14px' }}>{headlineInsight}</p>
          </div>

          {/* Dimension bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {dimensions.map(dim => {
              const barColor = dim.score < 50 ? '#ef4444' : dim.score < 70 ? '#f59e0b' : dim.color;
              return (
                <div key={dim.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontSize: '13px', color: '#d1d5db' }}>
                      {dim.icon} {dim.label} <span style={{ color: '#4b5563', fontSize: '11px' }}>({dim.weight}%)</span>
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: barColor }}>{dim.score}/100</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${dim.score}%`, backgroundColor: barColor,
                      borderRadius: '99px', transition: 'width 1s ease-out'
                    }} />
                  </div>
                  <p style={{ color: '#4b5563', fontSize: '11px', margin: '3px 0 0' }}>{dim.description}</p>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '24px' }}>
            {[
              { label: 'Products Analyzed', value: summary.productsAnalyzed, danger: false },
              { label: 'Products At Risk', value: summary.productsAtRisk, danger: summary.productsAtRisk > 0 },
              { label: 'Avg Score', value: `${summary.avgProductScore}/100`, danger: summary.avgProductScore < 50 },
            ].map(s => (
              <div key={s.label} style={{
                borderRadius: '12px', padding: '14px', textAlign: 'center',
                background: s.danger ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${s.danger ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)'}`
              }}>
                <p style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 4px', fontFamily: 'var(--font-syne, sans-serif)', color: s.danger ? '#f87171' : '#f0f0f5' }}>
                  {s.value}
                </p>
                <p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
