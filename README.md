# 🎮 Tarkov Tactical Maps

Interactive website with maps, loot locations, boss spawns, extractions, and important keys for Escape from Tarkov.

## ✨ Features

- **4 Main Maps**: Customs, Woods, Interchange, and Shoreline
- **Interactive Maps**: Zoom, pan, and click on markers
- **Detailed Markers**:
  - 🎁 Loot locations (weapons, medical, tech, valuables, food)
  - 💀 Boss spawns with spawn chance and guard count
  - 🚪 Extraction points (PMC, Scav, cooperative)
  - 🔑 Important keys and what they unlock
- **Smart Filters**: Show only what you need
- **Tactical Design**: Dark theme inspired by Tarkov
- **Smooth Animations**: Transitions and visual effects
- **Admin System**: Password-protected admin panel to add/edit/delete pins

## 🚀 How to Run

```bash
# Navigate to directory
cd tarkov-maps

# Install dependencies (if needed)
npm install

# Run in development mode
npm run dev
```

Access `http://localhost:3000`

## 🌐 Deploy to Production

### Option 1: Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "New Project" and import your repository
4. Vercel will auto-detect Next.js and configure everything
5. Click "Deploy"

**Important**: The SQLite database will reset on each deploy. For persistent data, consider using:
- Vercel Postgres
- PlanetScale (MySQL)
- MongoDB Atlas
- Or any other hosted database

### Option 2: Deploy to Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and sign in
3. Click "Add new site" → "Import an existing project"
4. Select your GitHub repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Click "Deploy"

### Environment Variables

For production, create a `.env.local` file:

```bash
# Admin password (change this!)
ADMIN_PASSWORD=your-secure-password-here

# Database URL (if using external DB)
DATABASE_URL=your-database-url
```

## 🔐 Admin Access

The site is public and doesn't require login to view maps. However, to add, edit, or delete pins, you need admin access:

1. Click the "Admin" button in the header
2. Enter the admin password
3. Access the admin dashboard to manage pins

**Admin Features:**
- Add custom pins to any map
- Choose pin type (loot, boss, extract)
- Set position (X, Y percentage)
- Add descriptions and type-specific data
- Delete custom pins
- All changes saved to database
- Only admin can modify pins (users can only view)

### Security

- Admin routes are protected by password authentication
- API endpoints validate admin token for all write operations
- Public endpoints only allow reading pins
- SQLite database stores all pin data persistently

### Admin Dashboard Controls

- **Select Map**: Choose which map to add pins to
- **Add Pin**: Click to open the form
- **Pin Types**:
  - **Loot**: Set loot type (weapon, medical, tech, valuables, food) and quality (high/medium/low)
  - **Boss**: Set boss name, spawn chance %, and number of guards
  - **Extract**: Set requirements, always available flag, PMC/Scav availability
- **Delete**: Remove custom pins you've added

## 🛠️ Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **react-zoom-pan-pinch** - Map interactivity
- **Lucide React** - Icons
- **SQLite (better-sqlite3)** - Database for pins
- **REST API** - Backend endpoints for CRUD operations

## 📁 Project Structure

```
tarkov-maps/
├── app/
│   ├── admin/
│   │   ├── page.tsx              # Admin login page
│   │   └── dashboard/
│   │       └── page.tsx          # Admin dashboard
│   ├── api/
│   │   ├── auth/
│   │   │   └── login/route.ts   # Login API
│   │   └── pins/
│   │       ├── route.ts          # CRUD pins API
│   │       └── [mapId]/route.ts # Get pins by map
│   ├── components/
│   │   └── InteractiveMap.tsx   # Main map component
│   ├── data/
│   │   └── maps.ts              # Map data
│   ├── types/
│   │   └── map.ts               # TypeScript interfaces
│   ├── map/[id]/
│   │   └── page.tsx             # Individual map page
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── lib/
│   ├── db.ts                    # SQLite database setup
│   ├── pins.ts                  # Pin database operations
│   └── auth.ts                  # Authentication helpers
└── tarkov-pins.db               # SQLite database (gitignored)
```

## 🎨 Tarkov Theme Colors

- **Background**: `#0a0a0a` (Deep black)
- **Olive**: `#4a5240` (Military green)
- **Accent**: `#9fad7d` (Light green)
- **Danger**: `#c44f42` (Red - bosses)
- **Warning**: `#d4a94f` (Yellow - loot)
- **Extract**: `#4f9fd4` (Blue - extractions)

## 📝 How to Add New Maps

Edit `app/data/maps.ts` and add a new object following the `TarkovMap` interface:

```typescript
{
  id: 'new-map',
  name: 'New Map',
  description: 'Map description',
  image: 'https://url-to-map-image.jpg',
  lootLocations: [...],
  bossSpawns: [...],
  extractions: [...],
  keys: [...]
}
```

## 🎯 Features

### Home Page
- Grid of all available maps
- General statistics (total loot, bosses, extractions)
- Animated cards with hover effects
- Admin access button

### Map Page
- Interactive visualization with zoom/pan
- Filters by marker type
- Sidebar with key information
- Info panel when clicking markers
- Legend and usage tips

### Admin Panel
- Password-protected access
- Map selector
- Add custom pins with detailed information
- View and delete custom pins
- Real-time updates on public site via API
- Server-side persistence
- Protected API endpoints (only admin can modify)

## 🔒 Security Notes

**Current Implementation**:
- Simple password authentication with token-based API access
- Admin token stored in localStorage
- API endpoints validate admin token for write operations
- Public endpoints allow read-only access
- SQLite database for persistent storage

**For Production**:
- Implement JWT tokens with expiration
- Use secure session management
- Add HTTPS enforcement
- Implement rate limiting
- Add CSRF protection
- Hash passwords properly
- Use environment variables for secrets
- Add user roles and permissions
- Implement audit logging

## 🤝 Contributing

Feel free to add more maps, update data, or improve the design!

## ⚠️ Disclaimer

This is an unofficial project and is not affiliated with Battlestate Games. All information is community-based.

---

**Good loot and clean extracts!** 🎯
