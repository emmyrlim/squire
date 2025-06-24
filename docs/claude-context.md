# Claude Context - D&D Session Logger App

## Project Overview

A collaborative web application for real-time D&D session logging with AI-powered knowledge extraction. The app transforms live session notes into an organized, searchable knowledge base of campaign entities through intelligent content analysis.

For detailed product requirements, see `docs/prd/product-requirements.md`.

## Tech Stack

- **Framework**: Remix (React-based full-stack framework)
- **Database**: Supabase (PostgreSQL with real-time features)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime/WebSockets
- **AI Integration**: LLM API (OpenAI/Anthropic)
- **Styling**: Tailwind CSS + shadcn/ui
- **Hosting**: Vercel
- **Language**: TypeScript

## Architecture Overview

### Application Structure

- **Single Page Application (SPA)** with split-screen interface
- **Left Panel**: Session logging (chat-style collaborative interface)
- **Right Panel**: Knowledge base browsing (searchable Detail Items)
- **Real-time collaboration** for session logging
- **AI-powered content extraction** from session transcripts

### Core Concepts

#### Detail Items

Unified knowledge entities extracted from session logs:

- **NPCs**: Characters encountered
- **Locations**: Places visited or mentioned
- **Monsters**: Creatures fought or encountered
- **Quests**: Objectives and storylines
- **Mysteries**: Unexplained events or clues
- **Magical Items**: Artifacts and equipment

#### Session Logging

- Real-time collaborative chat interface
- Discord-like message attribution
- "Transcribe Session" triggers AI processing
- Persistent session history

## Database Schema Changes

### New/Modified Core Tables

```sql
-- Enhanced sessions table for real-time collaboration
sessions (id, campaign_id, slug, session_number, title, status, created_by, created_at, updated_at)
  - status: 'active' | 'completed' | 'processing'
  - Real-time session state management

-- Session messages for collaborative logging
session_messages (id, session_id, user_id, message_content, message_type, created_at)
  - message_type: 'text' | 'action' | 'system'
  - Individual chat messages with user attribution

-- Unified Detail Items table (replaces npcs, locations, monsters, quests, items)
detail_items (id, campaign_id, slug, name, category, description, metadata, source_session_id, ai_confidence, created_by, created_at, updated_at)
  - category: 'npc' | 'location' | 'monster' | 'quest' | 'mystery' | 'magical_item'
  - metadata: JSONB for category-specific fields
  - ai_confidence: 0.0-1.0 for AI extraction confidence
  - Links to originating session

-- Relationships between Detail Items
detail_item_relationships (id, campaign_id, source_item_id, target_item_id, relationship_type, description, created_at)
  - relationship_type: 'located_in' | 'knows' | 'enemy_of' | 'part_of' | 'related_to'
  - AI-generated cross-references

-- AI processing job tracking
ai_processing_jobs (id, session_id, status, result_data, error_message, created_at, completed_at)
  - status: 'pending' | 'processing' | 'completed' | 'failed'
  - Tracks AI analysis of session transcripts
```

### Key Schema Patterns

- **Unified Entity Model**: Single `detail_items` table with category-based polymorphism
- **Real-time Session Data**: `session_messages` for collaborative logging
- **AI Integration**: Processing jobs and confidence tracking
- **Flexible Metadata**: JSONB for category-specific fields in Detail Items
- **Cross-references**: Explicit relationship modeling between entities

## URL Structure & Routing

### SPA Route Structure

- **Base Campaign Route**: `/campaigns/{campaignSlug}` - Main SPA interface
- **Session Deep Links**: `/campaigns/{campaignSlug}/sessions/{sessionSlug}` - Direct session access
- **Detail Item Deep Links**: `/campaigns/{campaignSlug}/items/{itemSlug}` - Direct Detail Item access
- **Campaign Management**: `/campaigns/new`, `/campaigns/join` - Campaign creation/joining

### State Management

- **URL State**: Session and Detail Item selection via URL parameters
- **Real-time State**: Live session updates via WebSocket
- **Cache State**: Detail Items and search results caching

## Component Architecture

### Left Panel Components

```
SessionPanel/
├── session-list.tsx          # List of previous sessions
├── active-session.tsx        # Live session chat interface
├── session-message.tsx       # Individual chat message
├── new-session-button.tsx    # Start new session control
└── transcribe-button.tsx     # Trigger AI processing
```

