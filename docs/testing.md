# FoodBridge — Quality Assurance & Testing Guide

---

## 1. Test Architecture

The testing suite uses **Jest** as the test runner and assertion library, along with **Supertest** for HTTP API integration testing.

- Location: `server/tests/`
- Test Database: Uses isolated test database or in-memory MongoDB connection
- Configuration: `server/package.json` with Jest runner options

---

## 2. Test Suites

### A. Authentication Tests (`server/tests/integration/auth.test.js`)
- ✅ Registration with valid parameters returns JWT and user payload
- ❌ Registration with duplicate email fails with 409 Conflict
- ❌ Registration with password less than 8 characters fails validation
- ✅ Login with correct credentials returns 200 OK and token
- ❌ Login with incorrect password returns 401 Unauthorized
- ✅ Session verification via `GET /api/v1/auth/me` returns current user
- ❌ Request without Bearer token returns 401 Unauthorized

### B. Food Listings Tests (`server/tests/integration/listing.test.js`)
- ✅ Donor creates listing with valid attributes
- ❌ Non-donor role attempting to create listing is rejected (403 Forbidden)
- ❌ Listing with expiration date in the past is rejected (400 Bad Request)
- ✅ Public listing query successfully redacts exact street address
- ✅ Authorized query returns complete address
- ✅ Donor can update title and quantity of an available listing
- ✅ Donor can withdraw an available listing with a reason

### C. Donation Requests & Handover Tests (`server/tests/integration/request.test.js`)
- ✅ Verified NGO submits claim for available food listing
- ❌ Unverified NGO attempting to claim food is rejected
- ❌ Duplicate active claim by same NGO for same listing is prevented
- ✅ Donor accepts claim, returning 6-character pickup code
- ✅ Listing status transitions atomically to `reserved`
- ✅ Handover verified with correct pickup code, completing transaction
- ❌ Handover with invalid pickup code fails
- ❌ Exceeding 5 failed attempts locks verification attempts

---

## 3. Running Test Suites

```bash
# Navigate to server directory
cd server

# Run all test suites
npm test

# Run tests with coverage report
npm test -- --coverage
```
