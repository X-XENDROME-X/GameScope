<h1 align="center">GameScope 🎮</h1>

<p align="center">
  <img src="public/logo.png" alt="GameScope Logo" width="300"/>
</p>

GameScope is a comprehensive full-stack gaming discovery platform that transforms how gamers explore, discover, and curate their gaming experiences. Built with cutting-edge web technologies and modern architecture patterns, GameScope provides powerful game search capabilities, personal collection management, detailed game information, and administrative tools for the ultimate gaming discovery experience.

---

## 🚀 Live Demo

**Coming Soon**: GameScope will be deployed on Vercel with enterprise-grade infrastructure for optimal performance and scalability.

---

## ✨ Features

### 🎯 Game Discovery & Search
- **Real-time Search**: Lightning-fast game search with debounced input and intelligent query processing
- **Advanced Filtering**: Filter games by platforms, genres, and custom ordering options
- **Dual View Modes**: Toggle between responsive grid and detailed list layouts
- **Search Enhancement**: Live search statistics and result counts
- **Trending Games**: Discover popular and highly-rated games when no search query is active

### 🔍 Detailed Game Information
- **Comprehensive Game Details**: In-depth information including descriptions, ratings, release dates, and ESRB ratings
- **Visual Media Gallery**: High-quality screenshots with modal viewing and navigation
- **Platform Compatibility**: Multi-platform availability with dedicated platform icons
- **Developer & Publisher Info**: Complete development team and publisher details
- **Game Trailers**: YouTube integration for game trailers and gameplay videos
- **Metacritic Integration**: Professional game ratings and review scores

### 👥 User Experience & Authentication
- **Personal Favorites System**: Save and manage favorite games with real-time synchronization
- **Stats Card Export**: Generate beautiful, shareable cards of gaming statistics and favorites collection
- **Secure Authentication**: Google OAuth integration with NextAuth.js
- **Profile Management**: User profiles with statistics, admin controls, and account deletion
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Interactive Notifications**: Real-time toast notifications for user actions

### 🛠️ Administrative Features
- **Admin Dashboard**: Comprehensive admin panel with usage analytics and user management
- **User Management**: View active users, registration dates, and account statistics
- **Usage Analytics**: API usage tracking, database metrics, and system performance monitoring
- **Security Controls**: Admin-only routes with email-based access control

---

## 🛠️ Technologies Used

### Frontend Framework & Libraries
- **Next.js 15**: React framework with App Router, Server Components, and automatic optimization
- **React 19**: Latest React features with concurrent rendering and enhanced hooks
- **TypeScript**: Strongly typed development for enhanced code quality and maintainability
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Framer Motion**: Advanced animation library for smooth transitions and micro-interactions
- **TanStack React Query**: Powerful data fetching, caching, and server state synchronization
- **Radix UI**: Accessible, unstyled UI components for dialogs, selects, and dropdowns

### Backend & Database
- **Next.js API Routes**: Server-side API endpoints with built-in middleware integration
- **PostgreSQL**: Robust relational database for data persistence and complex queries
- **Drizzle ORM**: Type-safe database toolkit with migrations and schema management
- **NextAuth.js**: Complete authentication solution with Google OAuth provider
- **Vercel Postgres**: Cloud-hosted PostgreSQL database with automatic scaling

### State Management & Data Flow
- **Zustand**: Lightweight state management for client-side application state
- **React Query**: Server state management with intelligent caching and background updates
- **React Context API**: Navigation state and application context management

### UI/UX & Styling
- **Lucide React**: Beautiful, customizable icons with consistent design language
- **React Icons**: Comprehensive icon library with multiple icon families
- **React Loading Skeleton**: Elegant skeleton loading states for enhanced user experience
- **Class Variance Authority**: Utility for creating consistent component APIs
- **React Hot Toast & Sonner**: Beautiful toast notification systems
- **html2canvas**: Client-side screenshot generation for stats card export functionality

### Development & Deployment
- **ESLint**: Code linting with custom rules and Next.js best practices
- **Prettier**: Automatic code formatting with Tailwind CSS plugin
- **Husky**: Git hooks for pre-commit quality checks and automated workflows
- **TypeScript Compiler**: Advanced type checking with strict mode configuration
- **Drizzle Kit**: Database migrations, introspection, and visual studio interface
- **Vercel**: Modern deployment platform with edge functions, automatic HTTPS, and global CDN

