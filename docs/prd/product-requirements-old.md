# Squire - D&D Session Tracking App

## Product Requirements Document (PRD)

### Product Overview

**Squire** is a multi-user D&D session tracking application that leverages AI to help Dungeon Masters and players maintain an organized, searchable campaign glossary. The app addresses the common problem of losing track of story elements, NPCs, locations, items, and quests across multiple sessions.

### Target Users

- **Primary**: Players who want to an easy and convenient way to organize and view data from a campaign as it is revealed to them
- **Secondary**: Dungeon Masters who want to contribute to documentation, see what their players know, or want to use this tool to manually reveal pre-generated information
- **Tertiary**: D&D groups seeking better session organization

### Core Value Proposition

Transform scattered session notes into an organized, AI-enhanced campaign wiki that automatically suggests connections and maintains narrative continuity.

## Feature Requirements

### 1. Story Tracking (MVP)

**User Story**: As a DM, I want to input rough session summaries and have AI create thematic, organized story logs.

**Acceptance Criteria**:

- Users can input raw session summaries
- Summaries are stored chronologically by session number
- Full-text search across all session summaries
- AI transforms raw input into thematic narrative
- AI suggests NPCs, items, quests, and monsters to add based on context
- Story builds cumulatively across sessions

**Future Enhancements**:

- AI-generated bardic songs of sessions
- AI-generated session images

### 2. Locations Glossary (MVP)

**User Story**: As a user, I want to maintain a searchable database of discovered locations with rich descriptions and cross-references.

**Acceptance Criteria**:

- CRUD operations for locations (name, description)
- Search and sort functionality
- AI assisted Auto-linking to related entities (NPCs, other locations)
- Visual organization with clear hierarchy

**Future Enhancements**:

- AI-generated location maps
- AI-generated location images

### 3. NPCs Database (MVP)

**User Story**: As a user, I want to track all NPCs met during the campaign with detailed information and relationships.

**Acceptance Criteria**:

- NPC profiles with name, description, race, class, affiliations
- CRUD operations with search/sort
- AI assisted Auto-linking in descriptions
- Relationship mapping between NPCs

**Future Enhancements**:

- AI-generated NPC portraits

### 4. Party Inventory (MVP)

**User Story**: As a party, we want to track our collective and individual items with a transaction log.

**Acceptance Criteria**:

- Party gold total display
- Individual player inventories
- Shared party items section
- Search functionality across all items
- Transaction log with reasons for additions/removals
- Easy add/remove interface

### 5. Quest Tracking (MVP)

**User Story**: As a DM, I want to organize active and completed quests with clear progression tracking.

**Acceptance Criteria**:

- Quest list with search/sort (recency, location, name)
- Quest categorization (main, side, personal)
- Auto-linking to relevant NPCs and locations
- Quest progression tracking with next steps
- Visual distinction for completed quests
- AI-generated quest summaries

### 6. Bestiary (MVP)

**User Story**: As a DM, I want to catalog monsters encountered with combat statistics.

**Acceptance Criteria**:

- Monster database with name, description, AC, attacks
- Search and sort functionality
- Easy add/edit/remove operations

**Future Enhancements**:

- AI-generated monster images

### 7. Campaign Management (MVP)

**User Story**: As a user, I want to manage multiple campaigns and collaborate with other users.

**Acceptance Criteria**:

- Campaign creation and joining via invite
- User role management (DM vs Player)
- Character sheet integration (basic description)
- Campaign selection on login
- Equal permissions for all users initially

#### Invite System (Current Implementation)

**User Story**: As a DM, I want to invite players to my campaign using a secure invite code.

**Acceptance Criteria**:

- Auto-generated unique invite codes for each campaign
- DM-only visibility of invite codes
- Ability to regenerate invite codes
- Secure code display with show/hide functionality
- Prevention of duplicate campaign memberships
- Clear feedback on join success/failure

**Future Enhancements**:

- **Invite Code Management**:

  - Set expiry dates for invite codes
  - Limit number of uses per code
  - Generate multiple invite codes
  - Revoke specific invite codes
  - View usage history of invite codes

- **Invite Sharing**:

  - Direct email invites
  - QR code generation for easy sharing
  - Copy to clipboard functionality
  - Share via social media
  - Custom invite messages

- **Access Control**:

  - Role-based invite codes (DM vs Player)
  - Character slot limits
  - Approval workflow for joins
  - Temporary access codes
  - Campaign password protection

- **Analytics**:
  - Track invite code usage
  - Monitor campaign growth
  - Player retention metrics
  - Join/leave history
  - Active player statistics

## Technical Requirements

### Performance

- Page load times under 2 seconds
- Real-time collaboration updates
- Mobile-responsive design

### Security

- User authentication and authorization
- Campaign-based data isolation
- Input sanitization and validation

### Scalability

- Support for 10+ users per campaign
- Handle 100+ entities per glossary section
- Efficient search across large datasets

## Success Metrics

- **User Engagement**: Daily active users per campaign
- **Content Creation**: Entities added per session
- **Feature Adoption**: Usage of AI suggestions
- **User Satisfaction**: Qualitative feedback on organization improvement

## Launch Strategy

1. **Alpha**: Single campaign testing with development team
2. **Beta**: Limited release to 3-5 D&D groups
3. **MVP Launch**: Public release with core features
4. **Post-MVP**: AI enhancements and image generation

## Risk Assessment

- **Technical Risk**: AI API costs and rate limits
- **User Risk**: Learning curve for new tools
- **Business Risk**: Competition from established tools
- **Mitigation**: Start with free tiers, focus on unique AI features
