import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { server } from './server.js';
import http from 'http';

const mode = process.env.TRANSPORT || 'stdio';

async function main() {
  if (mode === 'http') {
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    
    const httpServer = http.createServer(async (req, res) => {
      // Handle CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      await transport.handleRequest(req, res);
    });

    await server.connect(transport);
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
