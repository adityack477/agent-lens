'use client';

const IMPACT_STYLE = {
  critical: { dot: '#ef4444', text: '#ef4444', badge: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.25)' },
  high:     { dot: '#f97316', text: '#f97316', badge: 'rgba(249,115,22,0.15)', border: 'rgba(249,115,22,0.25)' },
  medium:   { dot: '#f59e0b', text: '#f59e0b', badge: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.25)' },
  low:      { dot: '#6366f1', text: '#818cf8', badge: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.25)' },
};

const EFFORT_LABEL = { easy: '⚡ Easy', medium: '🔧 Medium', hard: '⚙️ Hard' };
const EFFORT_COLOR = { easy: '#10b981', medium: '#f59e0b', hard: '#ef4444' };

export default function FixPanel({ fixes }) {
  if (!fixes || fixes.length === 0) {
    return (
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '32px', textAlign: 'center', color: '#6b7280' }}>
        Fix recommendations unavailable.
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {fixes.map((fix, i) => <FixCard key={i} fix={fix} />)}
    </div>
  );
}

function FixCard({ fix }) {
  const imp = IMPACT_STYLE[fix.revenueImpact] || IMPACT_STYLE.medium;
  const effortLabel = EFFORT_LABEL[fix.effort] || '🔧 Medium';
  const effortColor = EFFORT_COLOR[fix.effort] || '#f59e0b';

  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '18px', padding: '22px',
      transition: 'background 0.2s'
    }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>

        {/* Priority badge */}
        <div style={{
          flexShrink: 0, width: '42px', height: '42px', borderRadius: '12px',
          background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '18px', fontWeight: '800',
          color: '#f0f0f5', fontFamily: 'var(--font-syne, sans-serif)'
        }}>
          {fix.priority}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontWeight: '600', color: '#f0f0f5', margin: 0, fontSize: '15px' }}>{fix.title}</h3>
            <span style={{
              fontSize: '10px', padding: '3px 8px', borderRadius: '99px', fontWeight: '700',
              background: imp.badge, color: imp.text, border: `1px solid ${imp.border}`,
              display: 'inline-flex', alignItems: 'center', gap: '5px'
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: imp.dot, display: 'inline-block' }} />
              {fix.revenueImpact?.toUpperCase()} IMPACT
            </span>
            <span style={{ fontSize: '12px', color: effortColor }}>{effortLabel}</span>
          </div>

          <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '14px', lineHeight: '1.6' }}>{fix.issue}</p>

          {fix.aiEffect && (
            <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px', padding: '12px', marginBottom: '10px' }}>
              <p style={{ fontSize: '11px', color: '#818cf8', fontWeight: '600', margin: '0 0 4px' }}>🤖 AI Agent Effect</p>
              <p style={{ fontSize: '13px', color: '#d1d5db', margin: 0, lineHeight: '1.5' }}>{fix.aiEffect}</p>
            </div>
          )}

          {fix.howToFix && (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', padding: '12px', marginBottom: '10px' }}>
              <p style={{ fontSize: '11px', color: '#34d399', fontWeight: '600', margin: '0 0 4px' }}>✅ How to Fix</p>
              <p style={{ fontSize: '13px', color: '#d1d5db', margin: 0, lineHeight: '1.5' }}>{fix.howToFix}</p>
            </div>
          )}

          {fix.exampleFix && (
            <p style={{ fontSize: '12px', color: '#6b7280', fontStyle: 'italic', marginBottom: '8px' }}>
              Example: {fix.exampleFix}
            </p>
          )}

          {fix.estimatedScoreImprovement && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Expected AIR Score improvement:</span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#818cf8' }}>+{fix.estimatedScoreImprovement} pts</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
