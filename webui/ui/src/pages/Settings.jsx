import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function Settings() {
  const [config, setConfig] = useState({ ai_provider: 'claude' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3001/api/config')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('http://localhost:3001/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      // optionally show toast
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p className="subtitle">Configure your local AI provider and preferences.</p>
        </div>
      </div>

      <div className="glass-panel" style={{ maxWidth: '600px' }}>
        <h2 style={{ fontSize: '1.25rem' }}>AI Provider</h2>
        <p className="text-muted mb-6">
          Choose which CLI tool to use when running prompts from the prompt runner.
        </p>

        <div className="flex gap-4 mb-8">
          <label 
            className={`glass-panel flex-1 flex items-center gap-4 cursor-pointer ${config.ai_provider === 'claude' ? 'border-primary' : ''}`}
            style={{ padding: '16px', background: config.ai_provider === 'claude' ? 'rgba(139, 92, 246, 0.1)' : '' }}
          >
            <input 
              type="radio" 
              name="provider" 
              value="claude"
              checked={config.ai_provider === 'claude'}
              onChange={(e) => setConfig({ ...config, ai_provider: e.target.value })}
              style={{ accentColor: 'var(--primary)', transform: 'scale(1.2)' }}
            />
            <div>
              <div style={{ fontWeight: 600 }}>Claude Code</div>
              <div className="text-muted" style={{ fontSize: '0.85rem' }}>Anthropic's official CLI tool</div>
            </div>
          </label>

          <label 
            className={`glass-panel flex-1 flex items-center gap-4 cursor-pointer ${config.ai_provider === 'gemini' ? 'border-primary' : ''}`}
            style={{ padding: '16px', background: config.ai_provider === 'gemini' ? 'rgba(139, 92, 246, 0.1)' : '' }}
          >
            <input 
              type="radio" 
              name="provider" 
              value="gemini"
              checked={config.ai_provider === 'gemini'}
              onChange={(e) => setConfig({ ...config, ai_provider: e.target.value })}
              style={{ accentColor: 'var(--primary)', transform: 'scale(1.2)' }}
            />
            <div>
              <div style={{ fontWeight: 600 }}>Gemini CLI</div>
              <div className="text-muted" style={{ fontSize: '0.85rem' }}>Google's official CLI tool</div>
            </div>
          </label>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted" style={{ fontSize: '0.9rem' }}>
            Settings are saved to <code>config/web-ui.yml</code>
          </span>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={18} /> {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
}
