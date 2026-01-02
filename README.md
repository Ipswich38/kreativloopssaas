# DentalFlow - Modern Dental Practice Management System

> A comprehensive, mobile-first dental practice management solution built with Next.js 14, TypeScript, and modern web technologies.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)

## ✨ Features

### 🏥 Core Practice Management
- **Patient Management** - Complete patient records with medical history, insurance, and contact information
- **Appointment Scheduling** - Advanced booking system with provider availability and conflict detection
- **Treatment Planning** - Digital dental charts with interactive tooth mapping and condition tracking
- **Billing & Financial** - Insurance claims, payment processing, and financial reporting
- **Staff Management** - Provider schedules, roles, and performance tracking
- **Inventory Control** - Stock management with automated reorder alerts

### 📱 Modern User Experience
- **Mobile-First Design** - Responsive layouts optimized for tablets and smartphones
- **Progressive Web App (PWA)** - Offline functionality and app-like experience
- **Real-time Updates** - Live appointment status and notification system
- **Accessibility (WCAG 2.2 AA)** - Full keyboard navigation and screen reader support
- **Dark Mode Support** - Automatic theme switching based on user preference

### 🔧 Advanced Technology
- **AI-Powered MCP Agents** - Automated scheduling and patient communication
- **Cal.com Integration** - Seamless appointment booking and calendar sync
- **Supabase Backend** - Real-time database with authentication and storage
- **Modern State Management** - Zustand for predictable state updates
- **TypeScript** - End-to-end type safety and better developer experience

### 🏥 Healthcare Compliance
- **HIPAA Compliant** - Secure patient data handling and audit trails
- **FHIR Integration Ready** - Standardized healthcare data exchange
- **End-to-End Encryption** - TLS 1.3 for data in transit, AES-256 for data at rest
- **Role-Based Access Control** - Fine-grained permissions for different user types

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Modern browser with ES2020 support

### Installation

```bash
# Clone the repository
git clone https://github.com/Ipswich38/kreativloopssaas.git
cd kreativloopssaas

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

### Environment Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Cal.com Integration
CALCOM_API_KEY=your_calcom_api_key
CALCOM_WEBHOOK_SECRET=your_webhook_secret

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Optional: External Integrations
STRIPE_SECRET_KEY=your_stripe_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

## 🏗️ Architecture

### Technology Stack
- **Frontend:** Next.js 14, React 18, TypeScript
- **Styling:** Tailwind CSS, Radix UI, Framer Motion
- **State Management:** Zustand with persistence
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **External APIs:** Cal.com, Stripe (optional), Twilio (optional)

### Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Main dashboard
│   ├── appointments/      # Appointment management
│   ├── patients/         # Patient management
│   ├── auth/             # Authentication
│   └── api/              # API routes
├── components/            # React components
│   ├── dental/           # Dental-specific components
│   ├── appointments/     # Appointment components
│   ├── patient/          # Patient management
│   ├── layout/           # Layout components
│   └── ui/               # Reusable UI components
├── lib/                  # Utilities and configurations
│   ├── store/           # Zustand state management
│   ├── supabase/        # Database client
│   ├── calcom/          # Cal.com integration
│   └── utils.ts         # Utility functions
└── types/               # TypeScript type definitions
```

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--primary: #2563eb (Blue 600)
--primary-foreground: #ffffff

/* Medical Theme */
--medical-blue: #0ea5e9    /* Sky 500 */
--medical-teal: #14b8a6    /* Teal 500 */
--medical-green: #059669   /* Emerald 600 */

/* Status Colors */
--success: #10b981
--warning: #f59e0b
--error: #ef4444
--info: #3b82f6
```

### Typography
- **Font Family:** Inter Variable Font
- **Scale:** Modular scale (1.125) for consistent hierarchy
- **Line Heights:** 1.1 - 1.6 based on context

### Breakpoints
```css
/* Mobile First Approach */
sm: '640px'   /* Tablet */
md: '768px'   /* Small Desktop */
lg: '1024px'  /* Desktop */
xl: '1280px'  /* Large Desktop */
2xl: '1536px' /* Ultra Wide */
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Create production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript compiler
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
npm run format       # Format code with Prettier
```

### Component Development
All components follow modern React patterns:
- **Functional Components** with TypeScript
- **Custom Hooks** for state management
- **Compound Components** for complex UI patterns
- **Forward Refs** for accessibility
- **Proper Error Boundaries** for resilience

### State Management Guidelines
```typescript
// Use Zustand stores for global state
import { useAppointmentStore } from '@/lib/store/appointment-store';

// Use React hooks for local state
const [isOpen, setIsOpen] = useState(false);

// Use React Query for server state
const { data, isLoading } = useQuery(['appointments'], fetchAppointments);
```

## 📱 Mobile Features

### Progressive Web App
- **Offline Support** - Service worker caching for core functionality
- **Push Notifications** - Appointment reminders and alerts
- **Background Sync** - Sync data when connection is restored
- **Add to Home Screen** - Native app-like installation

### Touch Optimizations
- **Minimum Touch Targets** - 44px for accessibility compliance
- **Gesture Support** - Swipe actions for common tasks
- **Haptic Feedback** - Vibration for interactive elements
- **Responsive Images** - Optimized loading for mobile networks

## 🏥 Dental Features

### Interactive Dental Chart
```typescript
<DentalChart
  patientId="patient_123"
  patientName="John Doe"
  editable={true}
  viewMode="adult" // or "pediatric"
  onToothSelect={handleToothSelection}
  onConditionAdd={handleConditionAdd}
