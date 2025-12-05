'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  TrendingDown,
  Calendar,
  Edit,
  Trash2
} from 'lucide-react';

const mockInventory = [
  {
    id: '1',
    name: 'Dental Anesthetic Cartridges',
    category: 'dental_supplies',
    quantity: 45,
    unit: 'pieces',
    costPerUnit: 2.5,
    supplier: 'DentMed Supply',
    expiryDate: '2024-12-31',
    minimumStock: 50,
    status: 'low_stock'
  },
  {
    id: '2',
    name: 'Disposable Gloves (Nitrile)',
    category: 'consumables',
    quantity: 120,
    unit: 'boxes',
    costPerUnit: 15.0,
    supplier: 'MedSupply Inc',
    expiryDate: '2025-06-30',
    minimumStock: 20,
    status: 'in_stock'
  },
  {
    id: '3',
    name: 'Dental Impression Material',
    category: 'dental_supplies',
    quantity: 8,
    unit: 'tubes',
    costPerUnit: 45.0,
    supplier: 'DentMed Supply',
    expiryDate: '2024-08-15',
    minimumStock: 10,
    status: 'low_stock'
  },
  {
    id: '4',
    name: 'Office Paper (A4)',
    category: 'office_supplies',
    quantity: 25,
    unit: 'reams',
    costPerUnit: 8.5,
    supplier: 'Office Depot',
    expiryDate: null,
    minimumStock: 5,
    status: 'in_stock'
  }
];

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low_stock':
        return 'destructive';
      case 'out_of_stock':
        return 'destructive';
      case 'in_stock':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'dental_supplies':
        return 'bg-blue-100 text-blue-800';
      case 'consumables':
        return 'bg-green-100 text-green-800';
      case 'office_supplies':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInventory = mockInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = mockInventory.filter(item => item.status === 'low_stock').length;
  const totalValue = mockInventory.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track and manage your dental supplies and equipment
          </p>
        </div>

        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{mockInventory.length}</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Low Stock Alert</p>
                <p className="text-2xl font-bold text-red-600">{lowStockItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-green-600">₱{totalValue.toFixed(2)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">2</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search inventory items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-md text-sm"
            >
              <option value="all">All Categories</option>
              <option value="dental_supplies">Dental Supplies</option>
              <option value="consumables">Consumables</option>
              <option value="office_supplies">Office Supplies</option>
            </select>

            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory List */}
      <div className="space-y-4">
        {filteredInventory.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No inventory items found</p>
              <Button className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredInventory.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <Badge
                          variant={getStatusColor(item.status)}
                        >
                          {item.status.replace('_', ' ')}
                        </Badge>
                        <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(item.category)}`}>
                          {item.category.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <span className="font-medium">Quantity:</span> {item.quantity} {item.unit}
                          </div>
                          <div>
                            <span className="font-medium">Cost/Unit:</span> ₱{item.costPerUnit.toFixed(2)}
                          </div>
                          <div>
                            <span className="font-medium">Supplier:</span> {item.supplier}
                          </div>
                          <div>
                            <span className="font-medium">Min Stock:</span> {item.minimumStock} {item.unit}
                          </div>
                        </div>

                        {item.expiryDate && (
                          <div className="text-xs text-orange-600">
                            Expires: {new Date(item.expiryDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          ₱{(item.quantity * item.costPerUnit).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">Total Value</div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}