// Detailed knowledge base for the Zero-Waste Food Connect chatbot assistant.
// Each entry has keywords (for scoring), a rich multi-paragraph response, and
// optional follow-up suggestions to guide the conversation.

export const KNOWLEDGE = [
  {
    id: 'greeting',
    keywords: ['hi', 'hello', 'hey', 'start', 'help', 'what can you do', 'assist'],
    score: 0,
    response: `Hello! 👋 Welcome to **Zero-Waste Food Connect** — I'm your platform assistant and I'm here to help!\n\nI can answer questions about:\n• How the platform works\n• How restaurants donate food\n• How NGOs receive and accept donations\n• The verification and registration process\n• Tracking food pickups\n• Who built this project\n\nFeel free to ask anything — I'm happy to give you a detailed explanation!`,
    followUps: ['How does the platform work?', 'How do restaurants donate food?', 'What is the NGO process?'],
  },

  {
    id: 'how_it_works',
    keywords: ['how', 'work', 'platform', 'process', 'flow', 'system', 'explain', 'overview', 'what is', 'about'],
    score: 0,
    response: `**Zero-Waste Food Connect** is a real-time food rescue platform that bridges the gap between restaurants with surplus food and local NGOs who can distribute it to those in need. Here's how it works end-to-end:\n\n**Step 1 — Restaurant Posts Surplus Food**\nA restaurant logs into their dashboard and fills out a quick form with the food title, type, quantity (number of meals), pickup location, and an expiry time. The listing goes live instantly.\n\n**Step 2 — Nearby NGOs Are Notified in Real-Time**\nThe moment a listing is posted, verified NGOs within the delivery radius receive an instant push notification and see the new listing appear on their live dashboard feed, sorted by distance.\n\n**Step 3 — NGO Accepts the Drop**\nAn NGO reviews the listing details and clicks "Accept" with one tap. The listing is immediately marked as accepted, and the restaurant can see who has claimed it.\n\n**Step 4 — Pickup and Confirmation**\nThe NGO travels to the restaurant's pickup location. Once the food is collected, they mark the request as "Picked Up" on the platform, completing the rescue cycle.\n\n**Why This Matters**\nEvery completed rescue prevents perfectly good food from going to waste and instead reaches families and individuals who need it most — typically within the same hour the food was posted.`,
    followUps: ['How do restaurants sign up?', 'How do NGOs get verified?', 'Is the platform free to use?'],
  },

  {
    id: 'restaurant_process',
    keywords: ['restaurant', 'cafe', 'hotel', 'donate', 'post food', 'surplus', 'listing', 'upload', 'kitchen', 'chef'],
    score: 0,
    response: `**How Restaurants Use the Platform**\n\nGetting started as a restaurant is quick and straightforward:\n\n**Registration**\nRestaurants can sign up immediately using their email address. There is no waiting period or approval process — once registered, you can start posting surplus food right away.\n\n**Posting a Food Listing**\nFrom the restaurant dashboard, click "Post New Food" and fill in:\n• **Title** — e.g. "Leftover Biryani & Karahi"\n• **Food Type** — vegetarian, non-vegetarian, etc.\n• **Quantity** — number of meals available\n• **Expiry Time** — when the food must be picked up by\n• **Pickup Location** — your restaurant's address with map coordinates\n• **Notes** — any special handling instructions\n\nThe listing goes live the moment you submit. Nearby NGOs are automatically notified by push notification.\n\n**Managing Your Listings**\nThe restaurant dashboard shows all your active and past listings with their current status:\n• 🟢 Available — waiting for an NGO to accept\n• 🟡 Accepted — an NGO is on their way\n• ✅ Collected — food successfully rescued\n• ⏰ Expired — pickup window passed\n\n**Dashboard Metrics**\nTrack your total meals donated, active listings, successful collections, and rescue history — all in one place.`,
    followUps: ['How do NGOs get notified?', 'How does the tracking work?', 'Is the platform free?'],
  },

  {
    id: 'ngo_process',
    keywords: ['ngo', 'nonprofit', 'charity', 'volunteer', 'accept', 'pickup', 'collect', 'browse', 'feed', 'organization'],
    score: 0,
    response: `**How NGOs Use the Platform**\n\n**Registration & Verification**\nNGOs register by providing their organisation name, contact details, and service area. Unlike restaurants, NGOs must be verified by a platform administrator before they can accept food drops. This ensures food only goes to trusted, legitimate organisations.\n\n**The Verification Queue**\nAfter registration, your application appears in the Admin moderation queue. An administrator reviews your details and approves your account — you'll be able to accept donations as soon as this is done.\n\n**Live Dashboard Feed**\nOnce verified, your NGO dashboard shows a live feed of available food drops sorted by distance from your location. Each listing displays:\n• Food title and type\n• Number of meals available\n• Distance from your location\n• Time remaining before expiry\n• Restaurant name and pickup address\n\n**Accepting a Donation**\nWhen you spot a suitable listing, click "Accept." The platform immediately marks it as accepted and locks it for your organisation. The restaurant is notified that their food has been claimed.\n\n**Pickup and Completion**\nTravel to the restaurant's pickup address before the expiry time. Once you've collected the food, mark the request as "Picked Up" in your dashboard. This logs the completed rescue in your history and updates your lifetime meals-rescued counter.\n\n**Push Notifications**\nEnable push notifications so your team receives an instant alert the moment a nearby restaurant posts surplus — even before you open the app.`,
    followUps: ['How does the verification work?', 'Can I set a service radius?', 'How are listings sorted by distance?'],
  },

  {
    id: 'admin_process',
    keywords: ['admin', 'administrator', 'moderate', 'approve', 'verify', 'reject', 'moderation', 'queue'],
    score: 0,
    response: `**How Platform Administrators Work**\n\nAdministrators are responsible for maintaining the trust and quality of the platform.\n\n**NGO Verification**\nWhen an NGO registers, their application lands in the Admin Moderation Queue. Administrators review the organisation's name, address, phone number, and other submitted details. They can either:\n• ✅ **Approve** — grants the NGO full access to accept food donations\n• ❌ **Reject** — removes the application (the organisation can re-register)\n\n**Why Verification Matters**\nRestaurants trust that the organisations collecting their food are legitimate and will genuinely distribute it to those in need. The admin verification layer ensures that trust is maintained.\n\n**Analytics Dashboard**\nAdmins also have access to a platform-wide analytics view showing key metrics: total meals rescued, active listings, NGO count, restaurant count, and daily rescue trends.`,
    followUps: ['How do NGOs register?', 'How does the platform work overall?'],
  },

  {
    id: 'tracking',
    keywords: ['track', 'status', 'update', 'real-time', 'live', 'monitor', 'notification', 'alert', 'push'],
    score: 0,
    response: `**Real-Time Tracking on Zero-Waste Food Connect**\n\nThe platform is built around real-time visibility so every party always knows the current status of a food drop.\n\n**Status Lifecycle**\nEvery food listing moves through these stages:\n1. **Available** — Just posted; visible to all nearby NGOs\n2. **Accepted** — An NGO has claimed it; countdown to pickup begins\n3. **Collected (Picked Up)** — NGO confirmed pickup; rescue complete\n4. **Expired** — Pickup window passed without a collection\n5. **Cancelled** — Restaurant cancelled the listing\n\n**Push Notifications**\nNGOs can subscribe to browser push notifications. When a restaurant posts food within their service radius, their device receives an instant alert — no need to keep the dashboard open.\n\n**Live Feed Updates**\nThe NGO dashboard live feed updates automatically without page refreshes. New listings appear instantly at the top, sorted by distance. Accepted or expired listings disappear from the feed in real time.\n\n**Restaurant Visibility**\nRestaurants can see on their dashboard exactly when an NGO accepted their listing and who the accepting organisation is, giving full transparency into the rescue chain.`,
    followUps: ['How do NGOs accept a listing?', 'What happens if food is not picked up?', 'How does the platform work?'],
  },

  {
    id: 'free_cost',
    keywords: ['cost', 'price', 'fee', 'pay', 'free', 'charge', 'subscription', 'money'],
    score: 0,
    response: `**Zero-Waste Food Connect is completely free to use.**\n\nThere are no registration fees, subscription charges, or transaction costs for either restaurants or NGOs. The platform is provided as a social impact service — our mission is to rescue as much food as possible, and keeping it free ensures no barriers to participation.\n\n• 🍽️ **Restaurants** — Free to register, free to post unlimited listings\n• 🤝 **NGOs** — Free to register and accept all food drops\n• 📱 **Push notifications** — Included at no cost\n\nThe goal is maximum impact, not profit.`,
    followUps: ['How do restaurants sign up?', 'How do NGOs register?', 'How does the platform work?'],
  },

  {
    id: 'food_waste',
    keywords: ['waste', 'reduce', 'environment', 'impact', 'sustainability', 'hunger', 'community', 'benefit', 'why'],
    score: 0,
    response: `**How Zero-Waste Food Connect Reduces Food Waste**\n\nFood waste is one of the most pressing environmental and social challenges — millions of tonnes of perfectly edible food are discarded every year while millions of people go hungry.\n\n**The Problem We Solve**\nRestaurants often prepare more food than they sell during a service. At the end of the day, that surplus has nowhere to go — and without a fast, reliable channel to redirect it, it ends up in the bin.\n\n**Our Approach**\n• **Speed** — listings are live within seconds of posting; NGOs are notified instantly\n• **Trust** — only verified NGOs can accept donations, ensuring food reaches real communities\n• **Simplicity** — restaurants post in under a minute; NGOs accept with one tap\n• **Transparency** — full status tracking from posting to collection\n\n**The Impact**\nEvery successful rescue means:\n✅ A restaurant avoids waste disposal costs\n✅ An NGO gets food without spending limited funds\n✅ Families in need receive a nutritious meal\n✅ Less food ends up in landfill, reducing methane emissions\n\nThe platform has already facilitated thousands of meal rescues across Lahore, with more restaurants and NGOs joining every week.`,
    followUps: ['How does the platform work?', 'Is the platform free?', 'Who created this project?'],
  },

  {
    id: 'registration',
    keywords: ['register', 'sign up', 'join', 'create account', 'get started', 'onboard', 'new user'],
    score: 0,
    response: `**How to Register on Zero-Waste Food Connect**\n\nRegistration is fast and differs slightly based on your role:\n\n**For Restaurants** 🍳\n1. Click "Register as Restaurant" on the homepage\n2. Enter your email, password, restaurant name, phone number, and address\n3. Your account is activated immediately — no waiting period\n4. Log in and start posting surplus food right away\n\n**For NGOs** 🤝\n1. Click "Register as NGO" on the homepage\n2. Enter your organisation's name, email, password, phone, and service area\n3. Your application is submitted to the Admin verification queue\n4. An administrator reviews and approves your account\n5. Once approved, you can browse and accept food drops\n\n**Note for NGOs:** The verification step is important to maintain trust on the platform. Restaurants need confidence that the organisations collecting their food are legitimate. Approval is typically processed promptly.`,
    followUps: ['What is the NGO verification process?', 'How does the restaurant dashboard work?', 'Is it free to join?'],
  },

  {
    id: 'location',
    keywords: ['location', 'distance', 'radius', 'nearby', 'map', 'area', 'zone', 'service area', 'km', 'kilometer'],
    score: 0,
    response: `**Location & Distance Features**\n\n**For NGOs**\nThe platform uses your device's GPS to show food listings sorted by distance — the closest drops appear first. Your NGO can also set a custom **service radius** (in kilometres) so your dashboard only shows listings within your operational area.\n\n**For Restaurants**\nWhen you post a food listing, the pickup location is mapped using your restaurant's coordinates. Only NGOs within a reasonable distance receive notifications, ensuring the food can realistically be collected.\n\n**The Map View**\nThe NGO dashboard includes an interactive map showing all nearby available listings as markers. Your location is shown at the centre, and you can see at a glance which drops are closest and in which direction.\n\n**Push Notification Targeting**\nThe notification system only alerts NGOs who are geographically close enough to make the pickup feasible before the food expires. This prevents irrelevant notifications to distant organisations.`,
    followUps: ['How do push notifications work?', 'How does the NGO dashboard work?', 'How does the platform work?'],
  },

  {
    id: 'creator_team',
    keywords: ['creator', 'created', 'team', 'who made', 'who built', 'ayesha', 'amna', 'developer', 'founder', 'author'],
    score: 0,
    response: `**About the Team Behind Zero-Waste Food Connect**\n\nThis platform was conceptualised and built by **Ayesha Shafieq** and **Amna Kashief** — two passionate Full Stack Developers and Software Engineers.\n\nDriven by a desire to make a real difference in their community, they developed Zero-Waste Food Connect as their Final Year Project to directly address two interconnected problems in Lahore and beyond:\n\n1. **Restaurant food waste** — surplus meals going to landfill every night\n2. **Food insecurity** — families and individuals in need lacking access to nutritious meals\n\nThe platform is the result of their dedication to combining technology with social impact, creating a practical, scalable solution that is already helping restaurants and NGOs across the city work together more effectively.`,
    followUps: ['What is the mission of the platform?', 'How does the platform work?', 'How does it reduce food waste?'],
  },

  {
    id: 'expiry',
    keywords: ['expiry', 'expire', 'expired', 'time limit', 'deadline', 'cancel', 'window', 'pickup time'],
    score: 0,
    response: `**Food Expiry and Pickup Windows**\n\nEvery food listing on the platform has an **expiry time** set by the restaurant — this is the latest time by which the NGO must collect the food.\n\n**How Expiry Works**\n• The restaurant sets the expiry when posting (e.g. "must be picked up by 10:00 PM")\n• NGOs can see the remaining time on every listing\n• The platform automatically marks listings as **Expired** once the deadline passes\n• Expired listings are removed from the NGO's live feed\n\n**Why This Matters**\nFood safety is paramount. The expiry time ensures that food is only redistributed while it is still fresh and safe to consume. NGOs should only accept listings they can realistically collect within the available window.\n\n**If Food Is Not Picked Up**\nIf a listing expires without being collected, it is marked as expired in the restaurant's dashboard. The restaurant can see this in their metrics. While unfortunate, the data helps restaurants better plan future postings (e.g. posting earlier in the evening when NGOs have more time to respond).`,
    followUps: ['How does the status tracking work?', 'How do NGOs accept a listing?', 'How does the platform work?'],
  },

  {
    id: 'restrictions',
    keywords: ['tech', 'stack', 'framework', 'api', 'react', 'node', 'database', 'architecture', 'implementation', 'code', 'deploy', 'built with', 'technology', 'backend', 'frontend'],
    score: 0,
    isRestricted: true,
    response: `I'm here specifically to help you navigate the **Zero-Waste Food Connect** platform — how it works, how to register, and how the food rescue process operates.\n\nI'm not able to discuss internal technical implementation details, frameworks, or architectural decisions.\n\nIs there something about the platform's features or workflows I can help you with instead?`,
    followUps: ['How does the platform work?', 'How do restaurants donate food?', 'What is the NGO process?'],
  },

  {
    id: 'fallback',
    keywords: [],
    score: -1,
    response: `That's a great question! I want to make sure I give you the most helpful answer possible.\n\nI specialise in explaining the **Zero-Waste Food Connect** platform. Here are some topics I can help with:\n\n• 🍽️ How the platform works end-to-end\n• 🏪 How restaurants post and manage food donations\n• 🤝 How NGOs register, get verified, and accept food drops\n• 📍 Location-based matching and notifications\n• 📊 Dashboard features and status tracking\n• ✅ The registration process for both roles\n• 🌱 How the platform reduces food waste\n\nCould you rephrase your question, or pick one of the topics above?`,
    followUps: ['How does the platform work?', 'How do restaurants donate food?', 'What is the NGO process?'],
  },
];

