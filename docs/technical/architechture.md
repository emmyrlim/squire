# Squire - Technical Specification

## Architecture Overview

### Tech Stack

- **Frontend**: Remix (React-based full-stack framework)
- **Backend**: Remix serverless functions
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel
- **AI Integration**: OpenAI API (GPT-4)
- **Styling**: Tailwind CSS

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel CDN    │    │  Remix App      │    │   Supabase      │
│   (Static)      │◄───┤  (Serverless)   │◄───┤   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   OpenAI API    │
                       │   (AI Features) │
                       └─────────────────┘
```

## Data Architecture

### Database Design Principles

- **Normalization**: 3NF to minimize redundancy
- **Indexing**: Strategic indexes on search fields
- **Relationships**: Foreign keys with cascading deletes
- **Audit Trail**: Created/updated timestamps on all entities

### Key Relationships

- Users ↔ Campaigns (many-to-many)
- Campaigns → All content entities (one-to-many)
- Cross-references between content entities (many-to-many)

## API Design

### RESTful Endpoints Structure

```
/api/campaigns
├── GET    / (list user's campaigns)
├── POST   / (create campaign)
├── GET    /:id (get campaign details)
├── PUT    /:id (update campaign)
├── DELETE /:id (delete campaign)
└── POST   /:id/join (join campaign)

/api/campaigns/:campaignId/sessions
├── GET    / (list sessions)
├── POST   / (create session)
├── GET    /:id (get session)
├── PUT    /:id (update session)
└── POST   /:id/ai-enhance (AI enhance summary)

/api/campaigns/:campaignId/locations
├── GET    / (list with search/filter)
├── POST   / (create location)
├── GET    /:id (get location)
├── PUT    /:id (update location)
└── DELETE /:id (delete location)

/api/campaigns/:campaignId/npcs
├── GET    / (list with search/filter)
├── POST   / (create NPC)
├── GET    /:id (get NPC)
├── PUT    /:id (update NPC)
└── DELETE /:id (delete NPC)

/api/campaigns/:campaignId/items
├── GET    / (list party inventory)
├── POST   / (add item)
├── PUT    /:id (update item)
└── DELETE /:id (remove item)

/api/campaigns/:campaignId/quests
├── GET    / (list with filters)
├── POST   / (create quest)
├── GET    /:id (get quest)
├── PUT    /:id (update quest)
└── PATCH  /:id/complete (mark complete)

/api/campaigns/:campaignId/monsters
├── GET    / (list bestiary)
├── POST   / (add monster)
├── GET    /:id (get monster)
├── PUT    /:id (update monster)
└── DELETE /:id (delete monster)

/api/ai
├── POST   /enhance-summary (enhance session summary)
├── POST   /suggest-entities (suggest NPCs/items/etc)
└── POST   /generate-links (generate cross-references)
```

### Authentication Flow

1. User signs up/logs in via Supabase Auth
2. JWT token stored in httpOnly cookie
3. Middleware validates token on protected routes
4. User context passed to all API endpoints

## Frontend Architecture

### Route Structure

```
app/
├── routes/
│   ├── _index.tsx (landing page)
│   ├── login.tsx
│   ├── campaigns/
│   │   ├── _index.tsx (campaign selection)
│   │   ├── new.tsx (create campaign)
│   │   └── $campaignId/
│   │       ├── _layout.tsx (campaign navigation)
│   │       ├── _index.tsx (dashboard)
│   │       ├── story/
│   │       │   ├── _index.tsx (session list)
│   │       │   ├── new.tsx (new session)
│   │       │   └── $sessionId.tsx (session detail)
│   │       ├── locations/
│   │       │   ├── _index.tsx (locations list)
│   │       │   ├── new.tsx (new location)
│   │       │   └── $locationId.tsx (location detail)
│   │       ├── npcs/
│   │       ├── inventory/
│   │       ├── quests/
│   │       └── bestiary/
```

### Component Architecture

- **Atomic Design**: Atoms → Molecules → Organisms → Templates
- **Shared Components**: Search, filters, forms, modals
- **Route Components**: Page-specific components
- **AI Components**: Enhancement buttons, suggestion panels

### State Management

- **Server State**: Remix loaders and actions
- **Client State**: React hooks for UI state
- **Form State**: Remix forms with validation
- **Real-time Updates**: Supabase subscriptions

## Performance Optimizations

### Frontend

- **Code Splitting**: Dynamic imports for heavy components
- **Image Optimization**: Next.js Image component
- **Caching**: Browser cache for static assets
- **Lazy Loading**: Intersection Observer for lists

### Backend

- **Database**: Connection pooling, query optimization
- **API**: Response caching for read-heavy endpoints
- **AI**: Request debouncing, result caching

### Database Optimizations

```sql
-- Key indexes for performance
CREATE INDEX idx_campaigns_users ON campaign_users(user_id);
CREATE INDEX idx_sessions_campaign ON sessions(campaign_id, session_number);
CREATE INDEX idx_locations_search ON locations USING gin(to_tsvector('english', name || ' ' || description));
CREATE INDEX idx_npcs_search ON npcs USING gin(to_tsvector('english', name || ' ' || description));
```

## AI Integration Strategy

### OpenAI API Usage

- **Model**: GPT-4 Turbo for quality
- **Fallback**: GPT-3.5 Turbo for cost optimization
- **Rate Limiting**: User-based limits
- **Error Handling**: Graceful degradation

### AI Features Implementation

1. **Session Enhancement**: Transform raw notes into narrative
2. **Entity Suggestion**: Parse sessions for mentions
3. **Cross-Linking**: Identify entity relationships
4. **Quest Summarization**: Generate quest progress summaries

### Prompt Engineering

```javascript
const SESSION_ENHANCEMENT_PROMPT = `
Transform this D&D session summary into an engaging narrative:
- Use fantasy language and tone
- Maintain chronological order
- Highlight key events and character moments
- Suggest format: "In this session, the party..."

Raw summary: {userInput}
`;
```

## Security Considerations

### Authentication & Authorization

- **Row Level Security**: Supabase RLS policies
- **API Protection**: JWT validation middleware
- **Input Validation**: Zod schemas for all inputs
- **XSS Prevention**: Content sanitization

### Data Protection

- **Encryption**: TLS in transit, encrypted at rest
- **Backup**: Automated Supabase backups
- **Privacy**: Campaign data isolation
- **GDPR**: User data deletion capabilities

## Deployment & Infrastructure

### Vercel Configuration

```javascript
// vercel.json
{
  "functions": {
    "app/entry.server.tsx": {
      "maxDuration": 10
    }
  },
  "env": {
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_ANON_KEY": "@supabase-anon-key",
    "OPENAI_API_KEY": "@openai-api-key"
  }
}
```

### Environment Management

- **Development**: Local Supabase + local Remix
- **Staging**: Supabase staging + Vercel preview
- **Production**: Supabase production + Vercel production

## Monitoring & Analytics

### Application Monitoring

- **Vercel Analytics**: Performance metrics
- **Supabase Metrics**: Database performance
- **Error Tracking**: Built-in Remix error boundaries

### Business Metrics

- **Usage**: Campaign creation, entity additions
- **Performance**: Page load times, API response times
- **Errors**: Client and server error rates

## Future Enhancements

### Phase 2 Features

- **Real-time Collaboration**: Live editing with conflict resolution
- **Advanced AI**: Image generation, bardic songs
- **Mobile App**: React Native implementation
- **Integrations**: Discord bot, VTT connections

### Scalability Considerations

- **Database**: Read replicas for scaling
- **CDN**: Asset optimization and caching
- **API**: Rate limiting and pagination
- **Search**: Elasticsearch for advanced full-text search
