# Squire - AI-Powered D&D Session Logger

## Product Requirements Document (PRD)

### Product Overview

**Squire** is a collaborative D&D session logging application that uses AI to automatically extract and organize campaign knowledge from live session transcripts. The app transforms real-time session notes into a searchable, interconnected knowledge base of NPCs, locations, quests, mysteries, monsters, and magical items.

### Target Users

- **Primary**: D&D groups who want to collaboratively log sessions in real-time and automatically build campaign knowledge
- **Secondary**: Players who want an organized, AI-enhanced view of campaign information as it unfolds
- **Tertiary**: DMs who want to see what information their players are capturing and contributing

### Core Value Proposition

Transform live D&D session chatter into an organized, AI-enhanced campaign knowledge base that automatically identifies, categorizes, and cross-references story elements in real-time.

## Feature Requirements

### 1. Collaborative Session Logging (MVP)

**User Story**: As a D&D group, we want to collaboratively log our session in real-time using a chat-like interface.

**Acceptance Criteria**:

- Campaign members can join a live session logging "room"
- Discord-like chat interface for adding session notes
- Real-time updates across all connected users
- Session notes are chronological and attributed to users
- "Start New Session" creates a new collaborative logging space
- Session persistence and ability to return to previous sessions

**Technical Requirements**:

- WebSocket/real-time updates for collaborative editing
- Session state management
- User attribution for each message/note

### 2. AI Knowledge Extraction (MVP)

**User Story**: As a user, I want AI to automatically identify and extract key campaign information from our session logs.

**Acceptance Criteria**:

- "Transcribe Session" button processes all session notes through AI
- AI identifies and categorizes information into Detail Items:
  - **NPCs**: Characters encountered (name, description, relationships)
  - **Locations**: Places visited or mentioned (name, description, connections)
  - **Monsters**: Creatures fought or encountered (stats, abilities, description)
  - **Quests**: Objectives and storylines (description, status, rewards)
  - **Mysteries**: Unexplained events or clues (description, theories)
  - **Magical Items**: Artifacts and equipment (properties, effects, lore)
- AI merges new information with existing Detail Items or creates new ones
- AI generates cross-references and relationships between Detail Items
- Processing status indicator during AI analysis

**Technical Requirements**:

- LLM integration for content analysis and extraction
- Intelligent merging logic for existing vs. new entities
- Relationship detection and linking between entities

### 3. Detail Items Knowledge Base (MVP)

**User Story**: As a user, I want to browse and search through all campaign knowledge extracted from our sessions.

**Acceptance Criteria**:

- Tile-based view of all Detail Items
- Category filtering (NPC, Location, Monster, Quest, Mystery, Magical Item)
- Full-text search across all Detail Items
- Sort by relevance, recency, or alphabetical
- Modal view for detailed information on each Detail Item
- Clickable cross-references within Detail Item descriptions
- Visual indicators for new/updated items since last session

**Technical Requirements**:

- Efficient search implementation (trigram/vector search)
- Modal management for nested Detail Item viewing
- Real-time updates when new Detail Items are generated

### 4. Campaign Management (MVP)

**User Story**: As a user, I want to create campaigns, invite players, and manage campaign membership.

**Acceptance Criteria**:

- Campaign creation with unique invite codes
- Join campaigns via invite code
- Character assignment to campaigns
- Role management (DM vs Player permissions)
- Campaign selection and switching
- Equal contribution permissions for all members initially

### 5. Split-Screen Interface (MVP)

**User Story**: As a user, I want an efficient interface that allows me to log sessions and browse knowledge simultaneously.

**Acceptance Criteria**:

- **Left Panel**: Session logging interface
  - List of previous sessions
  - Active session chat interface
  - "Start New Session" / "Transcribe Session" controls
- **Right Panel**: Knowledge browsing interface
  - Search and filter controls
  - Detail Items grid/list view
  - Modal overlay for Detail Item details
- Responsive design that works on desktop and tablet
- Panels are independently scrollable

## Technical Architecture

### Frontend Architecture

- **Single Page Application (SPA)** - React/Remix with client-side routing
- **Real-time Communication** - WebSockets for collaborative session logging
- **State Management** - Optimistic updates with real-time synchronization
- **Split Layout** - CSS Grid/Flexbox for two-panel interface

### Backend Architecture

- **Session Management** - Real-time session state with WebSocket support
- **AI Integration** - LLM API for content analysis and entity extraction
- **Knowledge Graph** - Relationship mapping between Detail Items
- **Search Engine** - Full-text and semantic search capabilities

### Database Changes (from current schema)

- **sessions** table: Add real-time collaboration fields
- **session_messages** table: Store individual chat messages with user attribution
- **detail_items** table: Replace multiple entity tables with unified structure
- **detail_item_relationships** table: Cross-references between items
- **ai_processing_jobs** table: Track AI analysis status and results

## User Flow

### Primary Flow: Session to Knowledge

1. User starts/joins a session → Chat interface appears
2. Group collaboratively logs session notes → Real-time updates
3. Session concludes → "Transcribe Session" button available
4. AI processes notes → Detail Items generated/updated
5. Users browse updated knowledge base → Discover new connections

### Secondary Flow: Knowledge Exploration

1. User searches/filters Detail Items → Relevant results displayed
2. User clicks Detail Item → Modal with full information
3. User clicks cross-reference → Related Detail Item modal opens
4. User discovers campaign connections → Enhanced understanding

## Success Metrics

- **Collaboration**: Average messages per session per user
- **AI Effectiveness**: Percentage of AI-generated Detail Items accepted/kept
- **Knowledge Growth**: Detail Items created per session
- **User Engagement**: Sessions logged per week per campaign
- **Search Usage**: Searches performed per session

## Technical Challenges & Solutions

### Real-time Collaboration

- **Challenge**: Multiple users editing simultaneously
- **Solution**: Operational transforms or CRDT for conflict resolution

### AI Processing Speed

- **Challenge**: Long processing times for large sessions
- **Solution**: Streaming AI responses, progressive Detail Item generation

### Search Performance

- **Challenge**: Fast search across growing knowledge base
- **Solution**: Hybrid search (keyword + semantic) with caching

### Mobile Experience

- **Challenge**: Split-screen interface on small screens
- **Solution**: Collapsible panels, tabbed interface for mobile

## Development Phases

### Phase 1: Core SPA Infrastructure

- Split-panel interface
- Basic session logging (no real-time yet)
- Static Detail Items display
- Campaign management

### Phase 2: Real-time Collaboration

- WebSocket integration
- Live session logging
- User presence indicators
- Real-time Detail Items updates

### Phase 3: AI Integration

- LLM API integration
- Entity extraction logic
- Detail Item generation and merging
- Relationship detection

### Phase 4: Advanced Features

- Semantic search
- AI suggestions and improvements
- Export capabilities
- Performance optimizations

## Risk Assessment

- **Technical Risk**: Real-time collaboration complexity
- **AI Risk**: LLM API costs and rate limiting
- **UX Risk**: Overwhelming interface with too much information
- **Performance Risk**: Search speed with large knowledge bases

## Launch Strategy

1. **Alpha**: Single campaign testing with development team
2. **Beta**: 3-5 D&D groups testing collaborative features
3. **MVP Launch**: Public release with core session logging and AI features
4. **Post-MVP**: Advanced search, mobile optimization, integration features
