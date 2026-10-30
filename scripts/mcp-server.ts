import readline from 'readline';
import { registry } from '../src/core/registry';
import { generateMcpManifest } from '../src/core/mcp-generator';
// Register all tools
import '../src/tools';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

function sendResponse(response: Record<string, unknown>) {
  process.stdout.write(JSON.stringify(response) + '\n');
}

function handleMessage(messageStr: string) {
  if (!messageStr.trim()) return;

  let message: any;
  try {
    message = JSON.parse(messageStr);
  } catch (err) {
    sendResponse({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: 'Parse error' },
    });
    return;
  }

  const { id, method, params } = message;

  // Handle MCP Protocol Methods
  switch (method) {
    case 'initialize': {
      sendResponse({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {
              listChanged: false,
            },
          },
          serverInfo: {
            name: 'tools-local-server',
            version: '0.1.0',
          },
        },
      });
      break;
    }

    case 'notifications/initialized': {
      // Notification, no response required
      break;
    }

    case 'tools/list': {
      const manifest = generateMcpManifest();
      sendResponse({
        jsonrpc: '2.0',
        id,
        result: {
          tools: manifest.tools.map((t) => ({
            name: t.name,
            description: t.description,
            inputSchema: t.inputSchema,
          })),
        },
      });
      break;
    }

    case 'tools/call': {
      const { name, arguments: args } = params || {};
      const tool = registry.get(name);

      if (!tool) {
        sendResponse({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Tool "${name}" not found` },
        });
        return;
      }

      if (!tool.agent.mcp || !tool.execute) {
        sendResponse({
          jsonrpc: '2.0',
          id,
          error: { code: -32600, message: `Tool "${name}" is not MCP-callable` },
        });
        return;
      }

      try {
        const output = tool.execute(args || {});
        Promise.resolve(output)
          .then((result) => {
            sendResponse({
              jsonrpc: '2.0',
              id,
              result: {
                content: [
                  {
                    type: 'text',
                    text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
                  },
                ],
              },
            });
          })
          .catch((err) => {
            sendResponse({
              jsonrpc: '2.0',
              id,
              result: {
                isError: true,
                content: [{ type: 'text', text: `Execution failed: ${err.message}` }],
              },
            });
          });
      } catch (err: any) {
        sendResponse({
          jsonrpc: '2.0',
          id,
          result: {
            isError: true,
            content: [{ type: 'text', text: `Execution failed: ${err.message}` }],
          },
        });
      }
      break;
    }

    default: {
      if (id !== undefined) {
        sendResponse({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Method "${method}" not recognized` },
        });
      }
      break;
    }
  }
}

rl.on('line', (line) => handleMessage(line));

process.stderr.write('🚀 Local Tools MCP Server running on stdio.\n');
