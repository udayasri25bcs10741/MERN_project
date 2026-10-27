# FoodBridge — API Specification

**Base URL:** `/api/v1`  
**Authentication:** HTTP Authorization Header `Bearer <JWT_TOKEN>`  
**Response Format:** Standard JSON `{ "success": boolean, "message"?: string, "data"?: any, "error"?: any }`

---

## 1. Authentication (`/auth`)

### `POST /auth/register`
Creates a new user account.
- **Request Body:**
  ```json
  {
    "name": "Sarah Connor",
    "email": "sarah@example.com",
    "password": "Password123!",
    "phone": "+1 555-0199",
    "role": "organization_donor",
    "organizationName": "Sarah's Bakery",
    "registrationNumber": "TAX-889922",
    "address": {
      "address": "123 Main St",
      "city": "Springfield",
      "state": "IL",
      "postalCode": "62701"
    }
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": { "_id": "...", "name": "...", "email": "...", "role": "..." }
    }
  }
  ```

### `POST /auth/login`
Authenticates existing user.
- **Request Body:** `{ "email": "...", "password": "..." }`
- **Response (200 OK):** `{ "success": true, "data": { "token": "...", "user": { ... } } }`

### `GET /auth/me`
Fetches current session user profile. Requires JWT.
- **Response (200 OK):** `{ "success": true, "data": { "user": { ... } } }`

---

## 2. Food Listings (`/listings`)

### `GET /listings`
Public discovery stream of surplus food donations.
- **Query Parameters:**
  - `status`: Filter by status (`available`, `reserved`, `completed`, `expired`, `withdrawn`). Default: `available`
  - `category`: Category enum filter
  - `city`: Case-insensitive city search
  - `search`: Keyword search in title/description
  - `page`: Integer (default: 1)
  - `limit`: Integer (default: 10)
  - `lat`, `lng`, `radius`: Optional geospatial proximity filter (in km)
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "listings": [ ... ],
      "pagination": { "page": 1, "limit": 10, "totalPages": 3, "total": 24 }
    }
  }
  ```

### `GET /listings/:id`
Retrieves single listing details.
- **Privacy Enforcement:** Exact street address is automatically redacted for unauthenticated users or users with pending verification.
- **Response (200 OK):** `{ "success": true, "data": { "listing": { ... } } }`

### `POST /listings`
Creates a surplus food donation. Multipart Form-Data or JSON. Requires `donor` role (`household_donor` or `organization_donor`).
- **Form / JSON Fields:**
  - `title`: String (3-120 chars)
  - `description`: String (10-1000 chars)
  - `category`: Enum (`cooked_meals`, `bakery`, `packaged_food`, `fruits_vegetables`, `canned_goods`, `dry_groceries`, `other`)
  - `quantity`: Number (positive)
  - `unit`: Enum (`meals`, `kilograms`, `boxes`, `packages`, `items`, `grams`)
  - `availableFrom`: ISO Date (defaults to now)
  - `collectionDeadline`: ISO Date (must be in the future)
  - `storageCondition`: Enum (`ambient`, `refrigerated`, `frozen`)
  - `allergenStatus`: Enum (`none`, `contains`, `free_from`, `unknown`)
  - `allergenInformation`: String (optional allergen details)
  - `pickupAddress`: String (10-300 chars)
  - `latitude`, `longitude`: Numbers (optional coordinates)
  - `image`: Binary file (JPEG/PNG/WEBP, max 5MB, optional)
- **Response (201 Created):** `{ "success": true, "data": { "listing": { ... } } }`

### `PUT /listings/:id`
Updates an available listing. Requires ownership.
- **Response (200 OK):** `{ "success": true, "data": { "listing": { ... } } }`

### `PATCH /listings/:id/withdraw`
Withdraws surplus food.
- **Request Body:** `{ "reason": "Food spoiled before pickup" }`
- **Response (200 OK):** `{ "success": true, "message": "Listing withdrawn" }`

---

## 3. Donation Requests & Coordination (`/requests`)

### `POST /listings/:listingId/requests`
Claims a surplus listing. Requires verified NGO role.
- **Request Body:**
  ```json
  {
    "requestedQuantity": 10,
    "message": "We have 30 residents needing evening dinner."
  }
  ```
- **Response (201 Created):** `{ "success": true, "data": { "request": { ... } } }`

### `PATCH /requests/:id/decision`
Donor accepts or declines an NGO claim.
- **Atomic Operation:** When accepted, locks the listing status to `reserved` and issues a bcrypt-hashed one-time pickup code.
- **Request Body:**
  ```json
  {
    "decision": "accepted", // or "rejected"
    "scheduledPickupAt": "2026-10-28T18:00:00.000Z" // optional
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Request accepted successfully",
    "data": {
      "request": { ... },
      "pickupCode": "A8C2E9F1",
      "pickupCodeNote": "Keep this secret. Give it to the courier only upon physical handover."
    }
  }
  ```

### `POST /requests/:id/confirm-pickup`
Verifies pickup code and completes the handover.
- **Rate-Limited:** Max 5 incorrect attempts.
- **Request Body:**
  ```json
  {
    "pickupCode": "A8C2E9",
    "notes": "Handover in good condition"
  }
  ```
- **Response (200 OK):** `{ "success": true, "message": "Pickup confirmed successfully" }`

### `POST /requests/:id/dispute`
Flags a delivery problem.
- **Request Body:**
  ```json
  {
    "reason": "Food spoiled upon arrival",
    "disputeType": "food_quality_issue"
  }
  ```
- **Response (200 OK):** `{ "success": true, "message": "Dispute reported" }`

---

## 4. Dashboards & Analytics (`/dashboard`)

- `GET /dashboard/donor`: Aggregates active surplus, completed donations, and unit-disaggregated volume.
- `GET /dashboard/ngo`: Aggregates claimed volume, upcoming pickups, and completed deliveries.
- `GET /dashboard/volunteer`: Aggregates active assigned missions and delivery records.
- `GET /dashboard/admin`: Complete platform KPIs, user distribution, and security events.

---

## 5. Administration (`/admin`)

- `GET /admin/verifications`: Retrieves organization verification queue.
- `PATCH /admin/verifications/:id`: Approves or rejects organization credentials.
- `GET /admin/listings`: Full listing directory for moderation.
- `PATCH /admin/listings/:id/moderate`: Hides or restores listings.
- `GET /admin/users`: User directory.
- `PATCH /admin/users/:id/status`: Suspends or reactivates accounts.
- `GET /admin/audit-logs`: Immutable system audit trail.