/>
```

### Advanced Appointment Booking
```typescript
<AdvancedBooking
  services={availableServices}
  providers={availableProviders}
  onBookingComplete={handleBookingComplete}
  allowEmergencyBooking={true}
/>
```

### Patient Portal
```typescript
<PatientPortal
  patientId="patient_123"
  permissions={['viewRecords', 'bookAppointments']}
/>
```

## 🔒 Security & Compliance

### HIPAA Compliance Features
- **Data Encryption** - AES-256 for data at rest, TLS 1.3 for data in transit
- **Audit Logging** - Complete audit trails for all patient data access
- **Access Controls** - Role-based permissions with principle of least privilege
- **Session Management** - Secure session handling with automatic timeout
- **Data Backup** - Encrypted backups with geographic distribution

### Authentication & Authorization
```typescript
// Role-based access control
interface UserRole {
  id: string;
  name: 'admin' | 'dentist' | 'hygienist' | 'receptionist' | 'patient';
  permissions: string[];
}

// Secure API routes
export async function GET(request: NextRequest) {
  const user = await authenticateUser(request);
  if (!hasPermission(user, 'view_appointments')) {
    return new Response('Forbidden', { status: 403 });
  }
  // ... handle request
}
```

## 🧪 Testing

### Testing Strategy
- **Unit Tests** - Jest for component logic and utilities
- **Integration Tests** - Testing component interactions
- **E2E Tests** - Playwright for user workflows
- **Accessibility Tests** - Automated WCAG compliance checking

### Running Tests
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run accessibility tests
npm run test:a11y
```

## 📊 Performance

### Optimization Features
- **Code Splitting** - Automatic route-based code splitting
- **Image Optimization** - Next.js Image component with lazy loading
- **Bundle Analysis** - Webpack bundle analyzer integration
- **Service Worker** - Intelligent caching strategies
- **Performance Monitoring** - Core Web Vitals tracking

### Performance Metrics
- **First Contentful Paint** - < 1.5s
- **Largest Contentful Paint** - < 2.5s
- **Cumulative Layout Shift** - < 0.1
- **First Input Delay** - < 100ms

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel --prod

# Or use the GitHub integration
# Push to main branch triggers automatic deployment
```

### Docker
```bash
# Build Docker image
docker build -t dentalflow .

# Run container
docker run -p 3000:3000 dentalflow
```

### Environment-specific Configuration
```bash
# Production
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Staging
NODE_ENV=staging
NEXT_PUBLIC_APP_URL=https://staging.yourdomain.com
```

## 📈 Analytics & Monitoring

### Built-in Analytics
- **User Behavior** - Page views, user flows, feature usage
- **Performance Metrics** - Core Web Vitals, loading times
- **Error Tracking** - Automatic error reporting and stack traces
- **Business Metrics** - Appointment conversions, revenue tracking

### Integration Ready
- **Google Analytics 4** - Enhanced ecommerce tracking
- **Sentry** - Error monitoring and performance tracking
- **PostHog** - Product analytics and feature flags
- **Mixpanel** - Event tracking and user segmentation

## 🔄 API Integration

### RESTful API Design
```typescript
// Appointments API
GET    /api/appointments           # List appointments
POST   /api/appointments           # Create appointment
GET    /api/appointments/:id       # Get appointment
PUT    /api/appointments/:id       # Update appointment
DELETE /api/appointments/:id       # Cancel appointment

// Patients API
GET    /api/patients               # List patients
POST   /api/patients               # Create patient
GET    /api/patients/:id           # Get patient
PUT    /api/patients/:id           # Update patient
```

### External Integrations
```typescript
// Cal.com integration
import { CalcomClient } from '@/lib/calcom/client';

const calcom = new CalcomClient({
  apiKey: process.env.CALCOM_API_KEY,
  webhookSecret: process.env.CALCOM_WEBHOOK_SECRET
});

// Supabase integration
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
```

## 📚 Documentation

### Component Documentation
Each component includes comprehensive JSDoc comments:
```typescript
/**
 * Advanced appointment booking component with multi-step form
 *
 * @param services - Available dental services
 * @param providers - Available dental providers
 * @param onBookingComplete - Callback when booking is completed
 * @param allowEmergencyBooking - Whether to allow emergency slots
 *
 * @example
 * <AdvancedBooking
 *   services={services}
 *   providers={providers}
 *   onBookingComplete={handleComplete}
 *   allowEmergencyBooking={true}
 * />
 */
```

### API Documentation
Auto-generated API docs available at `/api-docs` (in development mode)

## 🤝 Contributing

### Development Guidelines
1. Follow the established code style (Prettier + ESLint)
2. Write tests for new features
3. Update documentation for API changes
4. Use conventional commits for clear history
5. Ensure accessibility compliance

### Pull Request Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- **Open Source Dental Management Systems** - OpenMolar, Open Dental, Clear.Dental
- **Design Inspiration** - Modern healthcare applications and design systems
- **Technology Stack** - Next.js, Supabase, Radix UI, and the amazing open source community
- **Healthcare Standards** - HL7 FHIR, HIPAA compliance guidelines

---

**Built with ❤️ for modern dental practices**

For support, email support@dentalflow.app or create an issue on GitHub.