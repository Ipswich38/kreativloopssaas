# Dental SaaS - Practice Management System

A comprehensive dental practice management solution built with Next.js, featuring offline-first capabilities and modern UI design.

## Features

- **🏥 Multi-tenant Architecture**: Scalable solution for multiple dental clinics
- **📱 Mobile-First Design**: Responsive design optimized for mobile devices
- **🔄 Offline-First**: Works offline with SQLite and syncs to Supabase when online
- **👨‍⚕️ Complete Practice Management**:
  - Patient records management
  - Appointment scheduling
  - Financial tracking (payments, expenses, payroll)
  - Service catalog with rates
  - Inventory management
  - Staff management with commission tracking

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**:
  - Online: Supabase (PostgreSQL)
  - Offline: SQLite with sql.js
- **Authentication**: Supabase Auth
- **State Management**: React Query

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for production deployment)

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd dental-saas
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### POC Login Credentials

For the Happy Teeth Dental Clinic proof of concept:
- **Email**: sshappyteeth@gmail.com
- **Password**: happyteeth123

## Project Structure

```
src/
├── app/                    # Next.js 14 app directory
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── appointments/      # Appointment management
│   ├── patients/          # Patient records
│   ├── services/          # Service catalog
│   ├── financial/         # Financial management
│   └── ...
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── layout/           # Layout components
│   └── dashboard/        # Dashboard-specific components
├── lib/                  # Utility libraries
│   ├── database/         # Offline database logic
│   ├── supabase/         # Supabase client
│   └── utils.ts          # General utilities
└── types/               # TypeScript type definitions
```

## Key Features

### 🎨 Design System

- **3-Color Theme**: Primary (blue), Secondary (gray), Accent (purple)
- **Capsule CTA Buttons**: Rounded buttons for better UX
- **Bento Box Style**: Card-based layouts with rounded corners
- **Line Drawing Icons**: Clean, minimalist Lucide icons
- **Small but Readable Text**: Optimized typography for mobile

### 📊 Financial Management

Based on real CSV data analysis:
- Income tracking with payment methods (Cash, GCash, Maya, Card, Bank Transfer)
- Expense categorization (Staff salaries, supplies, utilities, etc.)
- Commission calculations for dentists and staff
- Revenue reporting and analytics

### 🦷 Dental-Specific Features

- Service catalog with procedures like:
  - Oral prophylaxis, restorations, crowns
  - Dentures, veneers, orthodontics
  - Teeth whitening, fluoride treatments
- Dentist rate management with different commission structures
- Patient dental history tracking

### 🔒 Security & Privacy

- Row Level Security (RLS) policies in Supabase
- Secure password hashing
- Multi-tenant data isolation
- GDPR-compliant data handling

## Database Schema

The application uses a comprehensive schema designed for dental practices:

- **Multi-tenant structure** with clinic isolation
- **Patient management** with dental history
- **Appointment scheduling** with service tracking
- **Financial transactions** with payment methods
- **Staff management** with commission tracking
- **Inventory management** for dental supplies

## Deployment

### Supabase Setup

1. Create a new Supabase project
2. Run the SQL schema from `supabase/schema.sql`
3. Configure environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Production Deployment

The app can be deployed to any Next.js-compatible platform:
- Vercel (recommended)
- Netlify
- Railway
- AWS Amplify

## Contributing

This is a proof of concept for dental practice management. For production use, consider:

1. Adding comprehensive error handling
2. Implementing proper form validation
3. Adding unit and integration tests
4. Setting up monitoring and analytics
5. Implementing proper backup strategies

## License

This project is developed as a proof of concept for dental practice management systems.