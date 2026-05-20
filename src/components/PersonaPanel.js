'use client';

export default function PersonaPanel({ personas }) {
  if (!personas || personas.length === 0) {
    return <EmptyState text="Persona simulation data unavailable." />;
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
      {personas.map((p, i) => <PersonaCard key={i} persona={p} />)}
    </div>
  );
}

function PersonaCard({ persona }) {
  const ok = persona.wouldRecommend;
  const c = persona.confidence || 0;
  const accent = ok ? '#10b981' : '#ef4444';
  const accentBg = ok ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)';
  const accentBorder = ok ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)';
  const barColor = c >= 60 ? '#10b981' : c >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ borderRadius: '18px', border: `1px solid ${accentBorder}`, background: accentBg, padding: '22px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '26px' }}>{persona.emoji}</span>
          <div>
            <p style={{ fontWeight: '600', fontSize: '14px', margin: 0, color: '#f0f0f5' }}>{persona.persona}</p>
            <p style={{ color: '#6b7280', fontSize: '11px', margin: 0, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              "{persona.query}"
            </p>
          </div>
        </div>
        <span style={{
          fontSize: '10px', fontWeight: '700', padding: '4px 8px', borderRadius: '99px',
          background: ok ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
          color: accent, whiteSpace: 'nowrap', flexShrink: 0
        }}>
          {ok ? 'RECOMMEND' : 'SKIP'}
        </span>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280', marginBottom: '5px' }}>
          <span>Confidence</span><span style={{ fontWeight: '600' }}>{c}%</span>
        </div>
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '99px' }}>
          <div style={{ height: '100%', width: `${c}%`, background: barColor, borderRadius: '99px', transition: 'width 1s ease' }} />
        </div>
      </div>

      <p style={{ color: '#d1d5db', fontSize: '13px', lineHeight: '1.6', marginBottom: '14px' }}>{persona.reasoning}</p>

      {persona.blockers?.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <p style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>Blockers</p>
          {persona.blockers.map((b, i) => (
            <p key={i} style={{ fontSize: '12px', color: '#f87171', margin: '0 0 4px', display: 'flex', gap: '6px' }}>
              <span>•</span>{b}
            </p>
          ))}
        </div>
      )}

      {persona.whatWouldHelp && (
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px' }}>
          <p style={{ fontSize: '10px', color: '#6b7280', margin: '0 0 4px' }}>What would change this</p>
          <p style={{ fontSize: '12px', color: '#d1d5db', margin: 0 }}>{persona.whatWouldHelp}</p>
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
