# BotFlow - AI Chatbot Platform

## Overview

BotFlow is a simplified AI chatbot management platform designed for service providers who train and deploy bots for small business clients. Each bot is completely self-contained with its own training data and platform integrations, making it easy to manage multiple client deployments independently.

The platform features a React-based frontend with a modern UI built using shadcn/ui components, an Express.js backend API, and integrates with OpenAI's GPT-4o for natural language processing. Key features include per-bot training data management, isolated platform integrations (WhatsApp, Telegram, Messenger, Instagram), and business service integrations (payment processing, scheduling).

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### August 9, 2025
- **Fixed Critical File Processing Bug**: Resolved issue where training data was storing placeholder content instead of actual file content
- **Implemented Real Content Extraction**: Created robust file processor that extracts actual text from PDFs and documents
- **Added Reprocessing Capability**: Built endpoint to reprocess existing files with real content extraction
- **Fixed Frontend Syntax Errors**: Resolved corrupted import statements in bot-detail.tsx
- **Added GitHub Export Documentation**: Created comprehensive README.md and LICENSE files for repository export
- **File Content Verification**: Training data now properly extracts and stores real file content, enabling bots to access uploaded instructions including secret codes

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Design**: RESTful API with JSON responses
- **File Structure**: Modular route handlers with separate service layers
- **Error Handling**: Centralized error middleware with structured error responses
- **Request Logging**: Custom middleware for API request/response logging

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon Database serverless PostgreSQL
- **In-Memory Storage**: Fallback MemStorage implementation for development

### Authentication and Authorization
- **Current State**: Basic user ID system (placeholder for production auth)
- **Object Access Control**: Custom ACL system for file permissions with group-based access control
- **Future Implementation**: Designed to support role-based access control

### AI Integration
- **AI Provider**: OpenAI GPT-4o for natural language processing
- **Chat System**: Real-time chat interface with message history
- **Training Data**: File upload system for bot training with processing status tracking
- **Context Management**: Dynamic system prompts based on bot configuration and training data

### File Storage and Management
- **Object Storage**: Google Cloud Storage integration
- **File Upload**: Uppy.js for modern file upload experience with drag-and-drop support
- **Access Control**: Custom ACL system with metadata-based permissions
- **File Types**: Support for various training data formats (documents, text files)

### Platform Integrations
- **Messaging Platforms**: WhatsApp, Telegram, Facebook Messenger, Instagram Direct
- **Business Services**: Payment processing (Stripe/PayPal), Scheduling (Calendly/Google Calendar)
- **Bot-Specific Configuration**: Each bot maintains its own isolated integration settings
- **Status Management**: Per-bot enable/disable with connection tracking

### Development and Deployment
- **Development**: Hot module replacement with Vite
- **Production Build**: Separate client and server builds with esbuild
- **Environment**: Replit-optimized with sidecar integration for cloud services
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **GitHub Export Ready**: Comprehensive documentation and proper project structure for repository export

## External Dependencies

### Core Infrastructure
- **Database**: Neon Database (PostgreSQL serverless)
- **Object Storage**: Google Cloud Storage via Replit sidecar
- **AI Services**: OpenAI API (GPT-4o model)

### Frontend Libraries
- **React Ecosystem**: React 18, React DOM, TanStack Query for state management
- **UI Components**: Radix UI primitives, Lucide React icons
- **Form Handling**: React Hook Form with Zod validation
- **File Upload**: Uppy ecosystem (core, dashboard, AWS S3, React integration)
- **Routing**: Wouter for lightweight client-side routing

### Backend Dependencies
- **Web Framework**: Express.js with TypeScript support
- **Database**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod for schema validation
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Development Tools
- **Build System**: Vite with React plugin and Replit integrations
- **Styling**: Tailwind CSS with PostCSS and Autoprefixer
- **Code Quality**: TypeScript with strict configuration
- **Development Environment**: Replit-specific plugins for cartographer and error overlay