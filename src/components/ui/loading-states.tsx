'use client';

import { Loader2, Circle, Activity, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Basic loading spinner
export function LoadingSpinner({
  size = 'default',
  className
}: {
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2
      className={cn(
        'animate-spin text-blue-600',
        sizeClasses[size],
        className
      )}
    />
  );
}

// Loading skeleton for content
export function LoadingSkeleton({
  lines = 3,
  className
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className={cn(
            'h-4 bg-gray-200 rounded animate-pulse',
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )} />
        </div>
      ))}
    </div>
  );
}

// Card loading skeleton
export function LoadingCard({
  count = 1,
  className
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
            </div>
          </div>
          <LoadingSkeleton lines={2} />
        </div>
      ))}
    </div>
  );
}

// Table loading skeleton
export function LoadingTable({
  rows = 5,
  columns = 4,
  className
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn('bg-white rounded-lg border overflow-hidden', className)}>
      {/* Header */}
      <div className="bg-gray-50 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className={cn(
                    'h-4 bg-gray-200 rounded animate-pulse',
                    colIndex === 0 ? 'w-3/4' : 'w-full'
                  )}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Full page loading
export function LoadingPage({
  message = 'Loading...',
  description,
  className
}: {
  message?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn(
      'min-h-screen bg-gray-50 flex items-center justify-center p-4',
      className
    )}>
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-pulse" />
            <div className="absolute inset-2 border-4 border-blue-600 rounded-full animate-spin border-t-transparent" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">{message}</h3>
          {description && (
            <p className="text-sm text-gray-600 max-w-sm">{description}</p>
          )}
        </div>

        {/* Loading dots animation */}
        <div className="flex justify-center space-x-1">
          {[0, 1, 2].map((i) => (
            <Circle
              key={i}
              className="h-2 w-2 fill-current text-blue-600 animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Progress indicators
export function ProgressBar({
  progress,
  label,
  showPercentage = true,
  className
}: {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between text-sm">
          {label && <span className="text-gray-600">{label}</span>}
          {showPercentage && <span className="text-gray-900 font-medium">{progress}%</span>}
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

// Step progress indicator
export function StepProgress({
  steps,
  currentStep,
  className
}: {
  steps: string[];
  currentStep: number; // 0-based index
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isUpcoming = index > currentStep;

        return (
          <div key={index} className="flex items-center">
            {/* Step circle */}
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              isCompleted && 'bg-green-600 text-white',
              isCurrent && 'bg-blue-600 text-white',
              isUpcoming && 'bg-gray-200 text-gray-600'
            )}>
              {isCompleted ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                index + 1
              )}
            </div>

            {/* Step label */}
            <div className={cn(
              'ml-3 text-sm',
              isCurrent ? 'text-blue-600 font-medium' : 'text-gray-600'
            )}>
              {step}
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className={cn(
                'flex-1 h-0.5 mx-4 min-w-[2rem]',
                index < currentStep ? 'bg-green-600' : 'bg-gray-200'
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Activity indicator
export function ActivityIndicator({
  message = 'Processing...',
  className
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center space-x-2 text-sm text-gray-600', className)}>
      <Activity className="h-4 w-4 animate-pulse text-blue-600" />
      <span>{message}</span>
    </div>
  );
}

// Inline loading state
export function InlineLoading({
  text = 'Loading...',
  size = 'sm',
  className
}: {
  text?: string;
  size?: 'sm' | 'default';
  className?: string;
}) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <LoadingSpinner size={size} />
      <span className={cn(
        'text-gray-600',
        size === 'sm' ? 'text-sm' : 'text-base'
      )}>
        {text}
      </span>
    </div>
  );
}

// Button loading state
export function LoadingButton({
  children,
  loading = false,
  disabled = false,
  loadingText = 'Loading...',
  className,
  ...props
}: {
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  loadingText?: string;
  className?: string;
  [key: string]: any;
}) {
  return (
    <button
      disabled={loading || disabled}
      className={cn(
        'inline-flex items-center justify-center space-x-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <LoadingSpinner size="sm" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

// Data loading wrapper
export function DataWrapper<T>({
  data,
  loading,
  error,
  empty,
  children,
  loadingComponent,
  errorComponent,
  emptyComponent,
  className
}: {
  data: T | null | undefined;
  loading: boolean;
  error?: string | null;
  empty?: boolean;
  children: (data: T) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
  className?: string;
}) {
  if (loading) {
    return (
      <div className={className}>
        {loadingComponent || <InlineLoading text="Loading data..." />}
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        {errorComponent || (
          <div className="text-red-600 text-sm p-4 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}
      </div>
    );
  }

  if (empty || !data) {
    return (
      <div className={className}>
        {emptyComponent || (
          <div className="text-gray-500 text-sm p-4 text-center">
            No data available
          </div>
        )}
      </div>
    );
  }

  return <div className={className}>{children(data)}</div>;
}

// Time-based loading messages
export function TimedLoadingMessage({
  messages = [
    'Loading...',
    'This is taking a bit longer...',
    'Almost there...',
    'Thanks for your patience...'
  ],
  intervals = [0, 3000, 8000, 15000],
  className
}: {
  messages?: string[];
  intervals?: number[];
  className?: string;
}) {
  const [messageIndex, setMessageIndex] = React.useState(0);

  React.useEffect(() => {
    const timers = intervals.slice(1).map((interval, index) =>
      setTimeout(() => {
        setMessageIndex(Math.min(index + 1, messages.length - 1));
      }, interval)
    );

    return () => timers.forEach(clearTimeout);
  }, [messages, intervals]);

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <LoadingSpinner />
      <span className="text-gray-600 transition-opacity duration-300">
        {messages[messageIndex]}
      </span>
    </div>
  );
}