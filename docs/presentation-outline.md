# FoodBridge — Final-Year Project Presentation & Defense Deck

A curated 12-slide presentation structure designed for maximum marks during project evaluation, viva voce, and defense committees.

---

### Slide 1: Title & Team Credentials
- **Title:** FoodBridge — Real-Time Surplus Food Redistribution Platform
- **Subtitle:** Solving Urban Food Waste Through Concurrency-Locked Logistics & Cryptographic Handover
- **Team Members & Roll Numbers:** [Member 1, Member 2, Member 3, Member 4]
- **Project Supervisor:** [Professor / Advisor Name]
- **Department & University:** Department of Computer Science & Engineering

### Slide 2: Problem Statement & Motivation
- **The Global Paradox:** 1.3 billion tons of food wasted annually while 800+ million face hunger.
- **Urban Bottleneck:** Restaurants and banquet halls discard edible meals because local shelters cannot coordinate instant pickups.
- **Failure of Current Approaches:** WhatsApp groups and honor systems suffer from double-claiming, expired food deliveries, and zero verifiable audit trails.

### Slide 3: Proposed Solution
- **Real-Time Surplus Marketplace:** Donors post perishable batches with expiration countdowns.
- **Atomic Multi-Document Reservation:** Concurrency-safe claiming eliminates double-booking.
- **Cryptographic Pickup Code:** Verifiable one-time code generated for donors, entered by couriers upon physical handover.
- **Unit-Disaggregated Impact:** Scientifically accurate metrics (kg, servings, boxes separated).

### Slide 4: System Architecture & Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS, React Router v6, Lucide Icons, Leaflet
- **Backend:** Node.js, Express.js REST API (`/api/v1`)
- **Database:** MongoDB with Mongoose ODM (Geospatial indexing + ACID transactions)
- **Security:** JWT, Bcrypt, Zod schema validation, Helmet, Rate Limiting

### Slide 5: Core Entity Relational Design & State Machine
- Showcase the Food Donation Lifecycle state diagram:
  - `Available` → `Reserved` → `In Transit` → `Completed / Disputed`
- Highlight partial unique indexing for duplicate claim prevention.

### Slide 6: Key Technical Challenge #1 — Race Conditions & Atomic Locking
- **The Problem:** Two NGOs click "Claim Food" simultaneously.
- **Our Solution:** MongoDB multi-document ACID transactions with status condition verification: `{ _id: id, status: 'available' }`.
- **Outcome:** Guarantees absolute consistency without over-committing surplus.

### Slide 7: Key Technical Challenge #2 — Handover Verification & Fraud Prevention
- **The Problem:** Delivery disputes where couriers or donors claim handovers occurred when food was lost or taken.
- **Our Solution:**
  1. Plaintext 6-character code shown once to donor upon claim acceptance.
  2. One-way bcrypt hash stored in MongoDB.
  3. Courier enters code at physical pickup site.
  4. Max 5 failed attempts prevents brute force.

### Slide 8: Role-Based User Portals & Features
- **Donor Portal:** Instant surplus posting, image uploads, incoming claim approvals.
- **NGO / Shelter Portal:** Real-time food discovery, distance filters, claim management.
- **Volunteer Courier Portal:** Turn-by-turn route details, pickup coordinator.
- **Admin Portal:** Charity tax ID verifications, content moderation, immutable audit trail.

### Slide 9: Live Application Demonstration
- *Demo Flow:*
  1. Login with pre-seeded demo accounts (using 1-click buttons).
  2. Green Bistro posts 25 hot meal servings with a 4-hour countdown.
  3. Hope Haven NGO claims the meals.
  4. Donor accepts claim → Pickup code generated.
  5. Volunteer verifies handover using code → Immediate completion recorded on dashboard!

### Slide 10: Testing, Verification & Benchmarks
- Automated integration test suite using **Jest** and **Supertest**.
- Tests covering Auth, Listing lifecycle, and Handover security.
- Sub-50ms API response times under standard load.

### Slide 11: Future Roadmap
- Predictive ML models to forecast restaurant surplus patterns.
- Automated volunteer dispatch using Dijkstra's multi-stop optimization.
- Mobile application with offline GPS mode.

### Slide 12: Conclusion & Q&A
- Summary of impact: High accountability, zero double-claiming, verified nourishment.
- Thank You to the Evaluation Committee.
- Open for Questions & Technical Defense.
