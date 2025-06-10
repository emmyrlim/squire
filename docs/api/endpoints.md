# Squire - API Specification

## Authentication

All API endpoints require authentication via Supabase JWT token in the Authorization header:
```
Authorization: Bearer {jwt_token}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {}, // Response data
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {} // Additional error context
  }
}
```

## API Endpoints

### Authentication

#### POST /api/auth/profile
Create or update user profile after authentication.

**Request Body:**
```json
{
  "username": "string (required, unique)",
  "display_name": "string (optional)",
  "avatar_url": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "string",
    "display_name": "string",
    "avatar_url": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

---

### Campaigns

#### GET /api/campaigns
Get all campaigns for the authenticated user.

**Query Parameters:**
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "setting": "string",
      "role": "dm|player",
      "member_count": "number",
      "session_count": "number",
      "latest_session": "number",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

#### POST /api/campaigns
Create a new campaign.

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "setting": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "setting": "string",
    "invite_code": "string",
    "created_by": "uuid",
    "created_at": "timestamp"
  }
}
```

#### GET /api/campaigns/:id
Get campaign details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "setting": "string",
    "created_by": "uuid",
    "invite_code": "string",
    "members": [
      {
        "user_id": "uuid",
        "username": "string",
        "role": "dm|player",
        "character_name": "string",
        "character_description": "string"
      }
    ],
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

#### PUT /api/campaigns/:id
Update campaign (DM only).

**Request Body:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "setting": "string (optional)"
}
```

#### POST /api/campaigns/join
Join a campaign using invite code.

**Request Body:**
```json
{
  "invite_code": "string (required)",
  "character_name": "string (optional)",
  "character_description": "string (optional)"
}
```

#### DELETE /api/campaigns/:id
Delete campaign (creator only).

---

### Sessions

#### GET /api/campaigns/:campaignId/sessions
Get all sessions for a campaign.

**Query Parameters:**
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `search` (optional): Search in titles and summaries

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "session_number": "number",
      "title": "string",
      "raw_summary": "string",
      "enhanced_summary": "string",
      "session_date": "date",
      "created_by": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

#### POST /api/campaigns/:campaignId/sessions
Create a new session.

**Request Body:**
```json
{
  "title": "string (optional)",
  "raw_summary": "string (required)",
  "session_date": "date (optional)"
}
```

#### GET /api/campaigns/:campaignId/sessions/:sessionId
Get session details.

#### PUT /api/campaigns/:campaignId/sessions/:sessionId
Update session.

#### POST /api/campaigns/:campaignId/sessions/:sessionId/enhance
Enhance session summary with AI.

**Response:**
```json
{
  "success": true,
  "data": {
    "enhanced_summary": "string",
    "suggestions": [
      {
        "type": "npc|location|item|quest|monster",
        "name": "string",
        "description": "string",
        "additional_data": {}
      }
    ]
  }
}
```

---

### Locations

#### GET /api/campaigns/:campaignId/locations
Get all locations for a campaign.

**Query Parameters:**
- `search` (optional): Search in names and descriptions
- `type` (optional): Filter by location type
- `sort` (optional): "name" | "created_at" | "updated_at" (default: "name")
- `order` (optional): "asc" | "desc" (default: "asc")
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "location_type": "string",
      "parent_location": {
        "id": "uuid",
        "name": "string"
      },
      "discovered_in_session": "number",
      "created_by": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

#### POST /api/campaigns/:campaignId/locations
Create a new location.

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "location_type": "string (optional)",
  "parent_location_id": "uuid (optional)",
  "discovered_in_session_id": "uuid (optional)"
}
```

#### GET /api/campaigns/:campaignId/locations/:locationId
Get location details with linked entities.

#### PUT /api/campaigns/:campaignId/locations/:locationId
Update location.

#### DELETE /api/campaigns/:campaignId/locations/:locationId
Delete location.

---

### NPCs

#### GET /api/campaigns/:campaignId/npcs
Get all NPCs for a campaign.

**Query Parameters:**
- `search` (optional): Search in names and descriptions
- `race` (optional): Filter by race
- `class` (optional): Filter by class
- `disposition` (optional): Filter by disposition
- `location_id` (optional): Filter by location
- `is_alive` (optional): Filter by alive status
- `sort` (optional): "name" | "created_at" | "updated_at" (default: "name")
- `order` (optional): "asc" | "desc" (default: "asc")
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "race": "string",
      "class": "string",
      "occupation": "string",
      "disposition": "string",
      "location": {
        "id": "uuid",
        "name": "string"
      },
      "affiliations": [
        {
          "organization_name": "string",
          "role_in_organization": "string"
        }
      ],
      "met_in_session": "number",
      "is_alive": "boolean",
      "notes": "string",
      "created_by": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

