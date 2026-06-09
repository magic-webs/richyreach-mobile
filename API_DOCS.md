# Reelio API Documentation

This document provides a comprehensive overview of all API routes, their input parameters (schemas), and the standardized output structures for the Reelio backend application.

## 1. Global Structure

### 1.1 Base URL
All API routes are prefixed with `/api`. For example: `http://localhost:3000/api/auth/session`

### 1.2 Standard Success Response
All successful responses follow this format unless explicitly returning raw arrays (which is avoided in favor of wrapping them in `data`):
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... } // Optional object containing the response payload
}
```

### 1.3 Standard Error Response
All error responses (4xx, 5xx) follow this format:
```json
{
  "success": false,
  "error": "Detailed error message describing what went wrong"
}
```

---

## 2. Authentication Routes (`/auth`)

### `POST /auth/request-otp`
- **Description**: Request an OTP for login or signup.
- **Input**:
  ```json
  {
    "identifier": "string (email or phone, min 3 chars)",
    "method": "email | whatsapp",
    "mode": "login | signup (optional)"
  }
  ```

### `POST /auth/verify-otp`
- **Description**: Verify the OTP.
- **Input**:
  ```json
  {
    "identifier": "string (email or phone)",
    "code": "string (exactly 6 digits)",
    "role": "influencer | brand | admin (optional)",
    "name": "string (optional)"
  }
  ```

### `POST /auth/logout`
- **Description**: Logs out the current session.
- **Input**: None
- **Requires Auth**: Yes

### `GET /auth/session`
- **Description**: Gets the current active session data.
- **Requires Auth**: Yes

### `POST /auth/whatsapp-webhook`
- **Description**: Webhook endpoint to generate an automatic sign-in magic link for a user verifying via WhatsApp. If the user doesn't exist, it redirects them to the onboarding page.
- **Input**:
  ```json
  {
    "mobileNumber": "string",
    "keyword": "string (must be 'signin' to trigger logic)"
  }
  ```
- **Output**: Returns the URL that the user must click to authenticate automatically or to sign up.
  ```json
  {
    "success": true,
    "message": "Auto signin URL generated",
    "data": {
      "signinUrl": "https://richyreach.expo.app/magic-login?token=...",
      "mobileNumber": "+1234567890",
      "isNewUser": false
    }
  }
  ```

---

## 3. Brand Routes (`/brands`)
*Requires Auth & Brand Role*

### `POST | PUT /brands/profile`
- **Description**: Create or update the brand's profile.
- **Input**:
  ```json
  {
    "companyName": "string (min 2 chars)",
    "website": "string (URL)",
    "logo": "string (URL, optional)",
    "category": "string",
    "description": "string (optional)"
  }
  ```

### `GET /brands/profile`
- **Description**: Get the authenticated brand's profile.

### `GET /brands/dashboard`
- **Description**: Fetch statistics and dashboard metrics.

### `/brands/accounts`
- **`GET /brands/accounts`**: List sub-accounts.
- **`POST /brands/accounts`**: Add a sub-account.
- **`PUT /brands/accounts/:id`**: Update a sub-account.
- **`DELETE /brands/accounts/:id`**: Delete a sub-account.

### `/brands/saved-influencers`
- **`GET /brands/saved-influencers`**: Get saved influencers.
- **`POST /brands/save-influencer`**: Save an influencer.
- **`DELETE /brands/save-influencer/:influencerId`**: Unsave an influencer.

---

## 4. Campaign Routes (`/campaigns`)
*Requires Auth & Brand Role*

### `POST /campaigns/create` | `POST /campaigns/advanced`
- **Description**: Create a new campaign.
- **Input**:
  ```json
  {
    "title": "string (min 5 chars)",
    "description": "string (min 10 chars)",
    "budget": "integer (positive, in cents)",
    "campaignType": "string (e.g. reel, story, post)",
    "targetAudience": "string (optional)",
    "requirements": "string (optional)",
    "expectedReach": "integer (optional)",
    "allowFraction": "boolean (optional)",
    "brandAccountId": "string (optional)",
    "isArena": "boolean (optional)",
    "maxReachCap": "integer (optional)",
    "category": "string (optional)"
  }
  ```

### `PUT /campaigns/:id`
- **Description**: Update an existing campaign.
- **Input**: Same as create campaign schema.

### `DELETE /campaigns/:id`
- **Description**: Delete a campaign.

### `GET /campaigns`
- **Description**: Get a list of campaigns created by the brand.

### `GET /campaigns/:id`
- **Description**: Get specific campaign details.

### `POST /campaigns/invite`
- **Description**: Invite an influencer to a campaign.
- **Input**:
  ```json
  {
    "influencerId": "string",
    "campaignId": "string"
  }
  ```

---

## 5. Influencer Routes (`/influencers`)

### `GET /influencers`
- **Description**: List influencers (Marketplace). Public route, rate-limited.

### `GET /influencers/marketplace-campaigns`
- **Description**: View campaigns open for application.
- **Requires Auth & Influencer Role**

### `GET /influencers/saved-campaigns`
- **Description**: View saved campaigns.

### `/influencers/save-campaign`
- **`POST /influencers/save-campaign`**: Save a campaign.
- **`DELETE /influencers/save-campaign/:campaignId`**: Unsave a campaign.

### `/influencers/accounts`
- **`GET /influencers/accounts`**: List accounts.
- **`POST /influencers/accounts`**: Add an account.
- **`PUT /influencers/accounts/:id`**: Update an account.
- **`DELETE /influencers/accounts/:id`**: Delete an account.

### `/influencers/services`
- **`GET /influencers/services`**: List services offered.
- **`POST /influencers/services`**: Add a service.
- **`PUT /influencers/services/:id`**: Update a service.
- **`DELETE /influencers/services/:id`**: Delete a service.

### `POST | PUT /influencers/profile`
- **Description**: Create or update the influencer's profile.
- **Input**:
  ```json
  {
    "instagramHandle": "string",
    "followers": "integer (optional)",
    "engagementRate": "number (optional)",
    "niche": "string",
    "avgViews": "integer (optional)",
    "pricing": "integer (positive, in cents)",
    "skills": "array of strings (optional)",
    "country": "string (optional)",
    "socialLinks": "object mapping (optional)",
    "portfolioItems": "array of objects with mediaUrl, mediaType, title, description (optional)"
  }
  ```

### `POST /influencers/sync-instagram`
- **Description**: Sync metrics from Instagram.

### `GET /influencers/dashboard`
- **Description**: Get influencer dashboard statistics.

### `GET /influencers/campaigns`
- **Description**: Get list of applied/ongoing campaigns.

### `POST /influencers/apply/:campaignId`
- **Description**: Apply to a campaign.
- **Input**:
  ```json
  {
    "proposal": "string (min 10 chars)",
    "influencerAccountId": "string (optional)"
  }
  ```

### `GET /influencers/earnings` | `GET /influencers/analytics`
- **Description**: Get financial and analytics data.

### `GET /influencers/:id`
- **Description**: Get influencer profile by ID.

---

## 6. Chat Routes (`/chat`)
*Requires Auth*

### `GET /chat/rooms`
- **Description**: Get user's active chat rooms.

### `POST /chat/room`
- **Description**: Create a chat room.
- **Input**:
  ```json
  {
    "influencerId": "string",
    "campaignId": "string (optional)"
  }
  ```

### `POST /chat/admin/room`
- **Description**: Create a chat room with an admin.

### `GET /chat/messages/:roomId`
- **Description**: Get messages for a specific room.

### `POST /chat/message/:roomId`
- **Description**: Send a message to a room.
- **Input**:
  ```json
  {
    "content": "string"
  }
  ```

---

## 7. Calculator Routes (`/calculator`)

### `POST /calculator/reach`
- **Description**: Calculate potential reach based on budget.
- **Input**:
  ```json
  {
    "budget": "number (positive)",
    "influencerTier": "nano | micro | mid | macro | mega | any (default: any)",
    "engagementRate": "number (optional)"
  }
  ```

### `POST /calculator/earnings`
- **Description**: Calculate potential earnings.
- **Input**:
  ```json
  {
    "followers": "integer (positive)",
    "engagementRate": "number (non-negative)",
    "niche": "string"
  }
  ```

---

## 8. Payments & Wallet Routes (`/payments` & `/wallet`)

### `POST /payments/webhook`
- **Description**: Handle external payment webhooks (e.g. Stripe).
- **Input**: Webhook payload structure.

### `POST /payments/create`
- **Description**: Create a checkout session (Brand only).
- **Input**:
  ```json
  {
    "campaignId": "string",
    "amount": "integer (positive, in cents)"
  }
  ```

### `GET /wallet`
- **Description**: Get the authenticated user's wallet balance.

### `POST /wallet/create-order`
- **Description**: Create a top-up order.

### `POST /wallet/verify`
- **Description**: Verify a wallet transaction.

---

## 9. Admin Routes (`/admin`)

- **`GET /admin/users`**: List all users.
- **`GET /admin/campaigns`**: List all campaigns.
- **`GET /admin/reports`**: Get admin reports.
- **`DELETE /admin/user/:id`**: Delete a user.
- **`GET /admin/pending-profiles`**: Get profiles pending verification.
- **`GET /admin/profile/:type/:id`**: View specific profile details.
- **`POST /admin/verify-profile`**: Approve or reject a profile.
- **`POST /admin/update-profile`**: Update user's profile info directly.
- **`GET /admin/campaign-images`**: Retrieve all campaign image templates and their used count.
- **`POST /admin/campaign-images`**: Add a new campaign image template. Supports `multipart/form-data` file upload.
  - **Input (multipart/form-data)**:
    - `category`: string (required)
    - `image`: file (optional — binary upload, stored in Cloudinary under `reelio_campaigns/`)
    - `imageUrl`: string (optional — fallback URL if no file is uploaded)
- **`PUT /admin/campaign-images/:id`**: Edit an existing campaign image template. All fields are optional; at least one must be provided.
  - **Input (multipart/form-data)**:
    - `category`: string (optional)
    - `image`: file (optional — uploads new image to Cloudinary and automatically deletes the old one)
    - `imageUrl`: string (optional — replace URL without a file upload)
- **`DELETE /admin/campaign-images/:id`**: Delete a campaign image template. **Automatically removes the image from Cloudinary.**
- **`GET /admin/trending-songs`**: Retrieve all trending songs.
- **`POST /admin/trending-songs`**: Add a new trending song. Supports `multipart/form-data` file upload.
  - **Input (multipart/form-data)**:
    - `title`: string (required)
    - `artist`: string (required)
    - `instagramAudioUrl`: string (required — Instagram Reels Audio page link)
    - `image`: file (optional — cover image uploaded to Cloudinary under `reelio_songs/`)
    - `imageUrl`: string (optional — fallback cover URL if no file is uploaded)
- **`PUT /admin/trending-songs/:id`**: Edit an existing trending song. All fields are optional; at least one must be provided.
  - **Input (multipart/form-data)**:
    - `title`: string (optional)
    - `artist`: string (optional)
    - `instagramAudioUrl`: string (optional)
    - `image`: file (optional — uploads new cover to Cloudinary and automatically deletes the old one)
    - `imageUrl`: string (optional — replace cover URL without a file upload)
- **`DELETE /admin/trending-songs/:id`**: Delete a trending song. **Automatically removes the cover image from Cloudinary.**

---

## 10. Notification & Arena Routes (`/notifications`, `/arena`)

### `GET /notifications`
- **Description**: List user's notifications.

### `PUT /notifications/read`
- **Description**: Mark notifications as read.

### `/arena`
- **`GET /arena`**: List all arenas.
- **`GET /arena/:id/leaderboard`**: Get arena leaderboard.
- **`POST /arena/:id/join`**: Join an arena.

---

## 11. User Routes (`/users`)

### `GET /users`
- **Description**: List all users.

### `POST /users`
- **Description**: Create a new user.
- **Input**:
  ```json
  {
    "name": "string (min 2 chars)",
    "email": "string (valid email)"
  }
  ```

---

## 12. Waitlist Routes (`/waitlist`)

### `POST /waitlist/join`
- **Description**: Join the early access waitlist.
- **Input**:
  ```json
  {
    "name": "string (min 2 chars)",
    "email": "string (valid email)",
    "role": "creator | brand"
  }
  ```

### `GET /waitlist/count`
- **Description**: Get the total count of waitlist registrations.
- **Input**: None
- **Requires Auth**: No

### `GET /waitlist`
- **Description**: Retrieve all waitlist entries.
- **Requires Auth & Admin Role**: Yes

### `DELETE /waitlist/:id`
- **Description**: Delete a waitlist entry.
- **Requires Auth & Admin Role**: Yes

---

## 13. Swagger OpenAPI Docs

A live swagger documentation interface is automatically generated and served at:
- **`GET /api/docs`**: Swagger HTML User Interface.
- **`GET /api/openapi.json`**: Raw OpenAPI specification file mapping exact parameters as per the OpenAPI standard.

---

## 14. Trending Songs Routes (`/trending-songs`)
*Requires Auth*

### `GET /trending-songs`
- **Description**: Retrieve the list of all trending songs on Instagram.
- **Input**: None
- **Output**: Array of song objects:
  ```json
  [
    {
      "id": "string",
      "title": "string",
      "artist": "string",
      "imageUrl": "string",
      "instagramAudioUrl": "string",
      "createdAt": "timestamp"
    }
  ]
  ```