const RESTRICTED_WORDS = ['tech', 'stack', 'framework', 'api', 'react', 'node', 'database', 'architecture', 'implementation', 'code', 'deploy', 'built with', 'technology'];

/**
 * Score-based topic matcher. Returns the KNOWLEDGE entry with the most keyword
 * matches for the given input string. This avoids the "first match wins" bug
 * of the previous linear scan where an ambiguous question like "how do NGOs
 * work" would hit the generic "how it works" entry instead of the NGO entry.
 */
export function getBotResponse(input) {
  const lower = input.toLowerCase();

  // Hard gate on restricted terms
  if (RESTRICTED_WORDS.some((w) => new RegExp(`\\b${w}\\b`, 'i').test(lower))) {
    const restricted = KNOWLEDGE.find((k) => k.id === 'restrictions');
    return restricted;
  }

  // Score every non-restricted, non-fallback entry
  const scored = KNOWLEDGE
    .filter((k) => !k.isRestricted && k.id !== 'fallback')
    .map((k) => {
      const score = k.keywords.reduce((acc, word) => {
        return acc + (new RegExp(`\\b${word}\\b`, 'i').test(lower) ? 1 : 0);
      }, 0);
      return { ...k, score };
    })
    .filter((k) => k.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) return scored[0];

  return KNOWLEDGE.find((k) => k.id === 'fallback');
}

export const INITIAL_SUGGESTIONS = [
  'How does the platform work?',
  'How do restaurants donate food?',
  'What is the NGO process?',
  'How is food waste reduced?',
  'Who created this project?',
];
