# Platform Management System

## Overview

The Platform Management System allows admins to track clicks and earnings from external URL shortening platforms (like cut.ly, gourl, etc.) and manually add them to user accounts. This system integrates with the existing earnings and analytics infrastructure.

## Features

### 🔧 Platform Management
- **Create/Edit/Delete Platforms**: Add external platforms like cut.ly, gourl, etc.
- **Platform Status**: Enable/disable platforms as needed
- **Platform Types**: Categorize as external or internal
- **Website URLs**: Store platform website links

### 📊 Click Tracking
- **Manual Click Entry**: Admins can add clicks for any user on any platform
- **Date-based Tracking**: Record clicks for specific dates
- **Rate Configuration**: Set different rates per click for each entry
- **Notes**: Add context for each click entry

### 💰 Earnings Integration
- **Automatic Calculation**: Earnings = clicks × rate per click
- **User Earnings Update**: Automatically updates user's total earnings
- **Team Earnings Update**: Updates team's total earnings
- **Currency Support**: All amounts in PKR

### 📈 Analytics & Reporting
- **Platform Statistics**: Total clicks, earnings, average rates
- **User-specific Views**: Users can see their platform clicks
- **Team Views**: Admins can see all team platform clicks
- **Date Filtering**: Filter by date ranges
- **Admin Dashboard**: Comprehensive admin view of all platform data

## Database Schema

### Platform Schema
```typescript
{
  _id: ObjectId,
  name: string,           // Platform name (e.g., "cut.ly")
  description: string,    // Platform description
  website?: string,       // Platform website URL
  type: string,          // "external" or "internal"
  isActive: boolean,     // Platform status
  createdAt: Date,
  updatedAt: Date
}
```

### PlatformClick Schema
```typescript
{
  _id: ObjectId,
  platformId: ObjectId,  // Reference to Platform
  userId: ObjectId,      // Reference to User
  teamId: ObjectId,      // Reference to Team
  clicks: number,        // Number of clicks
  date: Date,           // Date of clicks
  earnings: number,      // Calculated earnings (clicks × rate)
  ratePerClick: number,  // Rate per click in PKR
  currency: string,      // Currency (default: "PKR")
  notes?: string,        // Optional notes
  addedBy: ObjectId,    // Admin who added the clicks
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### Platform Management
- `POST /api/platforms` - Create new platform
- `GET /api/platforms` - Get all platforms
- `GET /api/platforms/active` - Get active platforms only
- `GET /api/platforms/:id` - Get platform by ID
- `PUT /api/platforms/:id` - Update platform
- `DELETE /api/platforms/:id` - Delete platform

### Platform Clicks
- `POST /api/platforms/clicks` - Add platform clicks
- `GET /api/platforms/clicks/all` - Get all platform clicks (admin)
- `GET /api/platforms/clicks/user/:userId` - Get user's platform clicks
- `GET /api/platforms/clicks/team/:teamId` - Get team's platform clicks
- `GET /api/platforms/clicks/stats` - Get platform clicks statistics
- `PUT /api/platforms/clicks/:clickId` - Update platform clicks
- `DELETE /api/platforms/clicks/:clickId` - Delete platform clicks

### User-specific Endpoints
- `GET /api/platforms/clicks/my-clicks` - Get current user's platform clicks
- `GET /api/platforms/clicks/my-team` - Get current user's team platform clicks

## Frontend Features

### Admin Interface (`/admin/platforms`)
- **Platform Management Tab**:
  - List all platforms with status indicators
  - Add/edit/delete platforms
  - Platform form with validation
  - Active/inactive status toggle

- **Platform Clicks Tab**:
  - View all platform clicks with filters
  - Add new click entries
  - User and platform selection
  - Date picker and rate configuration
  - Earnings display and calculation

### User Interface
- Users can view their own platform clicks
- Team admins can view team platform clicks
- Earnings integration with existing rewards system

## Usage Workflow

### 1. Admin Setup
1. Navigate to `/admin/platforms`
2. Add external platforms (cut.ly, gourl, etc.)
3. Set platform status to active

### 2. Adding Clicks
1. Go to "Platform Clicks" tab
2. Click "Add Clicks"
3. Select platform and user
4. Enter click count and date
5. Set rate per click (default: 0.5 PKR)
6. Add optional notes
7. Submit to add clicks and calculate earnings

### 3. Monitoring
- View all platform clicks in admin dashboard
- Check statistics and earnings
- Filter by date, user, or platform
- Update or delete click entries as needed

## Integration Points

### Earnings System
- Platform clicks automatically update user's `totalEarnings`
- Team earnings are updated accordingly
- Integrates with existing payout system

### Analytics System
- Platform clicks contribute to overall analytics
- Can be filtered and reported alongside internal clicks
- Supports existing analytics dashboard

### User Management
- Links to existing user and team structures
- Maintains user permissions and roles
- Integrates with existing authentication

## Security & Permissions

### Admin Access
- Only admin users can manage platforms
- Only admin users can add/edit platform clicks
- Full CRUD operations on platforms and clicks

### User Access
- Users can view their own platform clicks
- Team admins can view team platform clicks
- Read-only access to personal data

## Testing

Run the test script to verify functionality:
```bash
node test-platform-system.js
```

This will test:
- Platform CRUD operations
- Click management
- Earnings calculations
- Statistics and reporting
- User-specific views

## Benefits

1. **Flexibility**: Support any external platform
2. **Accuracy**: Manual entry ensures data accuracy
3. **Transparency**: Clear tracking of external earnings
4. **Integration**: Seamless integration with existing systems
5. **Scalability**: Easy to add new platforms
6. **Reporting**: Comprehensive analytics and reporting

## Future Enhancements

- **Bulk Import**: Import clicks from CSV files
- **API Integration**: Direct API integration with platforms
- **Automated Sync**: Scheduled synchronization with platforms
- **Advanced Analytics**: Platform-specific performance metrics
- **Rate Management**: Dynamic rate configuration per platform
- **Notification System**: Alerts for new click entries 