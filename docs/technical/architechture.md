# D&D Campaign Management App - Product Requirements Document

## 📖 Project Overview

**Name:** Squire App
**URL:** https://squire-app.vercel.app
**Github:** https://github.com/emmyrlim/squire
**Purpose:** Digital companion for Dungeon Masters and players to manage D&D campaigns, track characters, sessions, and campaign elements.

## 🏗️ Technical Architecture

### **Frontend**

- **Framework:** Remix (React-based full-stack framework)
- **Styling:** Tailwind CSS
- **Deployment:** Vercel
- **Authentication:** Supabase Auth

### **Backend**

- **Database:** PostgreSQL (Supabase)
- **API:** Hybrid approach
  - **Supabase REST API** for simple CRUD operations
  - **RPC Functions** for complex queries and business logic
- **Authentication:** Row Level Security (RLS) policies

### **Key Technical Decisions**

- **Environment Variables:** Standard naming (not VITE\_ prefixed) for server-side compatibility
- **Data Access Patterns:**
  - REST API for single-table operations and basic CRUD
  - RPC functions for multi-table joins, aggregations, and complex business logic
- **Security:** RLS policies with SECURITY DEFINER functions for complex operations

## 📊 Database Schema

### **Core Tables**

#### **Users & Authentication**

- `user_profiles` - User profile information (linked to Supabase auth.users)

#### **Campaigns**

- `campaigns` - Campaign metadata (name, description, setting, invite codes)
- `campaign_users` - User-campaign relationships with roles (DM/player)
- `campaign_characters` - Character-campaign relationships

#### **Characters**

- `characters` - Player character information (name, class, level, race, background)

#### **Campaign Content**

- `sessions` - Session records with summaries and metadata
- `npcs` - Non-player characters with descriptions and affiliations
- `locations` - Places within campaigns (hierarchical structure)
- `monsters` - Encountered creatures with combat stats
- `quests` - Quest tracking with progress and events

#### **Items & Economy**

- `items` - Campaign items and equipment
- `party_gold` - Shared party treasury
- `gold_transactions` - Gold income/expense tracking
- `item_transactions` - Item transfer history

#### **System Tables**

- `ai_suggestions` - AI-generated content suggestions
- `entity_links` - Relationships between campaign entities
- `npc_affiliations` - NPC organizational relationships
- `quest_events` - Quest progress tracking

### **Key Relationships**

- Users can be in multiple campaigns with different roles
- Characters belong to users and can join multiple campaigns
- All campaign content is scoped to specific campaigns
- Sessions serve as temporal anchors for events and discoveries

## 🎯 Core Features

### **Campaign Management**

- ✅ **Create Campaigns** - DMs can create new campaigns with descriptions and settings
- ✅ **Invite System** - Unique invite codes for players to join campaigns
- ✅ **Role Management** - Distinction between DMs (campaign creators) and players
- ✅ **Campaign Dashboard** - Overview of campaign status and recent activity

### **Character Management**

- ✅ **Character Creation** - Players create characters with D&D 5e attributes
- ✅ **Character-Campaign Association** - Characters can participate in multiple campaigns
- ✅ **Character Progression** - Level tracking and character development

### **Session Tracking**

- 📋 **Session Recording** - Create session records with summaries
- 📋 **Session Numbering** - Chronological session organization
- 📋 **Session Dates** - Calendar integration for session scheduling

### **Campaign Content**

- 📋 **NPC Management** - Track non-player characters with descriptions and relationships
- 📋 **Location Tracking** - Hierarchical location management (cities, buildings, rooms)
- 📋 **Monster Encounters** - Record creature encounters with combat statistics
- 📋 **Quest Management** - Track main, side, and personal quests with progress

### **Inventory & Economy**

- 📋 **Item Management** - Track party and individual equipment
- 📋 **Gold Tracking** - Party treasury and transaction history
- 📋 **Loot Distribution** - Manage rewards from sessions and encounters

### **AI Integration**

- 📋 **Content Suggestions** - AI-generated names, descriptions, and content
- 📋 **Session Enhancement** - AI-assisted session summary improvements

## 🔧 Current Implementation Status

### **✅ Completed**

- User authentication and profiles
- Campaign creation and invitation system
- Character creation and management
- Database schema with RLS policies
- Basic CRUD operations for core entities
- User-campaign-character relationships

### **🚧 In Progress**

- Session management interface
- Campaign dashboard with analytics
- Character-campaign association UI

### **📋 Planned**

- NPC and location management
- Quest tracking system
- Inventory and gold management
- AI content suggestions
- Session scheduling and reminders

## 🎨 User Experience

### **User Roles**

#### **Dungeon Master (DM)**

- Creates and manages campaigns
- Invites players via invite codes
- Records session summaries
- Manages NPCs, locations, and quests
- Distributes loot and manages party resources

#### **Player**

- Joins campaigns via invite codes
- Creates and manages characters
- Views campaign information and history
- Tracks character progression and inventory

### **Key User Flows**

#### **Campaign Creation Flow**

1. DM creates new campaign
2. System generates unique invite code
3. DM automatically assigned as campaign DM
4. DM can begin adding content and inviting players

#### **Player Join Flow**

1. Player receives invite code from DM
2. Player enters invite code in app
3. Player selects character to join with
4. Character added to campaign with player role

#### **Session Flow**

1. DM creates session record
2. Session events and discoveries recorded
3. Loot and experience distributed
4. Session summary generated and enhanced

## 🔐 Security & Permissions

### **Row Level Security (RLS)**

- Users can only access campaigns they're members of
- Campaign creators have additional management permissions
- All queries filtered by user authentication context

### **API Security**

- SECURITY DEFINER functions for complex operations
- Parameterized queries prevent SQL injection
- Authentication required for all operations

## 🚀 Deployment & Infrastructure

### **Hosting**

- **Frontend:** Vercel (Node.js 18.x runtime)
- **Database:** Supabase (managed PostgreSQL)
- **Authentication:** Supabase Auth with social providers

### **Environment Configuration**

```
SUPABASE_URL=https://project.supabase.co
SUPABASE_ANON_KEY=eyJ...
```

### **Domain Configuration**

- **Production:** https://squire-app.vercel.app
- **Development:** http://localhost:3000
- **Auth Redirects:** Configured in Supabase for both environments

## 📈 Technical Debt & Considerations

### **Performance**

- RPC functions optimize complex queries
- Proper indexing on foreign keys and frequently queried columns
- JSON aggregation for related data reduces round trips

### **Scalability**

- Database designed for multi-tenancy via campaign scoping
- RLS policies ensure data isolation
- Stateless application architecture

### **Future Enhancements**

- Real-time updates via Supabase subscriptions
- Mobile app development
- Advanced AI features for content generation
- Integration with D&D Beyond or similar platforms

## 🧑‍💻 Development Guidelines

### **Data Access Patterns**

- **Use REST API for:** Simple CRUD, single-table operations, basic filtering
- **Use RPC functions for:** Multi-table joins, aggregations, complex business logic

### **Code Organization**

- Supabase client configuration in utils
- RPC functions for reusable complex queries
- Remix loaders for data fetching
- Type-safe database operations

### **Testing Strategy**

- Unit tests for utility functions
- Integration tests for database operations
- End-to-end tests for critical user flows

---

_Last Updated: June 2025_
_Version: 1.0_
