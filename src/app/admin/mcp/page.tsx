'use client';

import { useState, useEffect } from 'react';
import {
  Bot,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Code,
  Database,
  Globe,
  HardDrive,
  Monitor,
  RefreshCw,
  Settings,
  Shield,
  Users,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

// Mock MCP status data
interface MCPAgent {
  id: string;
  name: string;
  type: 'scheduling' | 'reminders' | 'analytics' | 'support';
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  lastActivity: string;
  tasksCompleted: number;
  errorCount: number;
  uptime: string;
  version: string;
}

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
  activeConnections: number;
  totalRequests: number;
  errorRate: number;
  responseTime: number;
}

const mockAgents: MCPAgent[] = [
  {
    id: 'agent_scheduling',
    name: 'Appointment Scheduler',
    type: 'scheduling',
    status: 'active',
    lastActivity: '2025-01-02T11:45:00Z',
    tasksCompleted: 1247,
    errorCount: 3,
    uptime: '99.8%',
    version: '2.1.4'
  },
  {
    id: 'agent_reminders',
    name: 'Reminder Service',
    type: 'reminders',
    status: 'active',
    lastActivity: '2025-01-02T11:44:30Z',
    tasksCompleted: 856,
    errorCount: 1,
    uptime: '99.9%',
    version: '1.8.2'
  },
  {
    id: 'agent_analytics',
    name: 'Analytics Engine',
    type: 'analytics',
    status: 'maintenance',
    lastActivity: '2025-01-02T10:30:00Z',
    tasksCompleted: 2341,
    errorCount: 0,
    uptime: '98.7%',
    version: '3.0.1'
  },
  {
    id: 'agent_support',
    name: 'Customer Support',
    type: 'support',
    status: 'error',
    lastActivity: '2025-01-02T09:15:00Z',
    tasksCompleted: 445,
    errorCount: 12,
    uptime: '95.2%',
    version: '1.4.7'
  }
];

const mockMetrics: SystemMetrics = {
  cpuUsage: 34.7,
  memoryUsage: 67.2,
  diskUsage: 45.8,
  networkLatency: 23,
  activeConnections: 1247,
  totalRequests: 45892,
  errorRate: 0.12,
  responseTime: 145
};

