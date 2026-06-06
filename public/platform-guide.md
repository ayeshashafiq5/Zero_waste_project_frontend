# Zero-Waste Food Connect — Platform Guide

## Project Overview

Zero-Waste Food Connect is a real-time food rescue platform that bridges the gap between restaurants with surplus food and local NGOs who can distribute it to people in need. The platform enables restaurants to post surplus meals and notifies nearby NGOs instantly so food reaches communities within hours — not days.

**Mission:** Not a lack of food, but a lack of connection. This platform closes that gap.

---

## Platform Workflow

The complete rescue cycle happens in four steps:

1. **Restaurant Posts Surplus Food** — A restaurant logs into their dashboard and fills out a quick form with the food title, type, quantity (number of meals), pickup location, and an expiry time. The listing goes live instantly.

2. **Nearby NGOs Are Notified in Real-Time** — The moment a listing is posted, verified NGOs within the service radius receive an instant push notification and see the new listing appear on their live dashboard feed, sorted by distance from their location.

3. **NGO Accepts the Drop** — An NGO reviews the listing details and clicks "Accept" with one tap. The listing is immediately marked as accepted and locked for that organisation. The restaurant sees who has claimed it.

4. **Pickup and Confirmation** — The NGO travels to the restaurant's pickup location and collects the food before the expiry time. Once collected, they mark the request as "Picked Up" on the platform, completing the rescue cycle. Their lifetime meals-rescued counter updates.

---

## Restaurant Process

### Registration
Restaurants sign up using their email address and are activated immediately — no waiting period or admin approval required. They can start posting surplus food right away.

### Posting a Food Listing
From the restaurant dashboard, click **Post New Food** and fill in:
- **Title** — e.g. "Leftover Biryani & Karahi"
- **Food Type** — vegetarian, non-vegetarian, vegan
- **Quantity** — number of meals available
- **Expiry Time** — pickup deadline (must be in the future)
- **Pickup Location** — address with map coordinates
- **Notes** — optional handling instructions
- **Photo** — optional image of the food

The listing goes live the moment it is submitted. Nearby verified NGOs are automatically notified by push notification.

### Listing Status Lifecycle
- **Available** — Posted and waiting for an NGO to accept
- **Accepted** — An NGO has claimed it and is on their way
- **Collected** — Food successfully rescued and distributed
- **Expired** — Pickup window passed without a collection
- **Cancelled** — Restaurant cancelled the listing

### Dashboard Metrics
The restaurant dashboard tracks: total meals donated, active listings, successful collections, expired listings, and the complete history of past postings.

---

## NGO Process

### Registration and Verification
NGOs register by providing their organisation name, email, contact details, and service area. Unlike restaurants, NGOs must be **verified by a platform administrator** before they can accept food drops. This ensures food only reaches trusted, legitimate organisations.

After registration, the application appears in the Admin Moderation Queue. An administrator reviews the details and approves the account. Once approved, the NGO can browse and accept all available food drops.

### Live Dashboard Feed
Once verified, the NGO dashboard shows a live feed of available food drops sorted by distance from the NGO's location. Each listing shows:
- Food title and type
- Number of meals available
- Distance from the NGO's location
- Time remaining before the pickup deadline expires
- Restaurant name and pickup address

### Accepting a Donation
When a suitable listing is found, click **Accept**. The platform immediately marks it as accepted and locks it for your organisation. The restaurant is notified that their food has been claimed. Only one NGO can accept each listing — the system prevents duplicate claims automatically.

### Pickup and Completion
Travel to the restaurant's pickup address before the expiry time. Once the food is collected, mark the request as **Picked Up** in the dashboard. This logs the completed rescue in the history and updates the lifetime meals-rescued counter.

### Push Notifications
Enable push notifications so the team receives an instant alert the moment a nearby restaurant posts surplus — even when the dashboard is not open. Notifications can be enabled from the dashboard notification panel.

