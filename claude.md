# Claude Context - D&D Campaign Management App

## Project Overview

A web application for managing D&D campaigns, NPCs, quests, locations, and sessions. Built with modern web technologies and focused on user experience for dungeon masters.

For more details and product requirements, please read `docs/prd/product-requirements.md`. Update said product requirements document as necessary.

## Tech Stack

- **Framework**: Remix (React-based full-stack framework)
- **Database**: Supabase (PostgreSQL with real-time features)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS + shadcn/ui
- **Hosting**: Vercel
- **Language**: TypeScript

## Architecture Decisions

### URL Structure & Routing

- **User-scoped campaigns**: `/campaigns/{campaignSlug}` where slug is unique per user
- **Nested resources**: `/campaigns/{campaignSlug}/npcs/{npcSlug}`
- **Security**: All campaign resources are scoped to authenticated user via `created_by` field
- **Slugs**: Auto-generated from names, unique within scope (campaigns per user, NPCs per campaign)

### Database Schema Key Points

#### Core Tables

```sql
-- Users and Authentication
user_profiles (id) -> references auth.users(id)
  - display_name, avatar_url
  - Connected to Supabase Auth

-- Campaigns: Main container for all game content
campaigns (id, slug, created_by, invite_code)
  - slug: user-scoped readable URLs
  - invite_code: for sharing campaigns
  - created_by -> user_profiles(id)

-- Campaign membership and roles
campaign_users (campaign_id, user_id, role, character_name)
  - role: 'dm' | 'player'
  - Links users to campaigns they participate in
  - Every campaign creator is automatically added as a DM
  - Used for quick access to user's campaign memberships

-- Campaign character assignments
campaign_characters (campaign_id, character_id, role)
  - Links characters to campaigns they participate in
  - role: 'dm' | 'player'
  - Used for tracking which characters are in which campaigns
  - Allows users to bring multiple characters to a campaign
```

#### Content Tables (All scoped to campaigns)

```sql
-- NPCs: Non-player characters
npcs (id, campaign_id, slug, name, race, class, location_id, met_in_session_id)
  - slug: unique per campaign
  - Links to locations and sessions where encountered

-- Quests: Campaign storylines and objectives
quests (id, campaign_id, slug, title, quest_type, status, quest_giver_npc_id)
  - quest_type: 'main' | 'side' | 'personal'
  - status: 'active' | 'completed' | 'failed' | 'paused'
  - Links to NPCs and locations

-- Locations: Places in the game world
locations (id, campaign_id, slug, name, parent_location_id, discovered_in_session_id)
  - Hierarchical (locations can contain sub-locations)
  - Tracks when/where discovered

-- Sessions: Game session summaries and notes
sessions (id, campaign_id, slug, session_number, raw_summary, enhanced_summary)
  - session_number: sequential within campaign
  - Both raw (user input) and enhanced (AI processed) summaries

-- Monsters: Creatures encountered in combat
monsters (id, campaign_id, name, creature_type, description, armor_class, hit_points, speed, challenge_rating, attacks_observed, special_abilities, encountered_in_session_id, location_encountered_id, notes, is_defeated, created_by, created_at, updated_at)
  - Combat stats and abilities observed
  - Links to where/when encountered
  - Tracks defeat status
  - Full combat statistics (AC, HP, speed, CR)
  - Special abilities and attacks observed
  - Notes for DM reference
```

#### Character & Inventory System

```sql
-- Player Characters
characters (id, user_id, name, class, level, race)
  - Player-owned character sheets
  - Links via campaign_characters to campaigns

-- Items and Equipment
items (id, campaign_id, name, owner_type, owner_id, quantity, value_gp)
  - owner_type: 'party' | 'player'
  - Tracks individual/shared ownership

-- Economic Tracking
party_gold (campaign_id, total_gold) -- Shared party treasury
gold_transactions (campaign_id, transaction_type, amount, reason)
item_transactions (campaign_id, item_id, transaction_type, quantity_change)
```

#### Relationship & Event Tracking

```sql
-- Entity Relationships: Links between any game entities
entity_links (campaign_id, source_entity_type, source_entity_id, target_entity_type, target_entity_id)
  - Generic relationship system (NPC knows Location, Quest involves NPC, etc.)

-- Quest Progression
quest_events (quest_id, session_id, event_description, event_order)
  - Chronicles quest progression through sessions

-- AI Integration
ai_suggestions (campaign_id, suggestion_type, suggested_name, suggested_data, is_accepted)
  - Stores AI-generated content suggestions
```

