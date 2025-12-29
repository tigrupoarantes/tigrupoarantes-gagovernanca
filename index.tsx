
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

type ErrorBoundaryState = { error: unknown };

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  declare props: Readonly<React.PropsWithChildren<{}>>;
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: unknown) {
    // Keep it in console for debugging.
    // eslint-disable-next-line no-console
    console.error('Uncaught error (ErrorBoundary):', error);
  }

  render() {
    if (!this.state.error) return this.props.children;

    const message =
      this.state.error instanceof Error
        ? `${this.state.error.name}: ${this.state.error.message}`
        : String(this.state.error);

    return (
      <div style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Erro ao carregar a aplicação</h1>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#fff2f0', border: '1px solid #ffccc7', padding: 12, borderRadius: 8 }}>
          {message}
        </pre>
        <p style={{ marginTop: 12, color: '#6b7280', fontSize: 12 }}>
          Abra o Console do navegador para ver detalhes adicionais.
        </p>
      </div>
    );
  }
}

const showFatal = (title: string, details: string) => {
  try {
    const el = document.getElementById('root');
    if (!el) return;
    el.innerHTML = `
      <div style="padding:24px;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">
        <h1 style="font-size:18px;font-weight:700;margin-bottom:12px">${title}</h1>
        <pre style="white-space:pre-wrap;background:#fff2f0;border:1px solid #ffccc7;padding:12px;border-radius:8px">${details}</pre>
        <p style="margin-top:12px;color:#6b7280;font-size:12px">Abra o Console do navegador para mais detalhes.</p>
      </div>
    `;
  } catch {
    // ignore
  }
};

window.addEventListener('error', (e) => {
  // eslint-disable-next-line no-console
  console.error('window.error:', e.error || e.message);
  showFatal('Erro de JavaScript (window.error)', String(e.error || e.message));
});

window.addEventListener('unhandledrejection', (e) => {
  // eslint-disable-next-line no-console
  console.error('unhandledrejection:', e.reason);
  showFatal('Promise rejeitada (unhandledrejection)', String(e.reason));
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
