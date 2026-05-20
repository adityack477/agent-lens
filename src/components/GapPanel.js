'use client';

const IMPACT = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', label: 'CRITICAL' },
  high:     { color: '#f97316', bg: 'rgba(249,115,22,0.08)', border: 'rgba(249,115,22,0.2)', label: 'HIGH' },
  medium:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', label: 'MEDIUM' },
};

export default function GapPanel({ gaps }) {
  if (!gaps || gaps.length === 0) {
    return <EmptyState text="Gap analysis data unavailable." />;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {gaps.map((gap, i) => <GapCard key={i} gap={gap} />)}
    </div>
  );
}

function GapCard({ gap }) {
  const imp = IMPACT[gap.impact] || IMPACT.medium;
  return (
    <div style={{ borderRadius: '18px', border: `1px solid ${imp.border}`, background: imp.bg, padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <span style={{
            fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '99px',
            background: imp.bg, color: imp.color, border: `1px solid ${imp.border}`, marginBottom: '8px', display: 'inline-block'
          }}>{imp.label}</span>
          <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#f0f0f5', margin: 0 }}>{gap.title}</h3>
        </div>
        {gap.affectedProducts && (
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <p style={{ fontSize: '28px', fontWeight: '800', color: imp.color, margin: 0, fontFamily: 'var(--font-syne, sans-serif)' }}>{gap.affectedProducts}</p>
            <p style={{ color: '#6b7280', fontSize: '11px', margin: 0 }}>products affected</p>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
        <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '12px', padding: '16px' }}>
          <p style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span>👤</span> Merchant Intends
          </p>
          <p style={{ fontSize: '13px', color: '#d1d5db', lineHeight: '1.6', margin: 0 }}>{gap.merchantIntention}</p>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: '12px', padding: '16px' }}>
          <p style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 8px', display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span>🤖</span> AI Actually Perceives
          </p>
          <p style={{ fontSize: '13px', color: imp.color, lineHeight: '1.6', margin: 0 }}>{gap.aiPerception}</p>
        </div>
      </div>

      {gap.example && (
        <div style={{ marginTop: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '12px' }}>
          <p style={{ fontSize: '11px', color: '#6b7280', margin: '0 0 4px' }}>Example from your store</p>
          <p style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic', margin: 0 }}>"{gap.example}"</p>
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px', textAlign: 'center', color: '#6b7280' }}>
      {text}
    </div>
  );
}