### Service Radius
NGOs can set a custom service radius (in kilometres) in their profile so the dashboard and notifications only cover listings within their operational area.

---

## Admin Process

### NGO Verification Queue
When an NGO registers, their application lands in the Admin Moderation Queue. Administrators review the organisation's name, address, phone number, and other submitted details and can either:
- **Approve** — grants the NGO full access to accept food donations
- **Reject** — removes the application (the organisation can re-register with corrected details)

### Platform Analytics
Admins have access to a platform-wide analytics view showing key metrics: total meals rescued, active listings, NGO count, restaurant count, and daily rescue trends.

---

## User Flow

### New Restaurant
1. Visit the homepage → click **Register as Restaurant**
2. Fill in email, password, restaurant name, phone, and address
3. Account is activated immediately
4. Log in → click **Post New Food** to create the first listing
5. NGOs in the area receive instant alerts
6. Track listing status on the dashboard

### New NGO
1. Visit the homepage → click **Register as NGO**
2. Fill in organisation name, email, password, phone, and service area
3. Wait for admin verification (usually processed quickly)
4. Once approved, log in → browse the live feed
5. Enable push notifications for instant alerts
6. Accept a listing → travel to pickup location → mark as collected

### Returning User (Restaurant or NGO)
1. Visit the homepage → click **Login**
2. Enter email and password
3. Automatically redirected to the correct dashboard based on role
4. All listings, history, and stats are pre-loaded

---

## Chatbot Knowledge Base

The platform assistant answers questions about:

**Platform Overview**
Zero-Waste Food Connect is a real-time food rescue platform. Restaurants post surplus meals; nearby NGOs get instant push alerts and can accept and collect the food within hours. Every completed rescue prevents food waste and feeds people in need.

**How It Works**
Three steps: (1) Restaurant posts surplus food with title, quantity, expiry, and pickup location. (2) Nearby verified NGOs receive instant push notifications and see the listing on their live feed. (3) NGO accepts and collects the food, then marks it as picked up.

**For Restaurants**
Free to register. No approval needed. Post in under 60 seconds. Dashboard shows all listings and lifetime impact metrics. Nearby NGOs are automatically notified.

**For NGOs**
Must register and be verified by an admin before accepting donations. Once verified, browse a real-time feed sorted by distance. Enable push notifications for instant alerts. Accept with one tap. Mark collected after pickup.

**Registration**
Restaurants: instant activation. NGOs: admin verification required after registration. Both are completely free.

**Verification**
Only NGOs require verification. This ensures restaurants trust that the organisations collecting their food are legitimate and will genuinely distribute it to those in need.

**Real-Time Features**
The live feed updates automatically without page refreshes. New listings appear instantly. Push notifications alert NGOs the moment food is posted nearby.

**Tracking**
Every listing moves through: Available → Accepted → Collected (or Expired/Cancelled). Both restaurants and NGOs can see the current status at all times.

**Food Expiry**
Restaurants set a pickup deadline when posting. Listings are automatically marked expired once the deadline passes. This ensures food safety — only food that is still fresh and safe to consume is redistributed.

**Cost**
Completely free for both restaurants and NGOs. No registration fees, no subscription costs, no transaction charges.

**Location & Distance**
The platform uses the NGO's GPS location to show listings sorted by distance. Notifications are only sent to NGOs who are geographically close enough to make pickup feasible.

**Impact**
Every successful rescue: prevents a restaurant from discarding food, saves an NGO from spending limited funds on meals, feeds families in need, and reduces food going to landfill.

**Restricted Topics**
The assistant does not discuss internal technology, frameworks, APIs, databases, deployment, source code, or any implementation details. Questions about these topics receive a friendly redirect to platform features.

**Irrelevant Questions**
For questions unrelated to the platform, the assistant provides a polite response and redirects the user to topics it can help with: how the platform works, restaurant process, NGO process, registration, tracking, or the mission.
