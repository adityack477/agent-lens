'use client';
import AIRScorePanel from './AIRScorePanel';
import PersonaPanel from './PersonaPanel';
import GapPanel from './GapPanel';
import FixPanel from './FixPanel';

export default function Dashboard({ results, onReset }) {
  const { airScore, aiResults, deterministicResults, storeName, productCount } = results;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', paddingBottom: '64px' }}>

      {/* Header */}
      <div style={{
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto', padding: '14px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '9px',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
            }}>🔍</div>
            <span style={{ fontWeight: '800', fontSize: '18px', fontFamily: 'var(--font-syne, sans-serif)' }}>
              Agent<span style={{ color: '#818cf8' }}>Lens</span>
            </span>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: '600', color: '#f0f0f5', margin: 0, fontSize: '14px' }}>{storeName}</p>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>{productCount} products analyzed</p>
          </div>
          <button onClick={onReset} style={{
            color: '#9ca3af', fontSize: '13px',
            border: '1px solid rgba(255,255,255,0.1)', padding: '6px 14px',
            borderRadius: '8px', background: 'transparent', cursor: 'pointer',
            transition: 'all 0.2s', fontFamily: 'inherit'
          }}
            onMouseOver={e => { e.target.style.color = '#f0f0f5'; e.target.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            onMouseOut={e => { e.target.style.color = '#9ca3af'; e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            ← New Analysis
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <AIRScorePanel airScore={airScore} />

        <Section icon="🤖" title="AI Buyer Persona Simulation" sub="How 3 different AI shopping agents evaluate your store right now">
          <PersonaPanel personas={aiResults.personaSimulations} />
        </Section>

        <Section icon="🪞" title="Representation Gap Analysis" sub="What you intend to communicate vs. what AI actually perceives">
          <GapPanel gaps={aiResults.representationGaps} />
        </Section>

        <Section icon="🔧" title="Revenue-Prioritized Fix Engine" sub="Ranked by estimated revenue impact - fix these in order">
          <FixPanel fixes={aiResults.prioritizedFixes} />
        </Section>
      </div>
    </div>
  );
}

function Section({ icon, title, sub, children }) {
  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#f0f0f5', margin: '0 0 4px', fontFamily: 'var(--font-syne, sans-serif)' }}>
          {icon} {title}
        </h2>
        <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>{sub}</p>
      </div>
      {children}
    </div>
  );
}
