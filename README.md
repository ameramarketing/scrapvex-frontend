# 🌟 Scrapvex Frontend Interface
The highly optimized, premium UI interface for Scrapvex. Designed with cutting-edge glassmorphism aesthetics, deep dark-mode support, and micro-interactions.

## 🎨 Design System & Aesthetics
- **Premium Dark Theme**: Core design relies on deep gradients and glassmorphism (frosted glass) effects mapped cleanly to variables in `global.css`.
- **Responsive Fluid Layouts**: Fully responsive grids adjusting flawlessly from 4K desktop monitors down to mobile devices.
- **Component Reusability**: Floating Action Buttons (FABs), Toast notification overlays, and standard modular Form layouts.

## 👥 Multi-Dashboard Architecture
The frontend utilizes a Role-Based Access Control (RBAC) component (`ProtectedRoute.jsx`) to segregate users into 4 powerful dashboards:
1. **User Dashboard**: Scrap pickup booking flow, wallet balances, support ticket chat, and collector reviews.
2. **Collector Dashboard**: Live task assignment tracking, pickup status toggles (En Route, Accepted, Cancelled), and earnings tracking.
3. **Franchise Dashboard**: City-level operations, custom scrap rate configuration for their district, and localized operational oversight.
4. **Admin Dashboard (Super Admin)**: Complete master control. Contains Vyapar B2B Billing (Invoices, Purchases, Sales), live inventory, support chat UI, system-wide broadcast sending, and wallet top-ups.

## 🛠️ Technology Stack
- **Core Engine**: React.js configured with Vite for blazing-fast HMR and optimized builds.
- **Styling**: Pure CSS3 Modules and variables (Avoiding heavy frameworks to ensure absolute creative freedom).
- **Icons**: React-Icons.
- **Networking**: Axios instance with JWT interceptors auto-handling 401/403 session expirations.

## 🚀 Running Locally
1. Clone the repository and navigate to the frontend directory.
2. Run `npm install` to install node modules.
3. Configure your `.env` file (`VITE_API_URL=http://localhost:5000`).
4. Execute `npm run dev` to launch the Vite development server.