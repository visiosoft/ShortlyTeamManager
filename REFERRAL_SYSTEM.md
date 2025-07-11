# Referral System Documentation

## Overview

The referral system allows teams to earn bonuses by referring new users to the platform. Each team gets a unique referral code and link that they can share with others.

## Features

### 1. Unique Referral Codes
- Each team automatically gets a unique 8-character referral code
- Codes are generated using nanoid for uniqueness
- Example: `ABC123XY`

### 2. Referral Links
- Automatic generation of referral links
- Format: `https://shorly.uk/register?ref=ABC123XY`
- Links can be shared on social media, messaging apps, etc.

### 3. Bonus System
- **Signup Bonus**: 1000 PKR for new users who sign up with a referral code
- **Referral Bonus**: 500 PKR for team members who share their referral link
- Bonuses are tracked and displayed in the dashboard

### 4. Tracking & Analytics
- Track total referrals per team
- Track total earnings from referrals
- Individual user referral statistics
- Referral history with timestamps

## API Endpoints

### Backend Endpoints

#### GET `/api/referrals/team-stats`
Get referral statistics for the current team.

**Response:**
```json
{
  "referralCode": "ABC123XY",
  "referralLink": "https://shorly.uk/register?ref=ABC123XY",
  "totalReferrals": 5,
  "totalReferralEarnings": 2500,
  "referralBonuses": [
    {
      "userId": "user_id",
      "amount": 1000,
      "currency": "PKR",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET `/api/referrals/user-stats`
Get referral statistics for the current user.

**Response:**
```json
{
  "totalReferrals": 3,
  "totalReferralEarnings": 1500,
  "referralBonuses": [...],
  "referredBy": "team_id"
}
```

#### GET `/api/referrals/link`
Get the current team's referral link and code.

**Response:**
```json
{
  "referralLink": "https://shorly.uk/register?ref=ABC123XY",
  "referralCode": "ABC123XY"
}
```

#### POST `/api/auth/register-with-referral`
Register a new user with referral code. User joins the referring team.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "referralCode": "ABC123XY"
}
```

**Note:** When using referral registration, users join the referring team and do not create their own team.

## Database Schema Changes

### Team Schema
```typescript
// New fields added to Team schema
referralCode: string; // Unique referral code
totalReferrals: number; // Total referrals count
totalReferralEarnings: number; // Total earnings from referrals
referralBonuses: Array<{
  userId: Types.ObjectId;
  amount: number;
  currency: string;
  createdAt: Date;
}>;
```

### User Schema
```typescript
// New fields added to User schema
referredBy?: Types.ObjectId; // Team that referred this user
totalReferrals: number; // User's total referrals
totalReferralEarnings: number; // User's total referral earnings
referralBonuses: Array<{
  userId: Types.ObjectId;
  amount: number;
  currency: string;
  createdAt: Date;
}>;
```

## Frontend Features

### 1. Referrals Page (`/referrals`)
- Display team referral statistics
- Show user referral statistics
- Copy and share referral links
- View referral history
- Explanation of how the system works

### 2. Enhanced Registration Page
- Support for referral codes in URL parameters
- Visual indication when referral code is applied
- Manual referral code input field
- Bonus information display

### 3. Sidebar Navigation
- New "Referrals" link in the sidebar
- Accessible to all users

## How It Works

### 1. Team Registration
When a team is created:
- A unique referral code is generated
- The team can access their referral link
- Team members can share the link

### 2. User Registration with Referral
When someone signs up using a referral link:
1. User provides referral code during registration
2. System validates the referral code
3. User joins the referring team as a regular member (not admin)
4. User gets 1000 PKR signup bonus
5. Referring team gets 500 PKR referral bonus
6. All bonuses are tracked in the database

### 3. Bonus Distribution
- **Signup Bonus (1000 PKR)**: Goes to the new user's team
- **Referral Bonus (500 PKR)**: Goes to the team that shared the referral link
- Both bonuses are tracked separately for transparency

## Deployment

To deploy the referral system:

```bash
# Make the deployment script executable
chmod +x deploy-referral-system.sh

# Run the deployment
./deploy-referral-system.sh
```

## Testing

### Test Referral Registration
1. Visit `https://shorly.uk/register?ref=TEST123`
2. Complete registration
3. Verify bonuses are applied

### Test Referral Statistics
1. Login to dashboard
2. Navigate to `/referrals`
3. Verify statistics are displayed correctly

### Test Referral Link Sharing
1. Go to referrals page
2. Copy referral link
3. Share with others
4. Verify new registrations are tracked

## Security Considerations

1. **Referral Code Validation**: All referral codes are validated before processing
2. **Duplicate Prevention**: Users cannot use multiple referral codes
3. **Bonus Limits**: Bonuses are applied only once per user
4. **Audit Trail**: All referral activities are logged with timestamps

## Future Enhancements

1. **Multi-level Referrals**: Support for multi-level referral bonuses
2. **Referral Campaigns**: Time-limited referral campaigns with different bonuses
3. **Referral Analytics**: Advanced analytics and reporting
4. **Social Sharing**: Direct integration with social media platforms
5. **Referral Leaderboards**: Public leaderboards for top referrers 