'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Save,
  Plus,
  X,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  Camera,
  FileImage,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// Dental chart data types
interface ToothCondition {
  id: string;
  type: 'cavity' | 'filling' | 'crown' | 'implant' | 'missing' | 'healthy' | 'root_canal';
  surface?: 'occlusal' | 'mesial' | 'distal' | 'buccal' | 'lingual' | 'incisal';
  severity?: 'mild' | 'moderate' | 'severe';
  notes?: string;
  date?: string;
  providerId?: string;
  treatmentPlan?: boolean;
}

interface ToothData {
  number: number;
  name: string;
  quadrant: 1 | 2 | 3 | 4;
  conditions: ToothCondition[];
  lastExam?: string;
  needsAttention?: boolean;
}

interface DentalChartProps {
  patientId: string;
  patientName?: string;
  editable?: boolean;
  viewMode?: 'adult' | 'pediatric';
  onToothSelect?: (tooth: ToothData) => void;
  onConditionAdd?: (toothNumber: number, condition: ToothCondition) => void;
  onSave?: (chartData: ToothData[]) => void;
}

// Mock dental chart data (32 adult teeth)
const generateMockTeeth = (): ToothData[] => {
  const teeth: ToothData[] = [];

  // Upper teeth (quadrants 1 and 2)
  for (let i = 1; i <= 16; i++) {
    teeth.push({
      number: i,
      name: getToothName(i),
      quadrant: i <= 8 ? 1 : 2,
      conditions: generateRandomConditions(),
      lastExam: '2024-12-01',
      needsAttention: Math.random() > 0.8
    });
  }

  // Lower teeth (quadrants 3 and 4)
  for (let i = 17; i <= 32; i++) {
    teeth.push({
      number: i,
      name: getToothName(i),
      quadrant: i <= 24 ? 3 : 4,
      conditions: generateRandomConditions(),
      lastExam: '2024-12-01',
      needsAttention: Math.random() > 0.8
    });
  }

  return teeth;
};

