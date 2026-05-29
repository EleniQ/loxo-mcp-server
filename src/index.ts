import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { server } from './server.js';
import http from 'http';

const mode = process.env.TRANSPORT || 'stdio';

async function main() {
  if (mode === 'http') {
    const httpServer = http.createServer(async (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Mcp-Session-Id');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      try {
        const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
        await server.connect(transport);
        await transport.handleRequest(req, res);
      } catch (err) {
        console.error('Request error:', err);
        if (!res.headersSent) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      }
    });

    const port = process.env.PORT || 8080;
    httpServer.listen(port, () => {
      console.error(`Loxo MCP Server running on HTTP port ${port}`);
    });
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Loxo MCP Server running on stdio");
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
