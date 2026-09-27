import fs from 'fs';
import path from 'path';
import os from 'os';

// ─── CONFIGURATION ───
// Set your Obsidian Vault path here:
const OBSIDIAN_VAULT_PATH = path.join(os.homedir(), 'Documents', 'Obsidian', 'ClaudeChats');

// Claude OmniRoute projects directory
const CLAUDE_PROJECTS_DIR = path.join(os.homedir(), '.claude-omniroute', 'projects');

// Ensure destination vault directory exists
if (!fs.existsSync(OBSIDIAN_VAULT_PATH)) {
  fs.mkdirSync(OBSIDIAN_VAULT_PATH, { recursive: true });
}

console.log(`🔍 Scanning for Claude Code sessions in: ${CLAUDE_PROJECTS_DIR}`);
console.log(`📁 Target Obsidian Vault: ${OBSIDIAN_VAULT_PATH}\n`);

function convertJsonlToMarkdown(jsonlPath) {
  const content = fs.readFileSync(jsonlPath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim() !== '');

  const messages = [];
  let firstUserPrompt = '';
  let sessionDate = null;

  for (const line of lines) {
    try {
      const data = JSON.parse(line);

      // Capture timestamp
      if (data.timestamp && !sessionDate) {
        sessionDate = new Date(data.timestamp);
      }

      // User Message
      if (data.type === 'user' || data.role === 'user' || (data.message && data.message.role === 'user')) {
        let text = '';
        if (typeof data.content === 'string') text = data.content;
        else if (Array.isArray(data.content)) {
          text = data.content.map(c => (typeof c === 'string' ? c : c.text || '')).join('\n');
        } else if (data.message && data.message.content) {
          text = typeof data.message.content === 'string' ? data.message.content : JSON.stringify(data.message.content);
        }

        // Clean up system tags or reminders if present
        text = text.replace(/<system-reminder>[\s\S]*?<\/system-reminder>/gi, '').trim();

        if (text) {
          if (!firstUserPrompt && text.length > 5) {
            firstUserPrompt = text.slice(0, 60).replace(/[^a-zA-Z0-9 _-]/g, '').trim();
          }
          messages.push({ role: 'User', text, time: data.timestamp });
        }
      }

      // Assistant Message
      if (data.type === 'assistant' || data.role === 'assistant' || (data.message && data.message.role === 'assistant')) {
        let text = '';
        if (typeof data.content === 'string') text = data.content;
        else if (Array.isArray(data.content)) {
          text = data.content
            .filter(c => c.type === 'text' || typeof c === 'string')
            .map(c => (typeof c === 'string' ? c : c.text || ''))
            .join('\n');
        } else if (data.message && data.message.content) {
          text = typeof data.message.content === 'string' ? data.message.content : '';
        }

        if (text && text.trim()) {
          messages.push({ role: 'Claude', text: text.trim(), time: data.timestamp });
        }
      }
    } catch (e) {
      // skip unparseable lines
    }
  }

  return { messages, firstUserPrompt, sessionDate };
}

function processAllProjects() {
  if (!fs.existsSync(CLAUDE_PROJECTS_DIR)) {
    console.error(`❌ Claude directory not found at: ${CLAUDE_PROJECTS_DIR}`);
    return;
  }

  const projectFolders = fs.readdirSync(CLAUDE_PROJECTS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  let totalSynced = 0;

  for (const folder of projectFolders) {
    const projectPath = path.join(CLAUDE_PROJECTS_DIR, folder);
    const files = fs.readdirSync(projectPath).filter(f => f.endsWith('.jsonl'));

    // Pretty project name (e.g., WhoDroveBetter)
    const readableProject = folder.replace(/^C--Users-[^-]+-Documents-/, '').replace(/^C--Users-[^-]+-/, '') || folder;
    const projectVaultDir = path.join(OBSIDIAN_VAULT_PATH, readableProject);

    if (!fs.existsSync(projectVaultDir)) {
      fs.mkdirSync(projectVaultDir, { recursive: true });
    }

    for (const file of files) {
      const fullJsonlPath = path.join(projectPath, file);
      const sessionId = path.basename(file, '.jsonl');
      const stats = fs.statSync(fullJsonlPath);
      const dateStr = (stats.mtime || new Date()).toISOString().split('T')[0];

      const { messages, firstUserPrompt } = convertJsonlToMarkdown(fullJsonlPath);

      if (messages.length === 0) continue;

      const title = firstUserPrompt ? ` - ${firstUserPrompt}` : '';
      const mdFilename = `${dateStr} - Session ${sessionId.slice(0, 8)}${title}.md`;
      const targetMdPath = path.join(projectVaultDir, mdFilename);

      // Build Obsidian Markdown file with YAML frontmatter
      let md = `---
title: "Claude Session: ${sessionId.slice(0, 8)}"
project: "${readableProject}"
date: "${dateStr}"
tags:
  - claude-code
  - ai-chat
  - ${readableProject.toLowerCase().replace(/[^a-z0-9]/g, '-')}
---

# 💬 Claude Code Session: ${readableProject}
**Date:** ${stats.mtime.toLocaleString()}
**Session ID:** \`${sessionId}\`
**Total Exchanges:** ${messages.length}

---

`;

      for (const msg of messages) {
        if (msg.role === 'User') {
          md += `### 👤 User\n\n${msg.text}\n\n`;
        } else {
          md += `### 🤖 Claude\n\n${msg.text}\n\n`;
        }
        md += `---\n\n`;
      }

      fs.writeFileSync(targetMdPath, md, 'utf8');
      totalSynced++;
      console.log(`✅ Synced: [${readableProject}] -> ${mdFilename}`);
    }
  }

  console.log(`\n🎉 Successfully synced ${totalSynced} session(s) to Obsidian!`);
}

processAllProjects();