### Right Panel Components

```
KnowledgePanel/
├── search-and-filter.tsx     # Search bar and category filters
├── detail-items-grid.tsx     # Tile/grid view of Detail Items
├── detail-item-card.tsx      # Individual Detail Item preview
├── detail-item-modal.tsx     # Full Detail Item information
└── relationship-links.tsx    # Cross-reference navigation
```

### Shared Components

```
Layout/
├── split-layout.tsx          # Main two-panel interface
├── campaign-header.tsx       # Campaign info and navigation
└── user-presence.tsx         # Show active users in session
```

## Real-time Architecture

### WebSocket Events

- `session:message` - New session message
- `session:user_joined` - User presence updates
- `detail_items:updated` - New/updated Detail Items
- `ai:processing_status` - AI job status updates

### State Synchronization

- Optimistic updates for user messages
- Real-time propagation to all session participants
- Conflict resolution for simultaneous edits

## AI Integration

### Content Extraction Pipeline

1. **Session Transcript Aggregation**: Combine all session messages
2. **LLM Analysis**: Extract entities and relationships using structured prompts
3. **Entity Matching**: Merge with existing Detail Items or create new ones
4. **Relationship Detection**: Identify cross-references between entities
5. **Confidence Scoring**: Rate extraction quality for user review

### LLM Prompt Structure

```
System: You are an expert D&D session note-taker. Extract key information from this session transcript.

Categories to identify:
- NPCs: Characters with names, descriptions, roles
- Locations: Places with descriptions, connections
- Monsters: Creatures with stats, abilities
- Quests: Objectives, storylines, progression
- Mysteries: Unexplained events, clues, theories
- Magical Items: Artifacts, equipment, properties

For each entity:
1. Determine if it matches existing entities (provide ID if match)
2. Extract/update relevant information
3. Identify relationships to other entities
4. Assign confidence score (0.0-1.0)

Output: Structured JSON with entities and relationships
```

## Security Model

### Campaign Access Control

- **RLS Policies**: Campaign-scoped data access
- **Real-time Security**: WebSocket authentication
- **Role-based Permissions**: DM vs Player capabilities

### AI Processing Security

- **Input Sanitization**: Clean session transcripts before LLM processing
- **Rate Limiting**: Prevent AI API abuse
- **Cost Controls**: Usage monitoring and limits

## Performance Considerations

### Real-time Performance

- **Message Batching**: Reduce WebSocket overhead
- **State Diffing**: Minimize update payloads
- **Connection Management**: Handle reconnection gracefully

### Search Performance

- **Full-text Search**: PostgreSQL trigram indexes
- **Caching**: Redis for frequent searches
- **Pagination**: Efficient large result handling

### AI Processing

- **Async Processing**: Background AI jobs
- **Progressive Updates**: Stream Detail Items as generated
- **Fallback Handling**: Graceful AI service failures

## Development Phases

### Phase 1: SPA Foundation (2-3 weeks)

- Split-panel layout implementation
- Basic session logging (no real-time)
- Static Detail Items display
- Campaign management integration

### Phase 2: Real-time Features (2-3 weeks)

- WebSocket integration
- Live session collaboration
- User presence indicators
- Real-time UI updates

### Phase 3: AI Integration (3-4 weeks)

- LLM API integration
- Entity extraction pipeline
- Detail Item generation/merging
- Processing status UI

### Phase 4: Search & Polish (2-3 weeks)

- Advanced search implementation
- Performance optimization
- Mobile responsiveness
- User experience refinements

## Key Files & Updated Structure

