# ISPURE - Air Quality Monitoring Frontend

This is the frontend application for the IoT-Based Air Quality Monitoring System (ISPURE), built with [Next.js](https://nextjs.org).

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your system:

- **Node.js** (version 18.x or newer)
- **npm** or **yarn** (package manager)

### 1. Install Dependencies

```bash
npm install
```

Or if you're using yarn:

```bash
yarn install
```

### 2. Configure Environment Variables

1. Copy the `.env.example` file to create a `.env.local` file:

```bash
cp .env.example .env.local
```

2. Edit the `.env.local` file and configure the API base URL:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

**Environment Variable Options:**

- **For local development**: `http://localhost:8000` (or your backend port)
- **For production**: `https://your-app.vercel.app` (your production API URL)

> **Note:** The `NEXT_PUBLIC_` prefix is required for Next.js to expose the variable to the browser.

### 3. Run the Development Server

```bash
npm run dev
```

Or with yarn:

```bash
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

The page will auto-update as you edit the files.

## 📦 Available Scripts

- `npm run dev` - Runs the development server with Turbopack
- `npm run build` - Builds the application for production
- `npm start` - Starts the production server
- `npm run lint` - Runs ESLint to check code quality

## 🏗️ Build for Production

To create an optimized production build:

```bash
npm run build
```

Then start the production server:

```bash
npm start
```

## 📁 Project Structure

```
frontend/
├── src/
│   └── app/
│       ├── page.tsx              # Login page
│       ├── dashboard/
│       │   └── page.tsx          # Main dashboard
│       └── detailISPU/
│           └── page.tsx          # Pollutant detail page
├── public/                       # Static assets (images, icons)
├── .env.example                  # Environment variables template
├── .env.local                    # Your local environment config (create this)
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── package.json                  # Project dependencies and scripts
```

## 🔧 Tech Stack

- **Framework**: Next.js 15.3.3
- **UI Library**: React 19
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Icons**: Lucide React, React Icons
- **Language**: TypeScript

## 🌐 Features

- Real-time air quality monitoring dashboard
- Interactive charts for historical data
- ISPU (Air Quality Index) calculation and visualization
- Responsive design for mobile and desktop
- User authentication

## 📚 Learn More

To learn more about Next.js and the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Recharts Documentation](https://recharts.org)

## 🚀 Deploy on Vercel

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new).

**Important:** Don't forget to set the environment variable `NEXT_PUBLIC_API_BASE_URL` in your Vercel project settings.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## ⚠️ Troubleshooting

### Port Already in Use

If port 3000 is already in use, you can specify a different port:

```bash
npm run dev -- -p 3001
```

### Environment Variables Not Working

Make sure:
1. Your `.env.local` file exists in the frontend root directory
2. Variable names start with `NEXT_PUBLIC_` prefix
3. You've restarted the development server after creating/modifying `.env.local`

### API Connection Issues

Verify that:
1. The backend server is running
2. The `NEXT_PUBLIC_API_BASE_URL` in `.env.local` matches your backend URL
3. CORS is properly configured on the backend

## 👥 Contributors

Developed by the DTETI UGM Capstone E_07 Project Team.
