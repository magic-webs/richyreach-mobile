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
    "maxReachCap": "integer (optional)"
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

## 12. Swagger OpenAPI Docs

A live swagger documentation interface is automatically generated and served at:
- **`GET /api/docs`**: Swagger HTML User Interface.
- **`GET /api/openapi.json`**: Raw OpenAPI specification file mapping exact parameters as per the OpenAPI standard.
