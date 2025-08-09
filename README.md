# BotFlow - AI Chatbot Platform

A comprehensive AI assistant platform designed for service providers who train and deploy chatbots for small business clients. Each bot is completely self-contained with its own training data and platform integrations.

## Features

### ✨ Core Features
- **Multi-Bot Management**: Create and manage multiple AI bots independently
- **Real File Processing**: Upload and extract content from PDFs, documents, and text files
- **AI-Powered Chat**: Integrated with OpenAI GPT-4o for natural language processing
- **Platform Integrations**: Support for WhatsApp, Telegram, Facebook Messenger, and Instagram
- **Business Service Integrations**: Payment processing and scheduling system support

### 🔧 Technical Features
- **Modern React Frontend**: Built with React 18, TypeScript, and shadcn/ui components
- **Express.js Backend**: RESTful API with comprehensive error handling
- **File Storage**: Google Cloud Storage integration with ACL-based permissions
- **Real-time Updates**: TanStack Query for efficient data synchronization
- **Type Safety**: Full TypeScript coverage across frontend and backend

## Quick Start

### Prerequisites
- Node.js 18+ 
- OpenAI API key
- Google Cloud Storage (via Replit integration)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd botflow
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Required for AI functionality
OPENAI_API_KEY=your_openai_api_key

# Object storage (automatically configured on Replit)
DEFAULT_OBJECT_STORAGE_BUCKET_ID=your_bucket_id
PRIVATE_OBJECT_DIR=/your_bucket/private
PUBLIC_OBJECT_SEARCH_PATHS=/your_bucket/public
```

4. **Start the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
│   └── index.html
├── server/                # Express.js backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route handlers
│   ├── storage.ts        # Data storage interface
│   ├── openai.ts         # AI integration
│   ├── fileProcessor.ts  # File content extraction
│   ├── objectStorage.ts  # Cloud storage service
│   └── objectAcl.ts      # Access control logic
├── shared/
│   └── schema.ts         # Shared type definitions
└── components.json       # shadcn/ui configuration
```

## API Endpoints

### Bots Management
- `GET /api/bots` - List all bots
- `POST /api/bots` - Create a new bot
- `GET /api/bots/:id` - Get bot details
- `PUT /api/bots/:id` - Update bot
- `DELETE /api/bots/:id` - Delete bot

### Training Data
- `GET /api/bots/:id/training-data` - List bot's training files
- `POST /api/bots/:id/training-data` - Upload training data
- `DELETE /api/training-data/:id` - Delete training file
- `POST /api/training-data/:id/reprocess` - Reprocess file content

### Chat System
- `POST /api/bots/:id/chat` - Send message to bot
- `GET /api/bots/:id/conversations` - Get chat history

### Platform Integrations
- `GET /api/bots/:id/integrations` - List bot integrations
- `POST /api/bots/:id/integrations` - Add integration
- `PUT /api/integrations/:id` - Update integration status

### File Upload
- `POST /api/objects/upload` - Get presigned upload URL
- `GET /objects/:path` - Download private files
- `GET /public-objects/:path` - Serve public assets

## Key Components

### Frontend Components

#### Bot Management
- **Dashboard**: Overview of all bots with stats and quick actions
- **BotDetail**: Comprehensive bot configuration and management
- **BotChat**: Real-time chat interface with message history

#### File Upload System
- **ObjectUploader**: Modern file upload with drag-and-drop support
- Uses Uppy.js for enhanced user experience
- Automatic file processing and content extraction

### Backend Services

#### File Processing
- **Real Content Extraction**: Processes uploaded files to extract actual text content
- **PDF Support**: Extracts readable text from PDF documents
- **Multiple Format Support**: Handles various document types and text files

#### AI Integration
- **OpenAI GPT-4o**: Latest model for natural language processing
- **Dynamic Context**: Bot responses based on uploaded training data
- **Conversation Memory**: Maintains chat history and context

#### Object Storage
- **Google Cloud Storage**: Secure file storage with ACL permissions
- **Presigned URLs**: Direct client-to-cloud uploads
- **Access Control**: Fine-grained permissions for file access

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

### Database Schema
The application uses Drizzle ORM with the following main entities:
- **Bots**: Core bot configuration and metadata
- **TrainingData**: Uploaded files and extracted content
- **Integrations**: Platform connections and settings
- **Conversations**: Chat history and message storage

## Deployment

### Replit Deployment (Recommended)
1. The project is optimized for Replit deployment
2. Environment variables are automatically configured
3. Use the "Deploy" button in your Replit workspace

### Manual Deployment
1. Build the project: `npm run build`
2. Configure environment variables
3. Start the server: `npm start`

## Configuration

### AI Settings
- Model: GPT-4o (latest OpenAI model)
- Max tokens: Configurable per bot
- Temperature: Adjustable response creativity

### File Upload Limits
- Max file size: 10MB (configurable)
- Supported formats: PDF, TXT, DOC, MD, CSV, JSON
- Processing: Automatic content extraction

### Integration Settings
Each bot can be configured with:
- **WhatsApp Business API**: For WhatsApp messaging
- **Telegram Bot API**: For Telegram integration
- **Facebook Messenger**: For Facebook page messaging
- **Instagram Direct**: For Instagram business messaging

## Security

### File Access Control
- Private files require proper authentication
- Public assets served with appropriate caching
- ACL-based permissions for shared content

### API Security
- Request validation using Zod schemas
- Error handling with structured responses
- Rate limiting and request logging

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with proper TypeScript types
4. Test your changes thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the documentation in this README
- Review the code comments and type definitions
- Open an issue for bugs or feature requests

---

Built with ❤️ using React, TypeScript, Express.js, and OpenAI GPT-4o