#### POST /api/campaigns/:campaignId/npcs
Create a new NPC.

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "race": "string (optional)",
  "class": "string (optional)",
  "occupation": "string (optional)",
  "disposition": "string (optional)",
  "location_id": "uuid (optional)",
  "met_in_session_id": "uuid (optional)",
  "is_alive": "boolean (optional, default: true)",
  "notes": "string (optional)",
  "affiliations": [
    {
      "organization_name": "string",
      "role_in_organization": "string (optional)"
    }
  ]
}
```

#### GET /api/campaigns/:campaignId/npcs/:npcId
Get NPC details with relationships.

#### PUT /api/campaigns/:campaignId/npcs/:npcId
Update NPC.

#### DELETE /api/campaigns/:campaignId/npcs/:npcId
Delete NPC.

---

### Items & Inventory

#### GET /api/campaigns/:campaignId/inventory
Get party inventory overview.

**Response:**
```json
{
  "success": true,
  "data": {
    "party_gold": "number",
    "party_items": [
      {
        "id": "uuid",
        "name": "string",
        "description": "string",
        "item_type": "string",
        "rarity": "string",
        "quantity": "number",
        "value_gp": "number",
        "is_equipped": "boolean",
        "notes": "string"
      }
    ],
    "player_inventories": [
      {
        "player_id": "uuid",
        "player_name": "string",
        "items": [
          {
            "id": "uuid",
            "name": "string",
            "description": "string",
            "item_type": "string",
            "rarity": "string",
            "quantity": "number",
            "value_gp": "number",
            "is_equipped": "boolean",
            "notes": "string"
          }
        ]
      }
    ]
  }
}
```

#### GET /api/campaigns/:campaignId/items
Get items with filters.

**Query Parameters:**
- `search` (optional): Search in names and descriptions
- `item_type` (optional): Filter by item type
- `rarity` (optional): Filter by rarity
- `owner_type` (optional): "party" | "player"
- `owner_id` (optional): Player UUID (for player items)
- `is_equipped` (optional): Filter by equipped status
- `sort` (optional): "name" | "value_gp" | "created_at" (default: "name")
- `order` (optional): "asc" | "desc" (default: "asc")

#### POST /api/campaigns/:campaignId/items
Add a new item.

**Request Body:**
```json
{
  "name": "string (required)",
  "description": "string (optional)",
  "item_type": "string (optional)",
  "rarity": "string (optional)",
  "quantity": "number (optional, default: 1)",
  "value_gp": "number (optional, default: 0)",
  "owner_type": "party|player (optional, default: party)",
  "owner_id": "uuid (optional, required if owner_type is player)",
  "acquired_in_session_id": "uuid (optional)",
  "is_equipped": "boolean (optional, default: false)",
  "notes": "string (optional)",
  "reason": "string (optional, for transaction log)"
}
```

#### PUT /api/campaigns/:campaignId/items/:itemId
Update item.

#### DELETE /api/campaigns/:campaignId/items/:itemId
Remove item.

#### POST /api/campaigns/:campaignId/items/:itemId/transfer
Transfer item between players or to/from party.

**Request Body:**
```json
{
  "to_owner_type": "party|player (required)",
  "to_owner_id": "uuid (optional, required if to_owner_type is player)",
  "quantity": "number (optional, default: all)",
  "reason": "string (optional)"
}
```

#### POST /api/campaigns/:campaignId/gold
Add or remove gold.

**Request Body:**
```json
{
  "transaction_type": "earned|spent|found|lost (required)",
  "amount": "number (required)",
  "reason": "string (optional)",
  "session_id": "uuid (optional)"
}
```

#### GET /api/campaigns/:campaignId/transactions
Get item and gold transaction history.

**Query Parameters:**
- `type` (optional): "item" | "gold"
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

---

### Quests

#### GET /api/campaigns/:campaignId/quests
Get all quests for a campaign.

**Query Parameters:**
- `search` (optional): Search in titles and descriptions
- `quest_type` (optional): "main" | "side" | "personal"
- `status` (optional): "active" | "completed" | "failed" | "paused"
- `location_id` (optional): Filter by location
- `sort` (optional): "title" | "created_at" | "updated_at" (default: "updated_at")
- `order` (optional): "asc" | "desc" (default: "desc")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "quest_type": "main|side|personal",
      "status": "active|completed|failed|paused",
      "progress_summary": "string",
      "next_steps": "string",
      "location": {
        "id": "uuid",
        "name": "string"
      },
      "quest_giver": {
        "id": "uuid",
        "name": "string"
      },
      "started_in_session": "number",
      "completed_in_session": "number",
      "reward_description": "string",
      "created_by": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

#### POST /api/campaigns/:campaignId/quests
Create a new quest.

**Request Body:**
```json
{
  "title": "string (required)",
  "description": "string (optional)",
  "quest_type": "main|side|personal (optional, default: side)",
  "location_id": "uuid (optional)",
  "quest_giver_npc_id": "uuid (optional)",
  "started_in_session_id": "uuid (optional)",
  "reward_description": "string (optional)"
}
```

#### GET /api/campaigns/:campaignId/quests/:questId
Get quest details with events.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "quest_type": "string",
    "status": "string",
    "progress_summary": "string",
    "next_steps": "string",
    "location": {
      "id": "uuid",
      "name": "string"
    },
    "quest_giver": {
      "id": "uuid",
      "name": "string"
    },
    "events": [
      {
        "id": "uuid",
        "session_id": "uuid",
        "session_number": "number",
        "event_description": "string",
        "event_order": "number",
        "created_at": "timestamp"
      }
    ],
    "reward_description": "string",
    "created_at": "timestamp",
    "updated_at": "timestamp"
  }
}
```

