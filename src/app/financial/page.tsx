"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Plus,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

// Mock financial data based on CSV analysis
const financialOverview = {
  totalIncome: 11343930,
  totalExpenses: 4263730,
  netIncome: 7080199,
  monthlyIncome: 1020350,
  monthlyExpenses: 310898
}

const recentTransactions = [
  {
    id: '1',
    type: 'income',
    description: 'Oral Prophylaxis - Maria Santos',
    amount: 2500,
    date: '2024-12-05',
    method: 'cash',
    category: 'Service Payment'
  },
  {
    id: '2',
    type: 'expense',
    description: 'Dental Supplies - Fluoride',
    amount: 1200,
    date: '2024-12-04',
    method: 'bank_transfer',
    category: 'Dental Supplies'
  },
  {
    id: '3',
    type: 'income',
    description: 'Crown Installation - Juan Dela Cruz',
    amount: 10000,
    date: '2024-12-04',
    method: 'gcash',
    category: 'Service Payment',
    reference: 'GC123456789'
  },
  {
    id: '4',
    type: 'expense',
    description: 'Dr. Clency Arias - Commission',
    amount: 4000,
    date: '2024-12-03',
    method: 'bank_transfer',
    category: 'Staff Commission'
  },
  {
    id: '5',
    type: 'expense',
    description: 'Electricity Bill',
    amount: 6800,
    date: '2024-12-01',
    method: 'bank_transfer',
    category: 'Utilities'
  }
]

const expenseCategories = [
  { name: 'Staff Salaries', amount: 2534565, percentage: 59.5 },
  { name: 'Dental Supplies', amount: 410278, percentage: 9.6 },
  { name: 'Rent', amount: 456748, percentage: 10.7 },
  { name: 'Laboratories', amount: 209850, percentage: 4.9 },
  { name: 'Utilities', amount: 77503, percentage: 1.8 },
  { name: 'Others', amount: 575786, percentage: 13.5 }
]

export default function FinancialPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [transactionFilter, setTransactionFilter] = useState('all')

  const getTransactionIcon = (type: string) => {
    return type === 'income' ?
      <ArrowUpRight className="h-4 w-4 text-green-600" /> :
      <ArrowDownLeft className="h-4 w-4 text-red-600" />
  }

  const getTransactionColor = (type: string) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600'
  }

  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      cash: 'Cash',
      gcash: 'GCash',
      maya: 'Maya',
      card: 'Card',
      bank_transfer: 'Bank Transfer'
    }
    return methods[method] || method
  }

  const filteredTransactions = recentTransactions.filter(transaction => {
    if (transactionFilter === 'all') return true
    return transaction.type === transactionFilter
  })

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track your clinic's financial performance and transactions
          </p>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            This Month
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(financialOverview.totalIncome)}
                </p>
                <p className="text-xs text-gray-500 mt-1">This year</p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(financialOverview.totalExpenses)}
                </p>
                <p className="text-xs text-gray-500 mt-1">This year</p>
              </div>
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Income</p>
                <p className="text-2xl font-bold text-primary-600">
                  {formatCurrency(financialOverview.netIncome)}
                </p>
                <p className="text-xs text-gray-500 mt-1">This year</p>
              </div>
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(financialOverview.monthlyIncome)}
                </p>
                <p className="text-xs text-green-600 mt-1">+8% vs last month</p>
              </div>
              <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Transactions</CardTitle>
              <div className="flex space-x-2">
                <Button
                  variant={transactionFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTransactionFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={transactionFilter === 'income' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTransactionFilter('income')}
                >
                  Income
                </Button>
                <Button
                  variant={transactionFilter === 'expense' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTransactionFilter('expense')}
                >
                  Expenses
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center space-x-3">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.description}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{new Date(transaction.date).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{getPaymentMethodLabel(transaction.method)}</span>
                      {transaction.reference && (
                        <>
                          <span>•</span>
                          <span>{transaction.reference}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`font-medium ${getTransactionColor(transaction.type)}`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expense Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {expenseCategories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                  <div className="text-right">
                    <span className="text-sm font-medium">{formatCurrency(category.amount)}</span>
                    <span className="text-xs text-gray-500 ml-2">{category.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}