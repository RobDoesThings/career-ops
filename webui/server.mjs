import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

const CONFIG_FILE = path.join(__dirname, 'config.yml');
const APPLICATIONS_FILE = path.join(__dirname, '..', 'data', 'applications.md');
const PIPELINE_FILE = path.join(__dirname, '..', 'data', 'pipeline.md');

// Ensure config file exists
async function ensureConfig() {
  try {
    await fs.access(CONFIG_FILE);
  } catch {
    const dir = path.dirname(CONFIG_FILE);
    try { await fs.mkdir(dir, { recursive: true }); } catch {}
    await fs.writeFile(CONFIG_FILE, yaml.dump({ ai_provider: 'claude' }), 'utf-8');
  }
}
ensureConfig();

// API Endpoints

app.get('/api/config', async (req, res) => {
  try {
    const fileContents = await fs.readFile(CONFIG_FILE, 'utf8');
    const data = yaml.load(fileContents);
    res.json(data || { ai_provider: 'claude' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/config', async (req, res) => {
  try {
    const newConfig = req.body;
    await fs.writeFile(CONFIG_FILE, yaml.dump(newConfig), 'utf8');
    res.json({ success: true, config: newConfig });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/jobs', async (req, res) => {
  try {
    const content = await fs.readFile(APPLICATIONS_FILE, 'utf8');
    const lines = content.split('\n');
    const jobs = [];
    
    let isTable = false;
    let headers = [];
    
    for (let line of lines) {
      line = line.trim();
      if (!line.startsWith('|')) continue;
      
      const parts = line.split('|').map(s => s.trim()).filter((_, i, arr) => i !== 0 && i !== arr.length - 1);
      
      if (!isTable) {
        if (parts[0] === '#') {
          isTable = true;
          headers = parts.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
        }
        continue;
      }
      
      if (parts[0] && parts[0].includes('---')) continue;
      
      if (parts.length > 0) {
        const job = {};
        headers.forEach((h, i) => {
          job[h || `col_${i}`] = parts[i] || '';
        });
        jobs.push(job);
      }
    }
    
    res.json(jobs);
  } catch (e) {
    res.status(500).json({ error: e.message, jobs: [] });
  }
});

app.get('/api/pipeline', async (req, res) => {
  try {
    const content = await fs.readFile(PIPELINE_FILE, 'utf8');
    const lines = content.split('\n');
    const pipeline = {
      pendientes: [],
      procesadas: []
    };
    
    let currentSection = '';
    
    for (let line of lines) {
      line = line.trim();
      if (line.startsWith('## Pendientes')) {
        currentSection = 'pendientes';
        continue;
      }
      if (line.startsWith('## Procesadas')) {
        currentSection = 'procesadas';
        continue;
      }
      
      if (line.startsWith('- [ ]') || line.startsWith('- [x]')) {
        const isDone = line.startsWith('- [x]');
        const rest = line.substring(5).trim();
        const parts = rest.split('|').map(s => s.trim());
        const item = {
          url: parts[0] || '',
          company: parts[1] || '',
          role: parts[2] || '',
          done: isDone
        };
        if (currentSection === 'pendientes') pipeline.pendientes.push(item);
        if (currentSection === 'procesadas') pipeline.procesadas.push(item);
      }
    }
    
    res.json(pipeline);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/execute', (req, res) => {
  const { prompt, provider } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

  let cmd = 'claude';
  let args = [];
  
  if (provider === 'gemini') {
    cmd = 'npx';
    args = ['@google/gemini-cli'];
  }
  
  // Note: For simplicity and security, we are piping the prompt to stdin if it's not a slash command, 
  // or we can pass it as arguments depending on CLI behavior. 
  // Both Claude and Gemini CLI support taking instructions.
  // Actually, Gemini supports passing the prompt as an argument. 
  // Claude can take `-p` or stdin. 
  // For this generic interface, let's pass it as an argument or let it run.
  // The user might just want to see the output.
  
  // To avoid hanging on interactive prompts, we'll try to just pass the prompt
  args.push(prompt);

  const child = spawn(cmd, args, { 
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, GEMINI_CLI_TRUST_WORKSPACE: 'true' }
  });

  let output = '';
  let errorOutput = '';

  child.stdout.on('data', (data) => {
    output += data.toString();
  });

  child.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  child.on('close', (code) => {
    res.json({
      output: output || errorOutput,
      error: code !== 0 ? errorOutput : null,
      code
    });
  });
  
  child.on('error', (err) => {
    res.status(500).json({ error: err.message });
  });
});

app.listen(PORT, () => {
  console.log(`Career-ops API Server running on http://localhost:${PORT}`);
});
