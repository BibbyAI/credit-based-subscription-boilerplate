# MyApp - Next.js SaaS Starter

A modern, full-stack SaaS application built with Next.js 15, Supabase authentication, and a credit-based pricing system.

## ✨ Features

### 🔐 Authentication
- **Secure Login/Signup** with Supabase Auth
- **Protected Routes** - automatic redirects based on auth state
- **Smart Navigation** - auth-aware navbar that adapts to user state
- **Session Management** - middleware handles auth redirects seamlessly

### 💰 Pricing & Plans
- **Two-tier Pricing**: Free (100 credits) and Pro (100,000 credits)
- **Public Pricing Page** - accessible without authentication
- **Clean, Modern Design** - focused on credit differentiation
- **Call-to-Action Buttons** - direct signup integration

### 📊 Dashboard
- **User Account Information** - email, verification status, signup date
- **API Testing Buttons** - integrated test actions with toast notifications
- **Responsive Design** - works on all device sizes
- **Credit System Ready** - built for credit-based applications

### 🎨 UI/UX
- **Shadcn/ui Components** - modern, accessible component library
- **Tailwind CSS** - utility-first styling with dark mode support
- **Responsive Design** - mobile-first approach
- **Toast Notifications** - user feedback with Sonner

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Styling**: Tailwind CSS + Shadcn/ui
- **Language**: TypeScript
- **Package Manager**: pnpm
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone git@github.com:BibbyAI/credit-based-subscription-boilerplate.git
cd credit-based-subscription-boilerplate
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run the development server**
```bash
pnpm dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Routes

- `/` - Homepage with hero section and navigation
- `/pricing` - Public pricing page (Free vs Pro plans)
- `/login` - User authentication (login)
- `/signup` - User registration 
- `/dashboard` - Protected user dashboard
- `/error` - Error handling page

## 🔧 Project Structure

```
├── app/                    # Next.js app router
│   ├── dashboard/         # Protected dashboard pages
│   ├── login/            # Authentication pages
│   ├── signup/           
│   ├── pricing/          # Public pricing page
│   └── api/              # API routes
├── components/           # Reusable UI components
│   ├── ui/              # Shadcn/ui components
│   └── navbar.tsx       # Auth-aware navigation
├── utils/               # Utility functions
│   └── supabase/        # Supabase client & middleware
├── lib/                 # Library configurations
└── middleware.ts        # Route protection & redirects
```

## 🔒 Authentication Flow

1. **Unauthenticated users** can access:
   - Homepage (`/`)
   - Pricing page (`/pricing`)
   - Login page (`/login`)
   - Signup page (`/signup`)

2. **Authenticated users** are redirected:
   - From `/login` or `/signup` → `/dashboard`
   - From `/` → `/dashboard` (optional)

3. **Protected routes** require authentication:
   - `/dashboard` and all sub-routes

## 🎯 Key Components

### Navbar
- **Smart Authentication**: Shows different content for logged-in vs guest users
- **Pricing Access**: Always visible for all users
- **Dashboard Link**: Quick access for authenticated users

### Pricing Cards
- **Free Plan**: 100 credits/month, $0
- **Pro Plan**: 100,000 credits/month, $29
- **Simplified Design**: Focus on credit differentiation

### Dashboard
- **Account Info**: User details and verification status
- **API Testing**: Built-in buttons for testing API endpoints
- **Extensible**: Ready for credit usage tracking

## 🔄 API Endpoints

- `/api/test1` - Generate Report API
- `/api/test2` - Send Notification API

## 📋 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the React framework
- [Supabase](https://supabase.com/) for authentication and database
- [Shadcn/ui](https://ui.shadcn.com/) for the component library
- [Tailwind CSS](https://tailwindcss.com/) for styling
