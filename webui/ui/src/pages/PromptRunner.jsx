import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Terminal, Loader2, Trash2 } from 'lucide-react';

export default function PromptRunner() {
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState([]);
  const [running, setRunning] = useState(false);
  const [provider, setProvider] = useState('');
  const endOfHistoryRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3001/api/config')
      .then(res => res.json())
      .then(data => setProvider(data.ai_provider || 'claude'))
      .catch(console.error);
  }, []);

  useEffect(() => {
    endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  useEffect(() => {
    if (location.state?.autoRunCommand && provider) {
      const command = location.state.autoRunCommand;
      // Clear state so it doesn't run again on reload
      navigate(location.pathname, { replace: true });
      
      const newEntry = {
        id: Date.now(),
        type: 'prompt',
        content: command,
        provider: provider
      };
      setHistory(prev => [...prev, newEntry]);
      setRunning(true);
      
      fetch('http://localhost:3001/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: command, provider })
      }).then(res => res.json()).then(data => {
        setHistory(prev => [...prev, {
          id: Date.now() + 1,
          type: 'response',
          content: data.output || data.error || 'No output.',
          isError: !!data.error
        }]);
        setRunning(false);
      }).catch(e => {
        setHistory(prev => [...prev, {
          id: Date.now() + 1,
          type: 'response',
          content: 'Failed to connect to backend: ' + e.message,
          isError: true
        }]);
        setRunning(false);
      });
    }
  }, [location.state, provider, navigate]);

  const handleExecute = async () => {
    if (!prompt.trim()) return;
    
    const newEntry = {
      id: Date.now(),
      type: 'prompt',
      content: prompt,
      provider: provider
    };
    
    setHistory(prev => [...prev, newEntry]);
    setPrompt('');
    setRunning(true);

    try {
      const res = await fetch('http://localhost:3001/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: newEntry.content, provider })
      });
      const data = await res.json();
      
      setHistory(prev => [...prev, {
        id: Date.now() + 1,
        type: 'response',
        content: data.output || data.error || 'No output.',
        isError: !!data.error
      }]);
    } catch (e) {
      setHistory(prev => [...prev, {
        id: Date.now() + 1,
        type: 'response',
        content: 'Failed to connect to backend: ' + e.message,
        isError: true
      }]);
    }
    
    setRunning(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleExecute();
    }
  };

  const clearHistory = () => setHistory([]);

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 80px)' }}>
      <div className="page-header mb-4">
        <div>
          <h1>Prompt Runner</h1>
          <p className="subtitle">Execute commands via {provider === 'claude' ? 'Claude Code' : 'Gemini CLI'}.</p>
        </div>
        <button className="btn btn-secondary" onClick={clearHistory}>
          <Trash2 size={18} /> Clear
        </button>
      </div>

      <div className="glass-panel flex-1 mb-4 flex flex-col" style={{ overflow: 'hidden', padding: 0 }}>
        <div className="flex-1 overflow-y-auto p-6" style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted gap-4">
              <Terminal size={48} opacity={0.5} />
              <p>Ready to run career-ops commands.</p>
              <div className="flex gap-2">
                <span className="badge badge-neutral">/career-ops scan</span>
                <span className="badge badge-neutral">/career-ops tracker</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {history.map((item) => (
                <div key={item.id} className={item.type === 'prompt' ? '' : ''}>
                  {item.type === 'prompt' ? (
                    <div className="flex gap-3">
                      <div className="text-primary font-bold mt-1">&gt;</div>
                      <div className="bg-white/5 rounded-md p-3 flex-1 border border-white/10 whitespace-pre-wrap">
                        {item.content}
                      </div>
                    </div>
                  ) : (
                    <div className={`flex gap-3 ${item.isError ? 'text-danger' : 'text-text-muted'}`}>
                      <div className="font-bold mt-1">#</div>
                      <div className="bg-black/30 rounded-md p-3 flex-1 overflow-x-auto whitespace-pre-wrap border border-white/5">
                        {item.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {running && (
                <div className="flex gap-3 text-primary items-center">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="animate-pulse">Waiting for {provider}...</span>
                </div>
              )}
              <div ref={endOfHistoryRef} />
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-surface-border bg-black/20 flex gap-4">
          <textarea 
            className="input flex-1" 
            placeholder={`Enter command for ${provider}... (Cmd/Ctrl + Enter to run)`}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={running}
            rows={2}
            style={{ resize: 'none', fontFamily: 'monospace' }}
          />
          <button 
            className="btn btn-primary h-full px-6" 
            onClick={handleExecute}
            disabled={running || !prompt.trim()}
          >
            {running ? <Loader2 className="animate-spin" /> : <Play size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