```
app/
├── routes/
│   ├── _app.campaigns.$campaignSlug.tsx     # Main SPA route
│   └── _app.campaigns.$campaignSlug.api.tsx # API endpoints for real-time
├── modules/
│   ├── sessions/
│   │   ├── components/
│   │   │   ├── session-panel.tsx
│   │   │   ├── active-session.tsx
│   │   │   └── session-message.tsx
│   │   ├── services/
│   │   │   ├── session-realtime.ts
│   │   │   └── session-api.ts
│   │   └── types.ts
│   ├── detail-items/
│   │   ├── components/
│   │   │   ├── knowledge-panel.tsx
│   │   │   ├── detail-items-grid.tsx
│   │   │   ├── detail-item-modal.tsx
│   │   │   └── search-filter.tsx
│   │   ├── services/
│   │   │   ├── detail-items-api.ts
│   │   │   └── search-service.ts
│   │   └── types.ts
│   ├── ai/
│   │   ├── services/
│   │   │   ├── content-extraction.ts
│   │   │   ├── entity-matching.ts
│   │   │   └── relationship-detection.ts
│   │   └── types.ts
│   └── realtime/
│       ├── services/
│       │   ├── websocket.ts
│       │   └── presence.ts
│       └── hooks/
│           ├── use-realtime-session.ts
│           └── use-detail-items.ts
└── shared/
    ├── components/
    │   ├── split-layout.tsx
    │   └── modal-manager.tsx
    └── utils/
        ├── realtime.ts
        └── ai-client.ts
```

## Common Patterns & Conventions

### Import Path Conventions

- **Absolute Paths**: Always use absolute paths defined in `tsconfig.json` such as `@/*` instead of relative paths or `~/*`
- **Module Imports**: Import from the corresponding module for module-specific types and utilities

  ```typescript
  // ✅ Good
  import { type Campaign } from "@/campaigns/types";
  import { useCampaign } from "@/campaigns/hooks";

  // ❌ Bad
  import { type Campaign } from "~/shared/types";
  import { useCampaign } from "../../hooks";
  ```

- **Path Maintenance**: When adding new modules, update `tsconfig.json` paths to include the new module
- **Shared Utils**: Only use `@/shared/*` for truly shared utilities and components

### Authentication Pattern

```typescript
import { requireAuth } from "@/shared/utils/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { user, supabase } = await requireAuth(request);

  // Use supabase client for database operations
  const { data } = await supabase.from("campaigns").select("*");

  // Use user for security checks
  if (!user) {
    throw new Response("Unauthorized", { status: 401 });
  }
}
```

### Response Handling

```typescript
// ✅ Good - Use Response.json
return Response.json({ data });

// ❌ Bad - Don't use deprecated json helper
return json({ data });
```

### Real-time Data Pattern

```typescript
// Hook for real-time session messages
const { messages, sendMessage, users } = useRealtimeSession(sessionId);

// Send message with optimistic update
const handleSendMessage = (content: string) => {
  sendMessage(content); // Optimistically updates local state
};
```

### Detail Item Access Pattern

```typescript
// Search and filter Detail Items
const { items, loading } = useDetailItems({
  campaignId,
  search: searchQuery,
  category: selectedCategory,
  sort: "relevance",
});
```

### AI Processing Pattern

```typescript
// Trigger AI processing of session
const { processSession, status } = useAIProcessing();

const handleTranscribe = async () => {
  const result = await processSession(sessionId);
  // UI updates automatically via real-time updates
};
```

## Environment Variables

- `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` - LLM service credentials
- `SUPABASE_REALTIME_KEY` - Real-time WebSocket authentication
- Additional existing Supabase and deployment variables

## Working with This Codebase

### For AI Assistants

When helping with this project:

1. **Understand the SPA Architecture**: This is now a single-page app with real-time collaboration, not a traditional multi-page application

2. **Focus on Real-time Features**: Most user interactions should have immediate feedback and real-time synchronization

3. **Consider AI Integration**: All content extraction and entity management flows through AI processing

4. **Maintain Performance**: Real-time features and search must be highly performant

5. **Follow the Detail Items Model**: The unified entity approach replaces separate NPCs, locations, etc.

6. **Test Collaboration**: Features should work smoothly with multiple simultaneous users

7. **Frontend Coding Style**: Try your best to avoid unnecessary and superfluous DOM elements. Use the most semantic elements possible. Always add a `data-testid` to important elements for semantic purposes.

8. **Feedback**: Be brutally honest, don't be a yes man. If I am wrong, point it out bluntly. I need honest feedback on my code.

9. **Naming Conventions**: Use the following naming conventions for components:
- **Components**: Use the `component-name.tsx` format.
- **Hooks**: Use the `use-component-name.ts` format.
- **Services**: Use the `component-name.service.ts` format.
- **Utils**: Use the `component-name.utils.ts` format.
- **Hooks**: Use the `use-component-name.ts` format.