import { NextRequest, NextResponse } from 'next/server';
import { mcpManager } from '@/lib/mcp';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'list-servers':
        const servers = await mcpManager.listServers();
        return NextResponse.json({ servers });

      case 'list-tools':
        const serverName = searchParams.get('server');
        const tools = await mcpManager.listTools(serverName || undefined);
        return NextResponse.json({ tools });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: list-servers, list-tools' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('MCP API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { server, tool, args } = body;

    if (!server || !tool) {
      return NextResponse.json(
        { error: 'Server and tool are required' },
        { status: 400 }
      );
    }

    const result = await mcpManager.callTool(server, tool, args || {});

    return NextResponse.json({ result });
  } catch (error) {
    console.error('MCP tool call error:', error);
    return NextResponse.json(
      { error: `Tool call failed: ${error}` },
      { status: 500 }
    );
  }
}