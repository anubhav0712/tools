import fs from 'fs';
import path from 'path';
import { generateMcpManifest } from '../src/core/mcp-generator';
// Ensure all tools are registered
import '../src/tools';

function exportMcp() {
  const publicDir = path.resolve(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const manifest = generateMcpManifest();
  const outputPath = path.join(publicDir, 'mcp-manifest.json');
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf-8');

  console.log(`🤖 Exported MCP Manifest with ${manifest.tools.length} tool(s) to public/mcp-manifest.json`);
}

exportMcp();
