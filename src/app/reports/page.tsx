'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Users,
  FileText,
  Download,
  Filter,
  BarChart3,
  LineChart,
  Activity
} from 'lucide-react';

const reportCategories = [
  {
    id: 'financial',
    name: 'Financial Reports',
    icon: DollarSign,
    reports: [
      { name: 'Revenue Report', description: 'Monthly revenue breakdown', status: 'ready' },
      { name: 'Expense Analysis', description: 'Operating costs analysis', status: 'ready' },
      { name: 'Profit & Loss', description: 'P&L statement', status: 'ready' },
      { name: 'Tax Report', description: 'Tax compliance report', status: 'pending' }
    ]
  },
  {
    id: 'clinical',
    name: 'Clinical Reports',
    icon: Activity,
    reports: [
      { name: 'Treatment Success Rate', description: 'Clinical outcomes', status: 'ready' },
      { name: 'Procedure Volume', description: 'Most common procedures', status: 'ready' },
      { name: 'Patient Satisfaction', description: 'Satisfaction surveys', status: 'pending' }
    ]
  },
  {
    id: 'operational',
    name: 'Operational Reports',
    icon: BarChart3,
    reports: [
      { name: 'Appointment Analytics', description: 'Booking patterns & efficiency', status: 'ready' },
      { name: 'Staff Performance', description: 'Team productivity metrics', status: 'ready' },
      { name: 'Inventory Usage', description: 'Supply consumption trends', status: 'ready' }
    ]
  },
  {
    id: 'patient',
    name: 'Patient Reports',
    icon: Users,
    reports: [
      { name: 'Patient Demographics', description: 'Age, location, insurance', status: 'ready' },
      { name: 'Patient Retention', description: 'Return visit analysis', status: 'ready' },
      { name: 'New Patient Acquisition', description: 'Growth metrics', status: 'ready' }
    ]
  }
];

const quickStats = [
  {
    title: 'Monthly Revenue',
    value: '₱284,500',
    change: '+12.5%',
    trend: 'up',
    icon: DollarSign
  },
  {
    title: 'Appointments',
    value: '342',
    change: '+8.2%',
    trend: 'up',
    icon: Calendar
  },
  {
    title: 'New Patients',
    value: '45',
    change: '+15.3%',
    trend: 'up',
    icon: Users
  },
  {
    title: 'Patient Retention',
    value: '87%',
    change: '-2.1%',
    trend: 'down',
    icon: TrendingUp
  }
];

export default function ReportsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'processing':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const filteredCategories = selectedCategory === 'all'
    ? reportCategories
    : reportCategories.filter(cat => cat.id === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm text-gray-600 mt-1">
            Comprehensive insights into your dental practice performance
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-md text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>

          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>

          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    {stat.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <stat.icon className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Reports
            </Button>
            {reportCategories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                <category.icon className="h-4 w-4 mr-1" />
                {category.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="space-y-8">
        {filteredCategories.map((category) => (
          <div key={category.id}>
            <div className="flex items-center space-x-2 mb-4">
              <category.icon className="h-6 w-6 text-gray-600" />
              <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
              <Badge variant="outline">{category.reports.length} reports</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.reports.map((report, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{report.name}</CardTitle>
                      <Badge variant={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <p className="text-sm text-gray-600 mb-4">{report.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Last updated: {new Date().toLocaleDateString()}
                      </div>

                      <div className="flex items-center space-x-1">
                        <Button variant="outline" size="sm">
                          <LineChart className="h-4 w-4 mr-1" />
                          View
                        </Button>

                        {report.status === 'ready' && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Custom Reports Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Custom Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Create Custom Reports
            </h3>
            <p className="text-gray-600 mb-4">
              Build custom reports with your specific metrics and date ranges
            </p>
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              Create Custom Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}