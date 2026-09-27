import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';

const CLAUDE_PROJECTS_DIR = path.join(os.homedir(), '.claude-omniroute', 'projects');

console.log('👀 Watching Claude Code sessions for changes...');
console.log('🚀 Any new message will automatically sync to your Obsidian Vault!\n');

let debounceTimer = null;

function triggerSync() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    console.log(`[${new Date().toLocaleTimeString()}] Change detected, syncing to Obsidian...`);
    const proc = spawn('node', ['sync-to-obsidian.mjs'], { stdio: 'inherit' });
    proc.on('close', () => {
      console.log('✨ Obsidian is up-to-date!\n');
    });
  }, 2000); // 2 second debounce
}

if (fs.existsSync(CLAUDE_PROJECTS_DIR)) {
  fs.watch(CLAUDE_PROJECTS_DIR, { recursive: true }, (eventType, filename) => {
    if (filename && filename.endsWith('.jsonl')) {
      triggerSync();
    }
  });

  // Initial sync on startup
  triggerSync();
} else {
  console.error(`Directory not found: ${CLAUDE_PROJECTS_DIR}`);
}
