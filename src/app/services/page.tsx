"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  Plus,
  Edit,
  MoreHorizontal,
  Clock,
  DollarSign,
  Tag
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Mock services data based on CSV analysis
const mockServices = [
  {
    id: '1',
    name: 'Oral Prophylaxis',
    category: 'Preventive',
    basePrice: 1500,
    promoPrice: null,
    duration: 60,
    description: 'Professional teeth cleaning and plaque removal',
    isActive: true
  },
  {
    id: '2',
    name: 'Moderate Cleaning',
    category: 'Preventive',
    basePrice: 2500,
    promoPrice: null,
    duration: 90,
    description: 'Deep cleaning for moderate plaque buildup',
    isActive: true
  },
  {
    id: '3',
    name: 'Deep Cleaning',
    category: 'Preventive',
    basePrice: 4000,
    promoPrice: 3000,
    duration: 120,
    description: 'Intensive cleaning for heavy plaque and tartar',
    isActive: true
  },
  {
    id: '4',
    name: 'Light Cure Filling',
    category: 'Restorative',
    basePrice: 1500,
    promoPrice: 1000,
    duration: 45,
    description: 'Tooth-colored composite resin filling',
    isActive: true
  },
  {
    id: '5',
    name: 'PFM Crown',
    category: 'Prosthetics',
    basePrice: 10000,
    promoPrice: null,
    duration: 120,
    description: 'Porcelain-fused-to-metal crown',
    isActive: true
  },
  {
    id: '6',
    name: 'Zirconia Crown',
    category: 'Prosthetics',
    basePrice: 30000,
    promoPrice: 25000,
    duration: 180,
    description: 'High-strength ceramic crown',
    isActive: true
  },
  {
    id: '7',
    name: 'Complete Dentures',
    category: 'Prosthetics',
    basePrice: 40000,
    promoPrice: 35000,
    duration: 240,
    description: 'Full set of removable dentures',
    isActive: true
  },
  {
    id: '8',
    name: 'Teeth Whitening',
    category: 'Cosmetic',
    basePrice: 20000,
    promoPrice: 15000,
    duration: 90,
    description: 'Professional teeth whitening treatment',
    isActive: true
  },
  {
    id: '9',
    name: 'Composite Veneers',
    category: 'Cosmetic',
    basePrice: 10000,
    promoPrice: 8000,
    duration: 120,
    description: 'Composite resin veneers for aesthetic improvement',
    isActive: true
  },
  {
    id: '10',
    name: 'Hawley Retainer',
    category: 'Orthodontics',
    basePrice: 8000,
    promoPrice: null,
    duration: 60,
    description: 'Traditional wire and acrylic retainer',
    isActive: true
  }
]

const serviceCategories = [
  'All',
  'Preventive',
  'Restorative',
  'Prosthetics',
  'Cosmetic',
  'Orthodontics'
]

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredServices = mockServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || service.category === selectedCategory
    return matchesSearch && matchesCategory && service.isActive
  })

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Preventive': 'bg-green-100 text-green-800',
      'Restorative': 'bg-blue-100 text-blue-800',
      'Prosthetics': 'bg-purple-100 text-purple-800',
      'Cosmetic': 'bg-pink-100 text-pink-800',
      'Orthodontics': 'bg-orange-100 text-orange-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Services & Rates</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your dental services catalog and pricing
          </p>
        </div>

        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Service
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              {serviceCategories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <Card key={service.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getCategoryColor(service.category)}`}>
                    <Tag className="inline-block w-3 h-3 mr-1" />
                    {service.category}
                  </span>
                </div>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Description */}
              <p className="text-sm text-gray-600">{service.description}</p>

              {/* Pricing */}
              <div className="bg-gray-50 rounded-md p-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Base Price</span>
                    <span className={`text-sm font-medium ${service.promoPrice ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {formatCurrency(service.basePrice)}
                    </span>
                  </div>

                  {service.promoPrice && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-600 font-medium">Promo Price</span>
                      <span className="text-sm font-bold text-green-600">
                        {formatCurrency(service.promoPrice)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-gray-200">
                    <span className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Duration
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {service.duration} min
                    </span>
                  </div>
                </div>
              </div>

              {/* Savings indicator */}
              {service.promoPrice && (
                <div className="bg-green-50 rounded-md p-2">
                  <p className="text-xs text-green-700">
                    Save {formatCurrency(service.basePrice - service.promoPrice)} with current promotion
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="mr-2 h-3 w-3" />
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <DollarSign className="mr-2 h-3 w-3" />
                  Set Rate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredServices.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No services found</p>
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add First Service
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}