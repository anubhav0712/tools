import esbuild from 'esbuild';
import fs from 'fs';
import path from 'path';

async function buildMcpCli() {
  const outDir = path.resolve(process.cwd(), 'bin');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, 'tools-mcp.cjs');

  await esbuild.build({
    entryPoints: ['scripts/mcp-server.ts'],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    outfile: outFile,
    banner: {
      js: '#!/usr/bin/env node',
    },
    minify: false,
  });

  // Ensure file is executable
  try {
    fs.chmodSync(outFile, 0o755);
  } catch {
    // Ignore permissions failure on non-POSIX if any
  }

  console.log('✅ Standalone MCP CLI bundled successfully to bin/tools-mcp.cjs');
}

buildMcpCli().catch((err) => {
  console.error(err);
  process.exit(1);
});