#### Key Schema Patterns

- **User Scoping**: All content belongs to campaigns, campaigns belong to users
- **Slug URLs**: campaigns, npcs, quests, locations, sessions all have slugs for readable URLs
- **Session Tracking**: Most entities track which session they were introduced/discovered
- **Hierarchical Data**: Locations can contain sub-locations via parent_location_id
- **Flexible Ownership**: Items can be owned by party or individual players
- **Audit Trail**: Comprehensive transaction logging for items and gold
- **AI Ready**: Schema supports AI content generation and suggestions

### Security Model

- **Row Level Security (RLS)**: Implemented for all tables
- **Campaign Access Control**:
  - Campaign creators (DMs) have full access to their campaigns
  - Campaign members (players) have read access to campaign resources
  - Special RLS policy allows viewing campaigns by invite code for joining
- **Resource Access Patterns**:
  - Two-step validation: First get campaign, then verify membership
  - Membership check via `campaign_users` table
  - Role-based access (DM vs player) for certain operations
- **Error Handling**:
  - 403 for unauthorized access (not a campaign member)
  - 404 for not found resources
  - 500 for server errors

### Query Patterns

#### Campaign Access Pattern (Preferred)

```typescript
// 1. Get campaign by slug
const { data: campaign } = await supabase
  .from("campaigns")
  .select("id, name, slug")
  .eq("slug", campaignSlug)
  .single();

// 2. Verify user is a member
const { data: membership } = await supabase
  .from("campaign_users")
  .select("role")
  .eq("campaign_id", campaign.id)
  .eq("user_id", user.id)
  .single();

if (!membership) {
  throw new Response("You don't have access to this campaign", { status: 403 });
}
```

#### Single Query with JOIN (For resource access)

```typescript
// Get NPC with campaign validation in one query
const { data: npc } = await supabase
  .from("npcs")
  .select(
    `
    *,
    campaigns!inner (id, name, slug)
  `
  )
  .eq("slug", npcSlug)
  .eq("campaigns.slug", campaignSlug)
  .single();
```

### Auto-Generated Slugs

- **Database triggers**: Auto-generate slugs on insert/update using `generate_slug()` function
- **Collision handling**: Append numbers for duplicates (e.g., `gandalf-2`)
- **Scope awareness**: Unique within appropriate scope (user for campaigns, campaign for NPCs)

### UI Components & Styling

- **Component Library**: shadcn/ui

  - Built on Radix UI primitives
  - Customizable and accessible components
  - Styled with Tailwind CSS
  - Components located in `app/shared/components/ui/`
  - Uses New York style with Slate color scheme
  - Custom theme with orange primary color (HSL: 24 95% 53%)

- **Component Organization**:

  - All shadcn components in `app/shared/components/ui/`
  - Custom components extend shadcn components
  - Consistent import paths using `@/shared/components/ui/`
  - Components follow shadcn's composition pattern

- **Theme Customization**:

  - CSS variables in `app/tailwind.css`
  - Custom color scheme with orange as primary
  - Dark mode support
  - Consistent spacing and typography

- **Component Usage**:

  ```tsx
  import { Button } from "@/shared/components/ui/button"

  // Default button
  <Button>Click me</Button>

  // Variants
  <Button variant="destructive">Delete</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="secondary">Secondary</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="link">Link</Button>
  <Button variant="glowing">Glowing</Button>

  // Sizes
  <Button size="sm">Small</Button>
  <Button size="default">Default</Button>
  <Button size="lg">Large</Button>
  <Button size="icon">🔍</Button>
  ```

## Key Files & Structure