const generateRandomConditions = (): ToothCondition[] => {
  const conditionTypes: ToothCondition['type'][] = ['healthy', 'cavity', 'filling', 'crown', 'implant'];
  const randomType = conditionTypes[Math.floor(Math.random() * conditionTypes.length)];

  if (randomType === 'healthy') return [];

  return [{
    id: `cond_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: randomType,
    surface: Math.random() > 0.5 ? 'occlusal' : 'mesial',
    severity: Math.random() > 0.5 ? 'mild' : 'moderate',
    date: '2024-12-01',
    notes: randomType === 'cavity' ? 'Small cavity detected during routine exam' : undefined
  }];
};

const getToothName = (number: number): string => {
  const toothNames: Record<number, string> = {
    1: 'Central Incisor', 2: 'Lateral Incisor', 3: 'Canine', 4: 'First Premolar',
    5: 'Second Premolar', 6: 'First Molar', 7: 'Second Molar', 8: 'Third Molar',
    9: 'Central Incisor', 10: 'Lateral Incisor', 11: 'Canine', 12: 'First Premolar',
    13: 'Second Premolar', 14: 'First Molar', 15: 'Second Molar', 16: 'Third Molar',
    17: 'Third Molar', 18: 'Second Molar', 19: 'First Molar', 20: 'Second Premolar',
    21: 'First Premolar', 22: 'Canine', 23: 'Lateral Incisor', 24: 'Central Incisor',
    25: 'Central Incisor', 26: 'Lateral Incisor', 27: 'Canine', 28: 'First Premolar',
    29: 'Second Premolar', 30: 'First Molar', 31: 'Second Molar', 32: 'Third Molar'
  };
  return toothNames[number] || 'Unknown';
};

const getConditionColor = (condition: ToothCondition): string => {
  const colors = {
    healthy: 'bg-green-100 border-green-400',
    cavity: 'bg-red-100 border-red-400',
    filling: 'bg-blue-100 border-blue-400',
    crown: 'bg-yellow-100 border-yellow-400',
    implant: 'bg-purple-100 border-purple-400',
    missing: 'bg-gray-100 border-gray-400',
    root_canal: 'bg-orange-100 border-orange-400'
  };
  return colors[condition.type] || colors.healthy;
};

const getConditionIcon = (condition: ToothCondition) => {
  switch (condition.type) {
    case 'cavity': return <AlertCircle className="h-3 w-3 text-red-600" />;
    case 'filling': return <CheckCircle className="h-3 w-3 text-blue-600" />;
    case 'crown': return <CheckCircle className="h-3 w-3 text-yellow-600" />;
    case 'implant': return <CheckCircle className="h-3 w-3 text-purple-600" />;
    case 'missing': return <X className="h-3 w-3 text-gray-600" />;
    case 'root_canal': return <AlertCircle className="h-3 w-3 text-orange-600" />;
    default: return <CheckCircle className="h-3 w-3 text-green-600" />;
  }
};

export function DentalChart({
  patientId,
  patientName = "John Doe",
  editable = true,
  viewMode = 'adult',
  onToothSelect,
  onConditionAdd,
  onSave
}: DentalChartProps) {
  const [teeth, setTeeth] = useState<ToothData[]>(() => generateMockTeeth());
  const [selectedTooth, setSelectedTooth] = useState<ToothData | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showConditions, setShowConditions] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleToothClick = useCallback((tooth: ToothData) => {
    setSelectedTooth(tooth);
    onToothSelect?.(tooth);
  }, [onToothSelect]);

  const handleSave = useCallback(() => {
    onSave?.(teeth);
    setIsDirty(false);
  }, [teeth, onSave]);

  const zoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const zoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
  const resetZoom = () => setZoom(1);

  // Mobile-optimized tooth component
  const ToothComponent = ({ tooth, isSelected }: { tooth: ToothData; isSelected: boolean }) => {
    const primaryCondition = tooth.conditions[0];
    const hasMultipleConditions = tooth.conditions.length > 1;

    return (
      <button
        onClick={() => handleToothClick(tooth)}
        className={cn(
          'relative group touch-target rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center p-2',
          'hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary',
          'min-h-[60px] min-w-[50px] sm:min-h-[80px] sm:min-w-[65px]',
          isSelected ? 'ring-2 ring-primary shadow-lg scale-105' : '',
          primaryCondition ? getConditionColor(primaryCondition) : 'bg-green-50 border-green-200',
          tooth.needsAttention ? 'shadow-red-200 shadow-md' : ''
        )}
        title={`Tooth ${tooth.number} - ${tooth.name}`}
      >
        {/* Tooth number */}
        <span className="text-xs font-bold text-gray-700 mb-1">
          {tooth.number}
        </span>

        {/* Tooth icon or condition indicator */}
        <div className="flex items-center justify-center mb-1">
          {primaryCondition ? (
            getConditionIcon(primaryCondition)
          ) : (
            <Circle className="h-4 w-4 text-green-600 fill-current" />
          )}
        </div>

        {/* Condition count badge */}
        {hasMultipleConditions && (
          <Badge variant="secondary" className="text-xs h-4 px-1">
            +{tooth.conditions.length - 1}
          </Badge>
        )}

        {/* Attention indicator */}
        {tooth.needsAttention && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">!</span>
          </div>
        )}
      </button>
    );
  };

  // Render teeth in quadrants
  const renderQuadrant = (quadrant: 1 | 2 | 3 | 4, teeth: ToothData[]) => {
    const quadrantTeeth = teeth.filter(tooth => tooth.quadrant === quadrant);

    return (
      <div className={cn(
        'grid gap-1 p-2 rounded-lg bg-gray-50',
        'grid-cols-4 sm:grid-cols-8',
        quadrant === 1 || quadrant === 2 ? 'mb-4' : ''
      )}>
        {quadrantTeeth.map(tooth => (
          <ToothComponent
            key={tooth.number}
            tooth={tooth}
            isSelected={selectedTooth?.number === tooth.number}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{patientName}</h2>
              <p className="text-blue-100 text-sm">Dental Chart - {viewMode === 'adult' ? 'Adult' : 'Pediatric'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Last Updated: Dec 1, 2024
            </Badge>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={zoomOut}
              className="touch-target"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 min-w-[4ch] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={zoomIn}
              className="touch-target"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={resetZoom}
              className="touch-target"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="touch-target"
            >
              <Camera className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Photos</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="touch-target"
            >
              <FileImage className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">X-Rays</span>
            </Button>

            {editable && isDirty && (
              <Button
                onClick={handleSave}
                className="btn-medical touch-target"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="p-6">
        <div
          ref={chartRef}
          className="relative"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
        >
          {/* Upper Jaw */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Upper Jaw (Maxilla)
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Quadrant 1 (Upper Right) */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  Quadrant I (Upper Right)
                </h4>
                {renderQuadrant(1, teeth)}
              </div>

              {/* Quadrant 2 (Upper Left) */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  Quadrant II (Upper Left)
                </h4>
                {renderQuadrant(2, teeth)}
              </div>
            </div>
          </div>

          {/* Lower Jaw */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Lower Jaw (Mandible)
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Quadrant 4 (Lower Right) */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  Quadrant IV (Lower Right)
                </h4>
                {renderQuadrant(4, teeth)}
              </div>

              {/* Quadrant 3 (Lower Left) */}
              <div>
                <h4 className="text-sm font-medium text-gray-600 mb-2">
                  Quadrant III (Lower Left)
                </h4>
                {renderQuadrant(3, teeth)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
          {[
            { type: 'healthy', label: 'Healthy', icon: CheckCircle, color: 'text-green-600' },
            { type: 'cavity', label: 'Cavity', icon: AlertCircle, color: 'text-red-600' },
            { type: 'filling', label: 'Filling', icon: CheckCircle, color: 'text-blue-600' },
            { type: 'crown', label: 'Crown', icon: CheckCircle, color: 'text-yellow-600' },
            { type: 'implant', label: 'Implant', icon: CheckCircle, color: 'text-purple-600' },
            { type: 'missing', label: 'Missing', icon: X, color: 'text-gray-600' },
            { type: 'root_canal', label: 'Root Canal', icon: AlertCircle, color: 'text-orange-600' }
          ].map(({ type, label, icon: Icon, color }) => (
            <div key={type} className="flex items-center space-x-2">
              <Icon className={cn('h-4 w-4', color)} />
              <span className="text-sm text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Tooth Detail Panel */}
      {selectedTooth && (
        <div className="border-t border-gray-200 bg-blue-50 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Tooth #{selectedTooth.number} - {selectedTooth.name}
              </h3>
              <p className="text-sm text-gray-600">
                Quadrant {selectedTooth.quadrant} • Last examined: {selectedTooth.lastExam}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTooth(null)}
              className="touch-target"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {selectedTooth.conditions.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Conditions:</h4>
              {selectedTooth.conditions.map((condition, index) => (
                <div key={condition.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-3">
                    {getConditionIcon(condition)}
                    <div>
                      <p className="font-medium capitalize">{condition.type.replace('_', ' ')}</p>
                      {condition.surface && (
                        <p className="text-sm text-gray-600">Surface: {condition.surface}</p>
                      )}
                      {condition.notes && (
                        <p className="text-sm text-gray-600">{condition.notes}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {condition.date && (
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="h-3 w-3 mr-1" />
                        {condition.date}
                      </Badge>
                    )}
                    {condition.treatmentPlan && (
                      <Badge variant="secondary" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        Planned
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-gray-600">No conditions recorded for this tooth</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}