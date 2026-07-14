# RichyReach Mobile App 📱

RichyReach is a premium marketplace and gamified collaboration platform connecting influencers/creators and brands. Built on a modern mobile stack, it provides a seamless dual-role experience for managing social campaigns, participating in challenges, and facilitating real-time transactions.

---

## 🚀 Key Features

### 🔄 Seamless Role Switching
- **Dual-role Experience**: Toggle between **Brand** and **Influencer** profiles instantly within a single application.
- **Dynamic Dashboards**: Displays tailored statistics, campaigns, and tools based on the currently active profile role.

### 🤳 For Influencers (Creators)
- **Profile Customization**: Manage categories, bios, and link/authenticate social media accounts (like Instagram).
- **Marketplace**: Browse live brand campaigns, submit applications with custom bids (pricing, number of reels, stories), and negotiate counter-offers.
- **Collaboration Workspace**: Track your active collaborations, upload draft scripts, submit videos/reels for approval, and share published links.
- **Trending Audio**: Keep up with the latest viral songs and audio tracks to boost reach on Instagram Reels.
- **Wallet & Earnings**: View real-time cash and coin balances, track history, and request secure withdrawals.

### 🏢 For Brands
- **Campaign Creator**: Post marketing campaigns with templates, outline required deliverables (reels, stories), specify budget, and invite creators.
- **Review & Feedback System**: Review scripts and videos submitted by influencers. Provide precise text inputs or upload voice feedback.
- **Budget & Wallet (Razorpay)**: Deposit coins securely using the integrated Razorpay payment gateway to pay for campaigns.
- **Direct Orders**: Browse pre-configured packages/services offered by influencers and order them directly.

### 🏆 The Arena (Gamified Challenges)
- **Reel Reach**: Influencers join reach-based performance challenges to compete for top positions.
- **Google Reviews**: Influencers write review submissions to earn coins and rewards.
- **Leaderboards**: Live rankings of creators based on participation metrics.
- **Smart Tools**: Generate reviews automatically utilizing AI-powered templates.

### 💬 Communication & Infrastructure
- **Real-time Chat**: Fully featured chat rooms between brands and influencers supporting text messages, voice notes, attachments, reply threads, and direct campaign invites.
- **Push Notifications**: Receive instant alerts for message replies, campaign statuses, bid offers, and payments.
- **Referral System**: Invite new users to the platform, earn referral points, and convert them to coins.

---

## 🛠️ Technology Stack

- **Framework**: [Expo SDK 57](https://expo.dev) with [React Native](https://reactnative.dev)
- **Navigation & Routing**: [Expo Router](https://docs.expo.dev/router/introduction) (file-based routing under `src/app`)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (global store caching)
- **Data Fetching**: [TanStack React Query](https://tanstack.com/query/latest) (query caching, offline support, caching)
- **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) and [Lottie](https://github.com/lottie-react-native/lottie-react-native)
- **Styling**: Sleek modern UI built with glassmorphism, linear gradients (`expo-linear-gradient`), custom bottom sheets (`@gorhom/bottom-sheet`), and responsive icons (`@hugeicons/react-native` and `lucide-react-native`)
- **Payments**: Integrated with [Razorpay SDK](https://github.com/razorpay/react-native-razorpay)

---

## 📂 Project Structure

All source code resides inside the `src/` directory:
- [src/app](file:///d:/development/magicwebs/RichyReach/richyreach-mobile/src/app): File-based routing system (contains `(auth)`, `(tabs)`, and specific routes like `collab`, `brand`, `arena`, `profile`)
- [src/components](file:///d:/development/magicwebs/RichyReach/richyreach-mobile/src/components): Reusable UI components grouped by feature (home, brand, influencer, ui)
- [src/constants](file:///d:/development/magicwebs/RichyReach/richyreach-mobile/src/constants): Global styling definitions and brand colors
- [src/data](file:///d:/development/magicwebs/RichyReach/richyreach-mobile/src/data): Mock datasets for development
- [src/hooks](file:///d:/development/magicwebs/RichyReach/richyreach-mobile/src/hooks): Custom hooks for media capture, gestures, etc.
- [src/lib](file:///d:/development/magicwebs/RichyReach/richyreach-mobile/src/lib): API integration clients, local storage helpers, and third-party utilities
- [src/store](file:///d:/development/magicwebs/RichyReach/richyreach-mobile/src/store): Zustand stores for managing authentication, active profiles, and UI overlays
- [src/types](file:///d:/development/magicwebs/RichyReach/richyreach-mobile/src/types): TypeScript interfaces and types

---

## ⚙️ Getting Started

### 1. Prerequisites
Make sure you have Node.js and Bun installed on your system.

### 2. Install Dependencies
```bash
bun install
```

### 3. Environment Variables
Create a `.env` file in the root folder and configure the API endpoint URL:
```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

### 4. Start the Application
To launch the development server, run:
```bash
bun run start
```

Use the options in the terminal to run the app on:
- **Android Emulator**: Press `a`
- **iOS Simulator**: Press `i`
- **Web Browser**: Press `w` (running `bun start --web`)

