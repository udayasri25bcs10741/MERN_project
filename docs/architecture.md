# FoodBridge — System Architecture & Architecture Decision Records (ADRs)

---

## 1. Architectural Patterns

FoodBridge is designed around **Layered Architecture** and **Domain-Driven Service Separation**:

1. **Routing Layer (`routes/`):** Defines clean REST interfaces and applies authentication, role-based authorization, and schema validation.
2. **Controller Layer (`controllers/`):** Handles HTTP extraction, response envelopes, and maps HTTP status codes.
3. **Service Layer (`services/`):** Encapsulates core business logic, database transactions, and domain rules. Controllers never call Mongoose models directly.
4. **Data Access Layer (`models/`):** Enforces data schemas, relationships, constraints, and custom instance methods.

---

## 2. Key Architecture Decision Records (ADRs)

### ADR 01: Atomic Multi-Document Transactions for Listing Reservations
- **Context:** Multiple NGOs could simultaneously attempt to claim the same surplus listing. In a distributed or concurrent environment, simple read-then-write updates lead to race conditions and double-allocation.
- **Decision:** When a donor accepts an NGO request, the transition from `available` to `reserved` is executed inside a **MongoDB ACID transaction**. The update query includes `{ _id: listingId, status: 'available' }`. If another process modified the status, the transaction aborts and returns an HTTP 409 Conflict.
- **Consequences:** Eliminates double-booking of perishable donations. Requires MongoDB replica set or Atlas.

### ADR 02: One-Time Cryptographic Handover Codes
- **Context:** Standard food donation platforms rely on honor systems or basic check-in buttons, leading to lost food and unverifiable claims.
- **Decision:** A 6-character cryptographic pickup code is generated upon donation acceptance. The code is hashed with **bcrypt** and stored in the database. The donor sees the plaintext code once. The courier must physically obtain and enter this code upon collection.
- **Consequences:** Complete non-repudiation of food handovers. Maximum 5 failed attempts allowed before locking.

### ADR 03: Unit-Disaggregated Impact Aggregation
- **Context:** Typical beginner projects sum up numerical quantities across different units (e.g. 50 kg + 30 servings + 10 boxes = 90 ???).
- **Decision:** The MongoDB aggregation pipeline groups impact strictly by `{ unit: "$unit" }`. Analytics displays separate totals for kilograms, servings, packets, and boxes.
- **Consequences:** Scientifically valid impact reporting suitable for ESG compliance and food rescue auditing.

### ADR 04: Public Listing Privacy Redaction
- **Context:** Donors (especially household individuals) do not want their exact street address published publicly on an open internet map.
- **Decision:** Public listing API queries automatically redact `pickupLocation.address` and `pickupLocation.instructions`, exposing only city and postal code. The full street address is populated only after a claim is officially accepted by the donor.
- **Consequences:** Protects individual donor privacy while still enabling neighborhood-level discovery.

---

## 3. Security Model

1. **Password Protection:** Passwords hashed with `bcryptjs` using a salt work factor of 10.
2. **JWT Authentication:** Signed JSON Web Tokens with a 7-day expiration.
3. **RBAC (Role-Based Access Control):** Enforced via `authorize(...roles)` middleware.
4. **Input Sanitization:** Strict Zod schema validation on all incoming request bodies.
5. **Rate Limiting:** Express rate limiters protect authentication endpoints against brute force.
6. **HTTP Security Headers:** Integrated `helmet` middleware.