```
app/
├── routes/
│   ├── _app.campaigns.$campaignSlug.tsx          # Parent route - loads campaign
│   ├── _app.campaigns.$campaignSlug.[entity]._index.tsx     # Entity list/overview
│   └── _app.campaigns.$campaignSlug.[entity].$[entitySlug].tsx # Single entity details
├── modules/                                 # Feature-based module organization
│   ├── ai/
│   │   ├── components/
│   │   ├── services/
│   │   ├── utils/
│   │   └── types.ts
│   ├── auth/
│   │   ├── components/
│   │   ├── services/
│   │   ├── utils/
│   │   └── types.ts
│   ├── campaigns/
│   │   ├── components/
│   │   │   ├── campaign-list.tsx
│   │   │   └── campaign-modal.tsx
│   │   ├── services/
│   │   ├── utils/
│   │   └── types.ts                         # interface Campaign {}
│   ├── npcs/
│   │   ├── components/
│   │   │   ├── npc-list.tsx
│   │   │   ├── npc-details.tsx
│   │   │   └── npc-modal.tsx
│   │   ├── services/
│   │   ├── utils/
│   │   └── types.ts                         # interface NPC {}
│   ├── quests/
│   │   ├── components/
│   │   │   ├── quest-list.tsx
│   │   │   ├── quest-details.tsx
│   │   │   └── quest-modal.tsx
│   │   ├── services/
│   │   ├── utils/
│   │   └── types.ts                         # interface Quest {}
│   ├── sessions/
│   │   ├── components/
│   │   │   ├── session-list.tsx
│   │   │   ├── session-details.tsx
│   │   │   └── session-modal.tsx
│   │   ├── services/
│   │   ├── utils/
│   │   └── types.ts                         # interface Session {}
│   ├── locations/
│   │   ├── components/
│   │   │   ├── location-list.tsx
│   │   │   ├── location-details.tsx
│   │   │   └── location-modal.tsx
│   │   ├── services/
│   │   ├── utils/
│   │   └── types.ts                         # interface Location {}
│   ├── inventory/
│   │   ├── components/
│   │   │   ├── inventory-list.tsx
│   │   │   ├── inventory-details.tsx
│   │   │   └── inventory-modal.tsx
│   │   ├── services/
│   │   ├── utils/
│   │   └── types.ts                         # interface Item {}
│   ├── characters/
│   │   ├── components/
│   │   │   ├── character-list.tsx
│   │   │   ├── character-details.tsx
│   │   │   └── character-modal.tsx
│   │   ├── services/
│   │   ├── utils/
│   │   └── types.ts                         # interface Character {}
│   └── bestiary/
│       ├── components/
│       │   ├── bestiary-list.tsx
│       │   ├── bestiary-details.tsx
│       │   └── bestiary-modal.tsx
│       ├── services/
│       ├── utils/
│       └── types.ts                         # interface Monster {}
├── utils/
│   ├── auth.server.ts                       # Authentication utilities
│   ├── campaign.server.ts                   # Campaign-related queries
│   └── supabase.server.ts                   # Supabase client setup
└── types/
    └── database.ts                          # TypeScript types for DB schema
```

### Module Organization Patterns

- **List Components**: `[entity]-list.tsx` for displaying collections (e.g., `quest-list.tsx`)
- **Detail Components**: `[entity]-details.tsx` for displaying single entity details (e.g., `quest-details.tsx`)
- **Modal Components**: `[entity]-modal.tsx` for creation/editing forms (e.g., `quest-modal.tsx`)
- **Route Structure**:
  - `_app.campaigns.$campaignSlug.[entity]._index.tsx` - Overview and list route
  - `_app.campaigns.$campaignSlug.[entity].$[entitySlug].tsx` - Single entity details
- **Entity Creation**: All new entities are created via modal forms, not dedicated routes
- **Services**: Database queries and API calls specific to each module
- **Utils**: Helper functions and business logic for each domain
- **Types**: Interface definitions for each entity (e.g., `interface Quest {}`)
- **Consistent Structure**: Each functional module follows the same 4-folder pattern

## Current Implementation Status

### ✅ Completed

- Basic campaign CRUD with slug-based URLs
- NPC management within campaigns
- User authentication and session management
- Nested routing pattern with parent data sharing
- Security through user-scoped queries
- Auto-slug generation with database triggers

### 🚧 In Progress

- Quest management system
- Location/map integration
- Session notes and summaries

### 📋 Planned Features

- Campaign sharing between users
- AI-powered content generation
- Character sheet integration
- Initiative tracker
- Dice rolling system

## Common Patterns & Conventions

### Loader Security Pattern

