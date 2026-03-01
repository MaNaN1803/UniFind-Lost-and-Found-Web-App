# 🔍 UniFind — Intelligent Lost & Found Platform

<div align="center">

**UniFind** is a production-ready, full-stack Lost & Found platform built to solve a universal human problem — losing belongings and having no reliable, digital way to recover them.

[![Live Demo](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://your-app.vercel.app)
[![API](https://img.shields.io/badge/Backend-Render-blue?logo=render)](https://your-api.onrender.com)
[![Made by](https://img.shields.io/badge/Made%20by-Manan%20Telrandhe-orange)](https://github.com/MaNaN1803)
[![License](https://img.shields.io/badge/License-ISC-green)](#license)

</div>

---

## 🌍 The Problem — Bigger Than a Campus

Every day, across **offices, airports, hospitals, shopping malls, universities, transit systems, and public spaces**, millions of people lose their belongings. The traditional process of handling lost-and-found is:

- 📝 **Paper-based and manual** — items sit in a box with no searchable index.
- 📞 **No real-time communication** — whoever finds your wallet has no easy way to reach you.
- 🚫 **No verification** — anyone can walk up and claim an item with no proof of ownership.
- 🕳️ **No accountability** — there's no audit trail of who found what, when, and where.
- 🗑️ **Items expire** — unclaimed items are thrown away, even if the owner was still looking.

### Real-World Problems UniFind Solves

| Problem | UniFind Solution |
|---|---|
| Lost item reported nowhere | Structured digital reporting with photos & location |
| No way to match lost ↔ found | **AI-powered Match Engine** (category, color, description, geography) |
| Finder has no way to contact owner | Real-time community chat + email notifications |
| False claims with no verification | **Proof-of-ownership upload + Admin moderation** |
| No incentive to return items | **Gamification** — reward points, badges, leaderboard |
| Phone number privacy concerns | **Blurred phone access** with admin-approval workflow |
| Items never resolve | **Cron-based archival** — auto-resolves stale items after 6 months |
| Language barriers | **4-language support** (EN, ES, ZH, HI) |
| No record of resolution | Full audit trail — claim history, status changes, email logs |
| Hard to deploy & change backend URL | **Environment-variable-first** — one change, entire app updates |

---

## 🎯 Who Is It For?

UniFind is sector-agnostic. It can be deployed for:

- 🎓 **Universities & Colleges** — student ID cards, laptops, bags, water bottles.
- 🏢 **Corporate Offices** — access cards, gadgets, keys.
- ✈️ **Airports & Transit** — luggage tags, passports, travel documents.
- 🏥 **Hospitals** — patient belongings, medical equipment.
- 🛒 **Shopping Malls & Retail** — wallets, phones, children.
- 🏟️ **Events & Stadiums** — merchandise, IDs, chargers.
- 🏛️ **Government Buildings** — secure, logged item management.
- 🌆 **Smart Cities** — municipal lost-and-found portal.

---

## 🌐 Live Demo

| Deployment | URL |
|---|---|
| **Frontend (Vercel)** | `https://your-app.vercel.app` |
| **Backend (Render)** | `https://your-api.onrender.com` |

---

## 📸 Screenshots

> *Coming soon*

---

## ✨ Core Concept

University campuses see hundreds of lost-and-found incidents every week — wallets, laptops, ID cards, water bottles, and more. UniFind digitizes the lost-and-found process by allowing students to:
- **Report a lost item** with a description, photo, and map pin.
- **Report a found item** so the owner can be reunited with it.
- **Claim a found item** by submitting proof of ownership.
- **Chat in real-time** with other community members to coordinate handoffs.
- **Track rewards** for being a good campus Samaritan.

---

## 🚀 Features

### 🏠 Home Page
- **Dynamic Hero Section** with animated text and a graph-grid background.
- **Live Impact Stats** — total items recovered, active users, and more.
- **How It Works** — a visual 3-step guide for new users.
- **Core Services Cards** — quick links to Report Lost, Report Found, and Claim.
- **Community Chat Teaser** — embedded widget on the landing page.
- **Testimonials** — success stories from real users.
- **Call to Action & Footer** — engage visitors to join the community.

### 🔐 Authentication
- Full **Signup / Login** flow with secure JWT-based session management.
- **Forgot Password** email workflow — token-based secure reset links.
- **Role-based Access Control** — `user` and `admin` roles.
- Auth context decodes JWT payload to extract real user ID and role.

### 📋 Feed (Live Activity Board)
- Real-time display of all Lost and Found items reported by the community.
- **History Archive** — resolved items are separately visible.
- Filter by `Lost` / `Found` / `Resolved`.
- Advanced search drawer with filters: **Category, Color, Date Range, Location Radius**.
- Click any card to navigate to the item's full detail page.

### 🔍 Report Lost Item
- Secure form (requires login) to report a lost item.
- Supports image upload (photo of the lost item) via **Cloudinary**.
- Interactive **Location Picker** using Leaflet — drop a pin on a campus map.
- Automatic match alert engine fires in the background after submission.

### ✨ Report Found Item
- Similar form for reporting items you found on campus.
- Photo upload, description, and location support.
- Triggers the **Intelligent Match Engine** to notify potential owners.

### 📝 Claim a Found Item
- Claim a specific found item by its unique ID (passed from the item's detail page).
- Upload supporting evidence (photo) to prove ownership.
- Submit a detailed description explaining why the item is yours.
- Claim is linked to the original found item in the database.

### 📄 Item Detail Page
- Full-screen view of any Lost or Found item.
- Displays high-res image, description, category, status badge, and map pin.
- Shows the **Potential Bounty** (reward points available for resolution).
- **Initiate Secure Claim** button (for Found items).
- **Social Share** button using `navigator.share` Web Share API.
- Lists all claims submitted for that item.
- For approved claims, reveals **Secure Contact Info** (name, email, phone) to both parties.
- **Request Phone Access** — blurred phone number with an access-request workflow.

### 💬 Real-Time Community Chat
- WhatsApp-style dark chat UI with **sender/receiver message bubbles**.
- Users join a **named room** and chat with the community.
- **Image uploads** directly in chat (files sent to Cloudinary, URL shared via Socket.io).
- **Leave Room** button for clean room departure with system message broadcast.
- **Meetup Scheduler** — propose a time, date, and campus location for the handoff.
- **Safe Zone** map view for verified handoff locations.

### 🔔 Notifications
- **In-App Bell Icon** in Navbar with unread count badge.
- Dropdown shows the 5 most recent notifications.
- Dedicated **Notification History Page** (`/notifications`) for full archive.
- Notifications for: new matches, claim updates, chat invitations.
- **Clear History** functionality.
- Real-time delivery via Socket.io.

### 🗺️ Campus Map & Heatmap
- **Interactive Campus Heatmap** (`/map`) showing hotspots of Lost/Found activity.
- Filter heatmap by Date and Category.
- Circle markers represent individual item locations.

### 👤 User Profiles
- Full profile page at `/profile`.
- View your **total reward points**, badge tier, and active posts.
- **Upload a Profile Picture** (Cloudinary-powered avatar).
- **RoboHash fallback** avatar if no picture is set.

### 📷 QR Code "Return Tags"
- Users can generate a **personal QR code** from their profile.
- When a stranger scans the QR code with their phone, it opens UniFind and instantly connects them to the item owner via a secure Socket.io chat room.

### 🏆 Leaderboard & Gamification
- **Top Samaritans** leaderboard (`/leaderboard`) showing the top 10 finders ranked by points.
- Earn points for: getting a claim approved on your found item.
- **Tier Badges**: 🥇 Gold Finder, 🥈 Silver Finder, 🥉 Bronze Finder, 🏅 Top 10, 🎖️ Samaritan.
- Badges display on the leaderboard, profiles, and feed cards.

### 🤖 Intelligent Match Engine
- Fires automatically when a new Lost or Found item is submitted.
- Compares items across category, color, description similarity, and geographic proximity.
- **High-confidence matches** trigger both an **in-app notification** and an **email alert**.

### 🌍 Multi-Language Support
- Supports **English 🇺🇸**, **Español 🇪🇸**, **中文 🇨🇳**, and **Hindi 🇮🇳**.
- Language switcher available in the hamburger menu.
- Preference is persisted in `localStorage`.

### 🛡️ Admin Dashboard (`/admin`)
- **Manage Users** — view and delete user accounts.
- **Manage Feed** — moderate and delete item reports.
- **Manage Claims** — view all submitted claims.
  - **Approve** a claim → Notifies both parties via email, awards bounty points to the finder, and marks the original item as `resolved`.
  - **Reject** a claim → Sends a rejection email to the claimant.
  - **Approve Phone Access** — unlock phone numbers after a user requests them.
- **Award Points** manually to any user.
- **Analytics Dashboard** — visual charts (Recharts) showing items by category, resolution times, and weekly activity.

### ⏰ Automated Maintenance (Cron Jobs)
- A midnight cron job (via `node-cron`) automatically archives items older than **6 months** by marking them as `resolved`.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **React Router DOM v6** | Client-side routing |
| **Axios** | HTTP client for API calls |
| **Socket.io Client** | Real-time communication |
| **React Leaflet** | Interactive maps |
| **Recharts** | Analytics charts |
| **i18next / react-i18next** | Multi-language (i18n) support |
| **react-hot-toast** | Toast notifications |
| **qrcode.react** | QR code generation |
| **Tailwind CSS** | Utility-first CSS styling |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js & Express** | Web server & REST API |
| **Socket.io** | Real-time WebSocket communication |
| **MongoDB & mongoose** | Database & ODM |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcrypt** | Password hashing |
| **Cloudinary** | Cloud image storage |
| **multer + multer-storage-cloudinary** | File upload handling |
| **Nodemailer** | Email dispatch (Gmail) |
| **node-cron** | Scheduled background jobs |
| **joi** | Request body validation |
| **dotenv** | Environment variable management |

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js `v18+`
- MongoDB (local instance or MongoDB Atlas)
- A Cloudinary account
- A Gmail account with an App Password enabled

### 1. Clone the Repository
```bash
git clone https://github.com/MaNaN1803/UniFind-Lost-and-Found-Web-App.git
cd unifind/login_app
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
```env
PORT=8080
JWTPRIVATEKEY=your_super_secret_key
DB_URL=mongodb://127.0.0.1:27017/unifind
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
BASE_URL=http://localhost:3000
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../client/unifind
npm install
```

Create a `.env` file in the `client/unifind/` directory:
```env
VITE_API_URL=http://localhost:8080
```

Start the frontend dev server:
```bash
npm run dev
```

The app will be running at **`http://localhost:3000`** (or the port Vite selects).

---

## ☁️ Deployment Guide

### Backend → [Render](https://render.com)

1. Create a new **Web Service** pointing to the `server/` folder.
2. Set **Build Command**: `npm install`
3. Set **Start Command**: `node index.js`
4. Add the following **Environment Variables** in Render's dashboard:
   - `JWTPRIVATEKEY`
   - `DB_URL` (use MongoDB Atlas connection string)
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `CLOUDINARY_URL`
   - `BASE_URL` → your **Vercel frontend URL** (e.g., `https://unifind.vercel.app`)

### Frontend → [Vercel](https://vercel.com)

1. Import the `client/unifind/` folder as a new Vercel project.
2. Set **Framework Preset**: `Vite`
3. Add the following **Environment Variable** in Vercel's dashboard:
   - `VITE_API_URL` → your **Render backend URL** (e.g., `https://unifind-api.onrender.com`)
4. The `vercel.json` file at the root handles SPA routing automatically.

---

## 📡 API Endpoints Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth` | Login (returns JWT) |
| `POST` | `/api/user` | Signup (create user) |
| `POST` | `/api/password-reset/forgot` | Request password reset email |
| `POST` | `/api/password-reset/reset/:token` | Reset password with token |

### Feed & Items
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/feed` | Get all feed items |
| `GET` | `/api/feed/:id` | Get a single item by ID |
| `POST` | `/api/lostitem/report-lost` | Report a lost item |
| `POST` | `/api/founditem/report-found` | Report a found item |
| `POST` | `/api/claimfounditem` | Submit a claim |
| `GET` | `/api/claimfounditem/item/:id` | Get all claims for an item |
| `PUT` | `/api/claimfounditem/:id/request-phone` | Request phone number access |

### Users
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/user/me/full` | Get own full profile data |
| `PUT` | `/api/user/me/avatar` | Update profile picture URL |
| `GET` | `/api/user/leaderboard` | Get top users by points |

### Notifications
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/notifications` | Get latest notifications (navbar) |
| `GET` | `/api/notifications/all` | Get full notification history |
| `PUT` | `/api/notifications/:id/read` | Mark one as read |
| `PUT` | `/api/notifications/read-all` | Mark all as read |
| `DELETE` | `/api/notifications/clear` | Clear all notifications |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/users` | Get all users |
| `DELETE` | `/api/admin/users/:id` | Delete a user |
| `DELETE` | `/api/admin/feed/:id` | Delete a feed item |
| `GET` | `/api/admin/claims` | Get all claims |
| `DELETE` | `/api/admin/claims/:id` | Delete a claim |
| `PUT` | `/api/admin/claims/:id/status` | Approve or reject a claim |
| `PUT` | `/api/admin/claims/:id/phone-access` | Approve phone access |

### Rewards & Uploads
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/rewards/me` | Get current user's reward history |
| `POST` | `/api/rewards/award` | Award points to a user (admin) |
| `POST` | `/api/upload/image` | Upload an image to Cloudinary |

---

## 🔌 Real-Time Socket Events

| Event | Direction | Description |
|---|---|---|
| `register_user` | Client → Server | Register user's socket ID |
| `join_room` | Client → Server | Join a named chat room |
| `leave_room` | Client → Server | Leave a chat room |
| `send_message` | Client → Server | Send a chat message |
| `receive_message` | Server → Client | Broadcast message to room |
| `room_users_update` | Server → Client | Updated list of users in a room |
| `invite_to_chat` | Client → Server | Request to invite another user |
| `chat_invitation` | Server → Client | Receive a chat invite notification |

---

## 🔒 Environment Variables Summary

### Server (`server/.env`)
| Variable | Description |
|---|---|
| `PORT` | Server port (default: `8080`) |
| `JWTPRIVATEKEY` | Secret key for signing JWTs |
| `DB_URL` | MongoDB connection string |
| `EMAIL_USER` | Gmail address for sending emails |
| `EMAIL_PASS` | Gmail App Password |
| `CLOUDINARY_URL` | Full Cloudinary API URL |
| `BASE_URL` | Frontend URL (used in email links & CORS) |

### Frontend (`client/unifind/.env`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | The backend API base URL |

---

## 🤝 Contributing

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 👨‍💻 Author

**Manan Telrandhe**

[![GitHub](https://img.shields.io/badge/GitHub-MaNaN1803-181717?logo=github)](https://github.com/MaNaN1803)
[![Email](https://img.shields.io/badge/Email-telrandhemanan@gmail.com-red?logo=gmail)](mailto:telrandhemanan@gmail.com)

---

## 📜 License

This project is licensed under the **ISC License**.

---

> *Built to solve a universal problem — because losing something you care about shouldn't mean losing it forever.*
