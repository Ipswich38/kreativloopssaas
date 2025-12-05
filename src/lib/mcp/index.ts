import { CalcomMCPServer } from './calcom-server';

export class MCPServerManager {
  private servers: Map<string, any> = new Map();

  constructor() {
    this.servers.set('calcom', new CalcomMCPServer());
  }

  async listServers() {
    return Array.from(this.servers.keys()).map(name => ({
      name,
      description: this.getServerDescription(name),
    }));
  }

  async listTools(serverName?: string) {
    if (serverName) {
      const server = this.servers.get(serverName);
      if (!server) {
        throw new Error(`Server ${serverName} not found`);
      }
      return server.listTools();
    }

    const allTools = [];
    for (const entry of Array.from(this.servers.entries())) {
      const [serverName, server] = entry;
      const tools = await server.listTools();
      allTools.push(...tools.map((tool: any) => ({
        ...tool,
        server: serverName,
      })));
    }
    return allTools;
  }

  async callTool(serverName: string, toolName: string, args: any) {
    const server = this.servers.get(serverName);
    if (!server) {
      throw new Error(`Server ${serverName} not found`);
    }

    return server.callTool(toolName, args);
  }

  private getServerDescription(name: string): string {
    switch (name) {
      case 'calcom':
        return 'Cal.com integration server for scheduling and appointment management';
      default:
        return 'MCP server';
    }
  }
}

export const mcpManager = new MCPServerManager();