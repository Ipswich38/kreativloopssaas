 'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Server,
  Wrench,
  Play,
  Code,
  Calendar,
  Users,
  Zap,
  RefreshCw,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface MCPServer {
  name: string;
  description: string;
}

interface MCPTool {
  name: string;
  description: string;
  server?: string;
  inputSchema?: any;
}

export function MCPDashboard() {
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [toolResults, setToolResults] = useState<Record<string, any>>({});
  const [executing, setExecuting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadServers();
    loadTools();
  }, []);

  const loadServers = async () => {
    try {
      const response = await fetch('/api/mcp?action=list-servers');
      const data = await response.json();
      setServers(data.servers || []);
    } catch (error) {
      console.error('Failed to load servers:', error);
    }
  };

  const loadTools = async (server?: string) => {
    try {
      const url = server ? `/api/mcp?action=list-tools&server=${server}` : '/api/mcp?action=list-tools';
      const response = await fetch(url);
      const data = await response.json();
      setTools(data.tools || []);
    } catch (error) {
      console.error('Failed to load tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const executeTool = async (serverName: string, toolName: string, args: any = {}) => {
    const toolKey = `${serverName}:${toolName}`;
    setExecuting(prev => ({ ...prev, [toolKey]: true }));

    try {
      const response = await fetch('/api/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          server: serverName,
          tool: toolName,
          args,
        }),
      });

      const data = await response.json();
      setToolResults(prev => ({ ...prev, [toolKey]: data.result }));
    } catch (error) {
      console.error('Failed to execute tool:', error);
      setToolResults(prev => ({
        ...prev,
        [toolKey]: { success: false, error: `${error}` }
      }));
    } finally {
      setExecuting(prev => ({ ...prev, [toolKey]: false }));
    }
  };

  const getServerIcon = (serverName: string) => {
    switch (serverName) {
      case 'calcom':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      default:
        return <Server className="h-5 w-5 text-gray-600" />;
    }
  };

  const renderToolResult = (result: any) => {
    if (!result) return null;

    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          {result.success ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          <span className="text-sm font-medium">
            {result.success ? 'Success' : 'Error'}
          </span>
        </div>
        <pre className="text-xs text-gray-700 overflow-x-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2">Loading MCP servers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Zap className="h-6 w-6 text-blue-600" />
            MCP Integration Dashboard
          </h2>
          <p className="text-gray-600 mt-1">
            Model Context Protocol servers and automated agents
          </p>
        </div>
        <Button onClick={() => { loadServers(); loadTools(); }} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Servers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              MCP Servers ({servers.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {servers.map((server) => (
              <div
                key={server.name}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedServer === server.name
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => {
                  setSelectedServer(server.name);
                  loadTools(server.name);
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getServerIcon(server.name)}
                    <div>
                      <h4 className="font-medium">{server.name}</h4>
                      <p className="text-sm text-gray-600">{server.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tools */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Available Tools ({tools.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tools.map((tool) => {
              const toolKey = `${tool.server || 'unknown'}:${tool.name}`;
              const isExecuting = executing[toolKey];
              const result = toolResults[toolKey];

              return (
                <div key={toolKey} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4 text-gray-500" />
                        <h4 className="font-medium">{tool.name}</h4>
                        {tool.server && (
                          <Badge variant="outline" className="text-xs">
                            {tool.server}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => executeTool(tool.server || 'unknown', tool.name)}
                      disabled={isExecuting}
                    >
                      {isExecuting ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {renderToolResult(result)}
                </div>
              );
            })}

            {tools.length === 0 && (
              <div className="text-center py-6 text-gray-500">
                <Wrench className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p>No tools available</p>
                {!selectedServer && (
                  <p className="text-sm">Select a server to view its tools</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => executeTool('calcom', 'calcom_sync_appointments', {
                clinicId: 'clinic_1'
              })}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Sync All Appointments
            </Button>
            <Button
              variant="outline"
              onClick={() => loadTools()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Tools
            </Button>
            <Button
              variant="outline"
              disabled
              className="flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              Run Automation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}