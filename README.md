# Local Hero 🔗🗺️

> A location-based quest platform connecting real-life tasks with local heroes — built in 48 hours for the SpurHacks Hackathon!

## 🚀 What is Local Hero?

**Local Hero** is a React Native mobile app that lets users **post real-world tasks (quests)** and discover nearby **heroes** willing to help. Whether it's delivering groceries, fixing a bike, or walking a dog, Local Hero makes help local, gamified, and meaningful.

- 🧙‍♂️ **Heroes** browse nearby open quests via an interactive map  
- 📝 **Quest-givers** post tasks with category, difficulty, and location  
- 📍 **Location-aware matchmaking** connects heroes to nearby tasks  
- ✅ **Pending quests** are tracked with real-time status  

## 🧩 Features

- 🔐 **User Auth & Session Management** — secure login/signup, JWT-based  
- 🗺️ **Map Integration** — real-time markers using Expo + React Native Maps  
- 📦 **Dynamic Quest Feed** — fetches open quests with location data  
- 🧭 **Pending Quest System** — tracks and manages in-progress tasks  
- 🎨 **Mobile-First UI** — clean and modern React Native design  

## ⚙️ Tech Stack

| Frontend               | Backend             | Tools & Services        |
|------------------------|---------------------|--------------------------|
| React Native (Expo)    | Node.js + Express   | Supabase (PostgreSQL)   |
| React Navigation       | RESTful API         | Expo Location API       |
| Context API            | Supabase Auth       | AsyncStorage (JWTs)     |

## 🧠 Key Challenges We Solved

- Handling conditional rendering during async auth session restore  
- Dynamically fitting both user and quest pins into map view  
- Avoiding hook order mismatches during screen transitions  
- Parsing dynamic difficulty categories with fallback logic  

## 🏁 How to Run Locally

1. Clone the repo  
```bash
git clone https://github.com/your-username/Local Hero.git
cd Local Hero
```

2. Install dependencies  
```bash
npm install
```

3. Start the app  
```bash
npx expo start
```

> Make sure to set up your `.env` file with your API base URL (supabase).

## 🎯 Future Ideas

- Push notifications for nearby quest postings  
- Quest completion verification (photos, geofencing)  
- Hero experience levels + badges  
- Marketplace for recurring help + tips  

## 👥 Team

- **[Your Name]** — 
- **[Kayin Boadi]** — Backend/API & Database  
- **[Fletcher Lorenzo]** —  Backend
