# Google OAuth Setup Guide

This application now supports Google OAuth for regular users (not admins). Follow these steps to set up Google OAuth:

## 1. Create Google OAuth Credentials

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" in the left sidebar
5. Click "Create Credentials" → "OAuth 2.0 Client IDs"
6. Choose "Web application" as the application type
7. Add the following authorized redirect URIs:
   - `http://localhost:3009/api/auth/google/callback` (for development)
   - `https://yourdomain.com/api/auth/google/callback` (for production)
8. Copy the Client ID and Client Secret

## 2. Environment Variables

Add the following environment variables to your `.env` file in the backend directory:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3009/api/auth/google/callback

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:3000
```

## 3. How It Works

- **Regular Users Only**: Google OAuth is only available for regular users, not admins
- **Team Assignment**: Google users are automatically assigned to a "Google Users" team
- **Role**: Google users are always created with the "user" role, never "admin"
- **Email Verification**: Google accounts are automatically marked as email verified
- **Password**: Google users don't need passwords since they authenticate via Google

## 4. User Flow

1. User clicks "Sign in with Google" or "Sign up with Google"
2. User is redirected to Google OAuth consent screen
3. After successful authentication, user is redirected back to the application
4. If it's a new user, they're automatically created as a regular user
5. If it's an existing user, they're logged in
6. User is redirected to the dashboard

## 5. Security Notes

- Google OAuth users cannot become admins through the OAuth flow
- Only email/password registration can create admin users
- Google users are automatically assigned to a shared team for easier management
- The Google ID is stored securely and used for future authentication

## 6. Troubleshooting

- Make sure your Google OAuth credentials are correct
- Ensure the redirect URI matches exactly (including protocol and port)
- Check that the Google+ API is enabled in your Google Cloud Console
- Verify that your environment variables are properly set 