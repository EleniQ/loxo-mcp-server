import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { server } from './server.js';
import http from 'http';

const mode = process.env.TRANSPORT || 'stdio';

async function main() {
  if (mode === 'http') {
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    const httpServer = http.createServer(async (req, res) => {
      await transport.handleRequest(req, res);
    });
    await server.connect(transport);
    const port = process.env.PORT || 3000;
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