```typescript
import { requireAuth } from "@/shared/utils/auth.server";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { supabase, user } = await requireAuth(request);
  const campaignSlug = params.campaignSlug;

  if (!campaignSlug) {
    throw new Response("Campaign Slug is required", { status: 400 });
  }

  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("id, name, slug") // Only select what we need
    .eq("slug", campaignSlug)
    .eq("created_by", user.id) // 🔒 Security: only user's campaigns
    .single();

  if (campaignError || !campaign) {
    throw new Response("Campaign not found", { status: 404 });
  }

  return Response.json({ campaign });
}
```

### Form Action Pattern

```typescript
import { requireAuth } from "@/shared/utils/auth.server";

export async function action({ request, params }: ActionFunctionArgs) {
  const { supabase, user } = await requireAuth(request);
  const formData = await request.formData();
  // Validate campaign ownership before mutations
  // Use campaign.id for foreign key relationships
  return Response.json({ success: true });
}
```

### Import Path Conventions

- **Shared Utils**: Always import from `@/shared/utils/` (e.g., `@/shared/utils/auth.server`)
- **Module Utils**: Import from within the module (e.g., `../utils/`)
- **Components**: Import from `@/shared/components/ui/` for shared UI components
- **Types**: Import from `@/shared/types/` for shared types

### Auth & Supabase Usage

- Use `requireAuth` from `@/shared/utils/auth.server` to get authenticated user and Supabase client
- `requireAuth` returns `{ session, supabase, user }` - no need to import Supabase separately
- Always destructure `supabase` and `user` from `requireAuth` result
- Use `supabase` client for all database operations
- Use `user.id` for security checks and ownership validation

### Error Handling

- **404 for not found**: Resources that don't exist or user can't access
- **403 for unauthorized**: Explicit permission denied
- **500 for server errors**: Database failures, unexpected errors
- **Security through obscurity**: Don't reveal why access was denied

## Database Utilities

### Slug Generation

```sql
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(
    regexp_replace(trim(input_text), '[^a-zA-Z0-9\s-]', '', 'g'),
    '\s+', '-', 'g'), '-+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;
```

### Foreign Key Relationships

- Supabase auto-detects JOIN conditions from foreign key constraints
- `campaigns!inner` syntax relies on `npcs.campaign_id REFERENCES campaigns(id)`
- Always ensure foreign key constraints exist for proper JOIN behavior

## Development Guidelines

### Performance Priorities

1. Minimize database round-trips (prefer JOINs over multiple queries)
2. Use indexes on slug columns and foreign keys
3. Leverage Remix's nested routing for data sharing
4. Consider caching campaign data across child routes

### Security Priorities

1. Always validate user ownership of campaigns
2. Use JOINs to validate relationships in single queries
3. Never trust client-side data for authorization
4. Consider implementing RLS as additional security layer

### Code Organization

- Server-side utilities in `*.server.ts` files
- Database queries abstracted into utility functions
- Types defined separately and imported
- Consistent error handling patterns across routes
- Streamline html as much as possible - use the most semantic tags, and avoid redundant wrapping DOM elements where possible
- Use absolute paths from tsconfig.json for imports (e.g., `@/shared/components/ui/button`)
- Prefer using shared UI components from `@/shared/components/ui` over custom styling when possible
- Use kebab-case for all filenames (e.g., `campaign-list.tsx` instead of `CampaignList.tsx`)

## Debugging Tips

- Check foreign key constraints if Supabase JOINs fail
- Verify slug uniqueness constraints in database
- Test with multiple users to ensure proper isolation
- Monitor query performance with Supabase dashboard

## Environment Variables

See `.env` file for required environment variables and configuration.

## Working with This Codebase

### For AI Assistants (Claude, Cursor, etc.)

When helping with this project:

1. **Read the code thoroughly**: Do a deep dive into the existing codebase to understand how features are implemented, the patterns used, and the overall architecture before suggesting changes or new features.

2. **Check product requirements**: If you need to understand feature requirements or business logic, refer to `docs/prd/product-requirements.md` for detailed specifications.

3. **Follow existing patterns**: Maintain consistency with established patterns for routing, database queries, security, and error handling.

4. **Understand the data flow**: Trace how data flows from database → loader → component → action → database to ensure new features integrate properly.

5. **Security first**: Always consider user authentication and authorization when suggesting database queries or API changes.

## Common Patterns & Conventions

### Loader Security Pattern