export default function MCPAdminPage() {
  const [agents, setAgents] = useState<MCPAgent[]>(mockAgents);
  const [metrics, setMetrics] = useState<SystemMetrics>(mockMetrics);
  const [selectedAgent, setSelectedAgent] = useState<MCPAgent | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);

    // Simulate API call
    setTimeout(() => {
      setMetrics({
        ...metrics,
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        networkLatency: Math.random() * 50,
        activeConnections: Math.floor(Math.random() * 2000) + 1000
      });
      setIsRefreshing(false);
    }, 1000);
  };

  const restartAgent = async (agentId: string) => {
    setAgents(prev =>
      prev.map(agent =>
        agent.id === agentId
          ? { ...agent, status: 'active', errorCount: 0, lastActivity: new Date().toISOString() }
          : agent
      )
    );
  };

  const getStatusColor = (status: MCPAgent['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-gray-100 text-gray-800 border-gray-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      maintenance: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[status];
  };

  const getStatusIcon = (status: MCPAgent['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'maintenance': return <Clock className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const MetricCard = ({
    title,
    value,
    unit,
    icon: Icon,
    color = 'blue',
    trend
  }: {
    title: string;
    value: number;
    unit: string;
    icon: any;
    color?: string;
    trend?: 'up' | 'down' | 'stable';
  }) => (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg bg-${color}-100 flex items-center justify-center`}>
            <Icon className={`h-5 w-5 text-${color}-600`} />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">{title}</h3>
            <div className="flex items-center space-x-1">
              <span className="text-2xl font-bold text-gray-900">
                {value.toFixed(1)}
              </span>
              <span className="text-sm text-gray-600">{unit}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  const AgentCard = ({ agent }: { agent: MCPAgent }) => (
    <Card
      className="p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => setSelectedAgent(agent)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Bot className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{agent.name}</h3>
            <p className="text-sm text-gray-600">v{agent.version}</p>
          </div>
        </div>
        <Badge variant="outline" className={getStatusColor(agent.status)}>
          {getStatusIcon(agent.status)}
          <span className="ml-1 capitalize">{agent.status}</span>
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Tasks:</span>
          <span className="ml-1 font-medium">{agent.tasksCompleted.toLocaleString()}</span>
        </div>
        <div>
          <span className="text-gray-500">Uptime:</span>
          <span className="ml-1 font-medium">{agent.uptime}</span>
        </div>
        <div>
          <span className="text-gray-500">Errors:</span>
          <span className={cn(
            'ml-1 font-medium',
            agent.errorCount > 5 ? 'text-red-600' : 'text-gray-900'
          )}>
            {agent.errorCount}
          </span>
        </div>
        <div>
          <span className="text-gray-500">Last Active:</span>
          <span className="ml-1 font-medium">
            {new Date(agent.lastActivity).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {agent.status === 'error' && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              restartAgent(agent.id);
            }}
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Restart Agent
          </Button>
        </div>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-responsive py-6">
        <PageHeader
          title="MCP System Administration"
          description="Monitor and manage AI agents, system performance, and integrations"
          breadcrumbItems={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Admin', href: '/admin' },
            { label: 'MCP System', current: true }
          ]}
          actions={
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={refreshData}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn(
                  'h-4 w-4 mr-2',
                  isRefreshing && 'animate-spin'
                )} />
                Refresh
              </Button>
              <Button>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          }
        />

        {/* System Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="CPU Usage"
            value={metrics.cpuUsage}
            unit="%"
            icon={Monitor}
            color="blue"
          />
          <MetricCard
            title="Memory Usage"
            value={metrics.memoryUsage}
            unit="%"
            icon={HardDrive}
            color="green"
          />
          <MetricCard
            title="Network Latency"
            value={metrics.networkLatency}
            unit="ms"
            icon={Globe}
            color="purple"
          />
          <MetricCard
            title="Active Connections"
            value={metrics.activeConnections}
            unit=""
            icon={Users}
            color="orange"
          />
        </div>

        {/* MCP Agents */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">MCP Agents</h2>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                {agents.filter(a => a.status === 'active').length} Active
              </Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700">
                {agents.filter(a => a.status === 'error').length} Errors
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>

        {/* System Logs */}
        <Card className="p-6 mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">System Logs</h2>
            <Button variant="outline" size="sm">
              <Code className="h-4 w-4 mr-2" />
              View Full Logs
            </Button>
          </div>

          <div className="space-y-2 font-mono text-sm">
            {[
              { level: 'INFO', message: 'MCP Agent "Reminder Service" completed task batch', time: '11:45:23' },
              { level: 'WARN', message: 'High memory usage detected on analytics engine', time: '11:42:15' },
              { level: 'ERROR', message: 'Customer Support agent failed to connect to external API', time: '11:38:07' },
              { level: 'INFO', message: 'Appointment Scheduler processed 47 new appointments', time: '11:35:42' }
            ].map((log, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 rounded bg-gray-50">
                <span className="text-gray-500">[{log.time}]</span>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-xs',
                    log.level === 'ERROR' && 'bg-red-50 text-red-700',
                    log.level === 'WARN' && 'bg-yellow-50 text-yellow-700',
                    log.level === 'INFO' && 'bg-blue-50 text-blue-700'
                  )}
                >
                  {log.level}
                </Badge>
                <span className="text-gray-700">{log.message}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Analytics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Requests (24h)</span>
                <span className="font-bold">{metrics.totalRequests.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Error Rate</span>
                <span className="font-bold">{metrics.errorRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Avg Response Time</span>
                <span className="font-bold">{metrics.responseTime}ms</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Status</h3>
            <div className="space-y-3">
              {[
                { name: 'Cal.com API', status: 'Connected', latency: '45ms' },
                { name: 'Supabase Database', status: 'Connected', latency: '12ms' },
                { name: 'Email Service', status: 'Connected', latency: '89ms' },
                { name: 'SMS Gateway', status: 'Error', latency: 'N/A' }
              ].map((integration, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={cn(
                      'w-2 h-2 rounded-full',
                      integration.status === 'Connected' ? 'bg-green-500' : 'bg-red-500'
                    )} />
                    <span className="text-gray-900">{integration.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{integration.latency}</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        integration.status === 'Connected'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      )}
                    >
                      {integration.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Agent Details Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">{selectedAgent.name}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedAgent(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Status</label>
                  <div className="mt-1">
                    <Badge variant="outline" className={getStatusColor(selectedAgent.status)}>
                      {getStatusIcon(selectedAgent.status)}
                      <span className="ml-1 capitalize">{selectedAgent.status}</span>
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Version</label>
                  <p className="mt-1 font-medium">{selectedAgent.version}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Tasks Completed</label>
                  <p className="mt-1 font-medium">{selectedAgent.tasksCompleted.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Uptime</label>
                  <p className="mt-1 font-medium">{selectedAgent.uptime}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex space-x-2">
                  <Button onClick={() => restartAgent(selectedAgent.id)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Restart Agent
                  </Button>
                  <Button variant="outline">
                    <Activity className="h-4 w-4 mr-2" />
                    View Logs
                  </Button>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}