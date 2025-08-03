# ProdScale - Mobile Productivity App

## Overview

ProdScale is a premium mobile productivity app built with a black-and-white ultra-minimal interface. The app helps users track daily activities, calculate productivity scores, and maintain motivation through an AI-powered scoring system and animated knight mascot. The application follows modern full-stack architecture with TypeScript, React, Express, and PostgreSQL.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: TailwindCSS with shadcn/ui component library
- **Animations**: Framer Motion for smooth transitions and interactions
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API design
- **Session Management**: Express sessions with PostgreSQL storage
- **Database ORM**: Drizzle ORM with Neon PostgreSQL

### Data Storage Solutions
- **Primary Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM for type-safe database operations
- **Migrations**: Drizzle Kit for schema management
- **Connection Pooling**: Neon serverless connection pooling

## Key Components

### Database Schema
- **Users**: User authentication and profile data
- **Activities**: Customizable user activities (Gym, Reading, Meditation, etc.)
- **Daily Entries**: Daily productivity tracking with scores and reflections
- **Activity Completions**: Tracking completion status and duration for each activity
- **Streaks**: User streak tracking for motivation

### Frontend Components
- **Stickman Component**: Animated knight mascot that changes based on productivity score
- **Progress Circle**: Circular progress indicator for daily scores
- **Activity Item**: Interactive activity tracking with duration input
- **Modern Calendar**: Clean monthly view with streak tracking
- **Social Sharing**: Export functionality for social media platforms
- **Pro Upgrade**: Premium features page with pricing tiers

### Scoring Algorithm
The productivity score (0-10) is calculated based on:
- Activity completion ratio (+1-3 points)
- All activities completed (+3 points)
- Daily reflection added (+2 points)
- Streak maintenance (+2 points for 3+ day streaks)

Streak System:
- Streaks count consecutive days with scores of 6.0 or above
- Scores below 6.0 reset the current streak to 0
- Longest streak is tracked separately

## Data Flow

1. **User Authentication**: Demo user system (ready for full auth implementation)
2. **Daily Entry Creation**: Automatic creation of daily entries on first visit
3. **Activity Tracking**: Real-time updates to activity completion status
4. **Score Calculation**: Dynamic calculation based on completions and reflections
5. **Streak Management**: Automatic streak tracking and updates
6. **Monthly Reporting**: Aggregated data presentation with heatmap visualization

## External Dependencies

### UI/UX Libraries
- **Radix UI**: Headless component primitives for accessibility
- **Lucide React**: Stroke-based icon library
- **Class Variance Authority**: Type-safe styling variants
- **Date-fns**: Date manipulation utilities

### Development Tools
- **ESBuild**: Fast JavaScript bundling for production
- **TSX**: TypeScript execution for development
- **PostCSS**: CSS processing with Autoprefixer

### Database & Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **WebSocket Support**: Real-time connection capabilities
- **Connect PG Simple**: PostgreSQL session store

## Deployment Strategy

### Development Environment
- **Hot Module Replacement**: Vite HMR for instant updates
- **Error Overlay**: Runtime error modal for debugging
- **TypeScript Checking**: Strict type checking enabled
- **Development Server**: Express with Vite middleware integration

### Production Build
- **Client Build**: Vite optimized bundle with tree-shaking
- **Server Build**: ESBuild compilation for Node.js runtime
- **Static Assets**: Optimized and cached static file serving
- **Environment Variables**: Secure configuration management

### Architecture Decisions

**Problem**: Need for real-time UI updates when activity status changes
**Solution**: TanStack Query with optimistic updates and automatic cache invalidation
**Pros**: Instant UI feedback, automatic background synchronization, built-in error handling
**Cons**: Slightly more complex state management

**Problem**: Mobile-first design with desktop compatibility
**Solution**: TailwindCSS with mobile-first responsive design and max-width container
**Pros**: Consistent mobile experience, easy responsive adjustments
**Cons**: Limited desktop real estate usage

**Problem**: Database schema flexibility for user customization
**Solution**: Separate activities table allowing user-specific activity customization
**Pros**: Flexible activity management, easy to extend
**Cons**: Additional database complexity

**Problem**: Scoring algorithm transparency and motivation
**Solution**: Clear scoring logic with visual feedback through stickman animations
**Pros**: User understanding of scoring, gamification elements
**Cons**: Fixed scoring algorithm may not suit all users