### External APIs & Services
- **RAWG Video Games Database**: Comprehensive game information, screenshots, and metadata
- **YouTube Data API v3**: Game trailers, gameplay videos, and promotional content
- **Google OAuth 2.0**: Secure user authentication and profile management

### Performance & Security
- **Next.js Image Optimization**: Automatic image optimization, lazy loading, and WebP conversion
- **Image Proxy System**: CORS-safe image processing for reliable screenshot generation and export
- **API Security Middleware**: Request validation, rate limiting, and error handling
- **Database Connection Pooling**: Efficient database connections with automatic scaling
- **Caching Strategies**: Multi-level caching with stale-while-revalidate patterns
- **SEO Optimization**: Server-side rendering, meta tags, and structured data

---

## 🎯 Usage

### For Gamers
- **Discover Games**: Use the powerful search functionality to find games by name, genre, or platform
- **Explore Details**: Click on any game to view comprehensive information, screenshots, and trailers
- **Manage Collection**: Save favorite games to your personal collection for easy access
- **Browse Favorites**: Visit your dedicated favorites page to manage and organize your saved games
- **Export Gaming Stats**: Generate beautiful, high-resolution cards showcasing your gaming statistics to share with friends
- **Profile Management**: Access your profile to view statistics and manage account settings

### For Administrators
- **Admin Dashboard**: Access comprehensive analytics including user statistics and API usage metrics
- **User Management**: Monitor active users, registration trends, and account activity
- **System Monitoring**: Track database performance, API response times, and system health
- **Content Moderation**: Manage user accounts and oversee platform usage

---

## 🏗️ Key Features In-Depth

### Advanced Search System
GameScope's search engine provides instant results with:
- Debounced search input to optimize API requests and improve performance
- Multi-strategy search algorithms for comprehensive game discovery
- Advanced filtering by platforms, genres, and custom ordering options
- Real-time search statistics and result count tracking
- Intelligent fallback to trending games when no query is provided

### Personal Collection Management
Users can curate their gaming library through:
- One-click favorite/unfavorite functionality with real-time UI updates
- Persistent favorites storage with user authentication integration
- Advanced collection viewing with grid/list layouts and sorting options
- Search within favorites with highlighting and filtering capabilities
- **Professional Stats Export**: Generate shareable cards with gaming statistics, top genres, latest additions, and complete favorites collection in a consistent 20-slot layout
- Real-time notifications for collection updates and changes

### Comprehensive Game Information
Each game displays detailed information including:
- High-resolution screenshots with modal viewing and navigation
- Platform compatibility with dedicated icons and requirements
- Developer and publisher information with release history
- Professional ratings including Metacritic scores and ESRB ratings
- YouTube trailer integration for gameplay videos and reviews

### Admin Control Panel
Administrative users have access to:
- Real-time user activity monitoring with detailed session tracking
- API usage analytics with request patterns and performance metrics
- Database health monitoring and storage optimization insights
- User management tools with account status and registration analytics

### Gaming Stats Export System
GameScope's innovative stats export feature allows users to:
- **Professional Card Generation**: Create high-resolution, shareable cards showcasing gaming preferences and collection
- **Consistent Layout**: Fixed 20-slot design ensures perfect formatting regardless of collection size (5/20 or 20/20 favorites)
- **Comprehensive Data**: Includes favorite count, genre diversity, average ratings, top genres, and latest additions
- **Visual Excellence**: Features game thumbnails, colorful genre indicators, and professional typography
- **Social Sharing**: Download PNG format optimized for social media platforms and gaming communities
- **CORS-Safe Image Processing**: Advanced image proxy system ensures reliable thumbnail loading in exports

---

## 🙏 Attributions

GameScope leverages several third-party services and APIs to provide comprehensive gaming information:

- **Game Database**: Powered by RAWG Video Games Database API for extensive game information, metadata, screenshots, and detailed game specifications
- **Video Content**: YouTube Data API v3 integration for game trailers, gameplay videos, reviews, and promotional content  
- **Authentication**: NextAuth.js with Google OAuth 2.0 for secure user authentication and session management
- **Database**: PostgreSQL via Vercel Postgres for reliable data persistence, user management, and favorites storage
- **UI Components**: Radix UI for accessible, unstyled component primitives including dialogs, dropdowns, and form elements
- **Icons & Graphics**: Lucide React and React Icons for consistent iconography and visual elements throughout the application

---