#### PUT /api/campaigns/:campaignId/quests/:questId
Update quest.

#### PATCH /api/campaigns/:campaignId/quests/:questId/status
Update quest status.

**Request Body:**
```json
{
  "status": "active|completed|failed|paused (required)",
  "completed_in_session_id": "uuid (optional, for completed status)"
}
```

#### POST /api/campaigns/:campaignId/quests/:questId/events
Add quest event.

**Request Body:**
```json
{
  "session_id": "uuid (required)",
  "event_description": "string (required)"
}
```

#### DELETE /api/campaigns/:campaignId/quests/:questId
Delete quest.

---

### Bestiary

#### GET /api/campaigns/:campaignId/monsters
Get all monsters for a campaign.

**Query Parameters:**
- `search` (optional): Search in names and descriptions
- `creature_type` (optional): Filter by creature type
- `challenge_rating` (optional): Filter by challenge rating
- `location_id` (optional): Filter by encounter location
- `is_defeated` (optional): Filter by defeated status
- `sort` (optional): "name" | "challenge_rating" | "created_at" (default: "name")
- `order` (optional): "asc" | "desc" (default: "asc")

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "creature_type": "string",
      "description": "string",
      "armor_class": "number",
      "hit_points": "string",
      "speed": "string",
      "challenge_rating": "string",
      "attacks_observed": "string",
      "special_abilities": "string",
      "encountered_in_session": "number",
      "location_encountered": {
        "id": "uuid",
        "name": "string"
      },
      "notes": "string",
      "is_defeated": "boolean",
      "created_by": "string",
      "created_at": "timestamp",
      "updated_at": "timestamp"
    }
  ]
}
```

#### POST /api/campaigns/:campaignId/monsters
Add a new monster.

**Request Body:**
```json
{
  "name": "string (required)",
  "creature_type": "string (optional)",
  "description": "string (optional)",
  "armor_class": "number (optional)",
  "hit_points": "string (optional)",
  "speed": "string (optional)",
  "challenge_rating": "string (optional)",
  "attacks_observed": "string (optional)",
  "special_abilities": "string (optional)",
  "encountered_in_session_id": "uuid (optional)",
  "location_encountered_id": "uuid (optional)",
  "notes": "string (optional)",
  "is_defeated": "boolean (optional, default: false)"
}
```

#### GET /api/campaigns/:campaignId/monsters/:monsterId
Get monster details.

#### PUT /api/campaigns/:campaignId/monsters/:monsterId
Update monster.

#### DELETE /api/campaigns/:campaignId/monsters/:monsterId
Delete monster.

---

### AI Features

#### POST /api/ai/enhance-summary
Enhance a session summary.

**Request Body:**
```json
{
  "campaign_id": "uuid (required)",
  "raw_summary": "string (required)",
  "context": {
    "session_number": "number",
    "previous_sessions": ["string"],
    "known_npcs": ["string"],
    "known_locations": ["string"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "enhanced_summary": "string",
    "suggestions": [
      {
        "type": "npc|location|item|quest|monster",
        "name": "string",
        "description": "string",
        "confidence": "number",
        "additional_data": {}
      }
    ]
  }
}
```

#### POST /api/ai/suggest-entities
Get AI suggestions for entities mentioned in text.

**Request Body:**
```json
{
  "campaign_id": "uuid (required)",
  "text": "string (required)",
  "entity_types": ["npc", "location", "item", "quest", "monster"]
}
```

#### POST /api/ai/generate-links
Generate cross-references between entities.

**Request Body:**
```json
{
  "campaign_id": "uuid (required)",
  "entity_type": "string (required)",
  "entity_id": "uuid (required)",
  "content": "string (required)"
}
```

---

### Search

#### GET /api/campaigns/:campaignId/search
Global search across all campaign content.

**Query Parameters:**
- `q` (required): Search query
- `types` (optional): Comma-separated list of entity types to search
- `limit` (optional): Number of results per type (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "sessions": [],
    "locations": [],
    "npcs": [],
    "items": [],
    "quests": [],
    "monsters": []
  }
}
```

## Error Codes

- `INVALID_REQUEST`: Malformed request body or parameters
- `UNAUTHORIZED`: Authentication required or failed
- `FORBIDDEN`: User lacks permission for this action
- `NOT_FOUND`: Requested resource doesn't exist
- `CONFLICT`: Resource already exists or constraint violation
- `VALIDATION_ERROR`: Request validation failed
- `AI_SERVICE_ERROR`: AI service unavailable or failed
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Unexpected server error

## Rate Limiting

- General API: 1000 requests per hour per user
- AI endpoints: 100 requests per hour per user
- Search endpoints: 500 requests per hour per user

Rate limit headers included in all responses:
- `X-RateLimit-Limit`: Requests allowed per window
- `X-RateLimit-Remaining`: Requests remaining in window
- `X-RateLimit-Reset`: Unix timestamp when window resets