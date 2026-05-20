'use client';

const STEPS = [
  { icon: '🔗', label: 'Connecting to your Shopify store...', sub: 'Fetching products, policies, and metadata' },
  { icon: '⚙️', label: 'Running deterministic analysis...', sub: 'Checking field completeness, schema validation, contradictions' },
  { icon: '🤖', label: 'Simulating AI buyer personas...', sub: 'Budget buyer, trust-sensitive buyer, spec-comparison buyer' },
  { icon: '📊', label: 'Generating AIR Score & fixes...', sub: 'Ranking issues by revenue impact' },
];

export default function LoadingState({ step }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
      background: '#0a0a0f'
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Logo pulse */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', margin: '0 auto 16px',
            animation: 'pulse 2s infinite'
          }}>🔍</div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#f0f0f5', marginBottom: '4px' }}>
            Analyzing your store
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>This takes about 20–30 seconds</p>
        </div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {STEPS.map((s, i) => {
            const isDone = i < step;
            const isActive = i === step;
            const isPending = i > step;
            return (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: '16px',
                padding: '16px', borderRadius: '14px', border: '1px solid',
                borderColor: isActive ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.07)',
                background: isActive ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.03)',
                opacity: isPending ? 0.35 : 1,
                transition: 'all 0.4s ease'
              }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{isDone ? '✅' : s.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: isActive ? '#f0f0f5' : '#9ca3af', fontWeight: isActive ? '600' : '400', fontSize: '14px', margin: 0 }}>
                    {s.label}
                  </p>
                  {isActive && (
                    <p style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>{s.sub}</p>
                  )}
                </div>
                {isActive && (
                  <div style={{
                    width: '18px', height: '18px', border: '2px solid #818cf8',
                    borderTopColor: 'transparent', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', flexShrink: 0
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div style={{
          marginTop: '32px', background: 'rgba(255,255,255,0.06)',
          borderRadius: '99px', height: '4px', overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: 'linear-gradient(90deg, #6366f1, #a855f7)',
            borderRadius: '99px',
            width: `${(step / (STEPS.length - 1)) * 100}%`,
            transition: 'width 0.7s ease'
          }} />
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.6; } }
      `}</style>
    </div>
  );
}
