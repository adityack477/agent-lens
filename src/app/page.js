'use client';
import { useState } from 'react';
import InputForm from '@/components/InputForm';
import LoadingState from '@/components/LoadingState';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  const [state, setState] = useState('idle');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loadingStep, setLoadingStep] = useState(0);

  async function handleAnalyze({ storeUrl, apiToken }) {
    setState('loading');
    setLoadingStep(0);
    setError(null);

    const stepTimers = [
      setTimeout(() => setLoadingStep(1), 1500),
      setTimeout(() => setLoadingStep(2), 4000),
      setTimeout(() => setLoadingStep(3), 7000),
    ];

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeUrl, apiToken }),
      });

      stepTimers.forEach(clearTimeout);
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.message || 'Something went wrong. Please try again.');
        setState('error');
        return;
      }

      setResults(data);
      setState('result');
    } catch {
      stepTimers.forEach(clearTimeout);
      setError('Network error. Please check your connection and try again.');
      setState('error');
    }
  }

  function handleReset() {
    setState('idle');
    setResults(null);
    setError(null);
  }

  if (state === 'idle') return <InputForm onAnalyze={handleAnalyze} />;
  if (state === 'loading') return <LoadingState step={loadingStep} />;
  if (state === 'result' && results) return <Dashboard results={results} onReset={handleReset} />;

  return (
    <div style={{
      minHeight: '100vh', background: '#0a0a0f', display: 'flex',
      flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', padding: '24px'
    }}>
      <div style={{ fontSize: '56px' }}>⚠️</div>
      <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#f87171', margin: 0 }}>Analysis Failed</h2>
      <p style={{ color: '#9ca3af', textAlign: 'center', maxWidth: '400px', margin: 0 }}>{error}</p>
      <button onClick={handleReset} style={{
        padding: '12px 28px', background: 'linear-gradient(135deg, #6366f1, #a855f7)',
        border: 'none', borderRadius: '10px', color: 'white', fontSize: '15px',
        fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit'
      }}>
        Try Again
      </button>
    </div>
  );
}
