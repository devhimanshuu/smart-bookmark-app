# 🔖 ReMarkable — Smart Bookmark Manager

**ReMarkable** is a high-performance, real-time bookmarking application designed for the modern web. It goes beyond simple link saving by providing rich visual previews, automated metadata extraction, and a premium "glassmorphic" user experience.

Built with **Next.js 14**, **Supabase**, and **Tailwind CSS**.

---

## 🚀 Elevated Features

While this started as a standard assignment, it has been enhanced with several "standout" features to provide a production-grade experience:

- ✨ **Real-time Synchronization**: Every add, delete, or pin is broadcasted instantly across all open tabs using Supabase Postgres Changes.
- 🖼️ **Rich Link Previews**: Automatically scrapes websites for Open Graph (OG) tags to generate visual cards with titles, descriptions, and thumbnails.
- 📌 **Smart Pinning**: Lock your most important resources to the top of your dashboard.
- 🏷️ **Tagging System**: Organize your digital library with custom categories and a live search that filters by tags.
- 🔒 **Secure Google OAuth**: Professional-grade authentication powered by Supabase Auth.
- 🎨 **Premium UI/UX**: A bespoke design system featuring Lucide icons, glassmorphic effects, and smooth micro-animations.

---

## 🛠 Tech Stack

- **Frontend**: Next.js (App Router), Tailwind CSS, Lucide React.
- **Backend**: Next.js API Routes (Serverless).
- **Database**: Supabase (PostgreSQL) with Realtime enabled.
- **Auth**: Supabase Auth (Google Provider).
- **Link Parsing**: `node-html-parser`.

---

## 🧠 Challenges Faced & Solutions

### 1. The Windows vs. Unix Casing Conflict

**Problem**: During development on Windows, certain components would fail to load in the build environment because of inconsistent casing in import statements (e.g., `BookmarkList.tsx` vs `bookmarkList.tsx`). Windows is case-insensitive for file paths, but Vercel/Next.js build servers are not.
**Solution**: I performed a structural refactor, moving components to a new `ui/` directory and strictly enforcing lowercase filenames. This bypassed the OS-level file system cache and ensured consistent deployments.

### 2. Live Updates without "Jank"

**Problem**: Basic real-time implementation often involves re-fetching the entire list whenever a change occurs, leading to a "flash" of loading states.
**Solution**: I implemented **surgical state updates**. Instead of refetching the API, the app listens for specific Postgres events (`INSERT`, `DELETE`, `UPDATE`) and manually injects or removes the specific data object from the React state. This makes the UI feel local-first and incredibly fast.

### 3. Web Scraping Bottlenecks

**Problem**: Fetching website metadata (like OG images) can be slow and blocked by Cross-Origin (CORS) policies if done from the client.
**Solution**: I built a dedicated backend API route (`/api/metadata`). This route acts as a proxy, fetching the HTML server-side, parsing the metadata using a lightweight DOM parser, and returning a clean JSON object to the frontend.

### 4. Database Realtime Configuration

**Problem**: Changes weren't appearing live initially even with subscriptions active on the frontend.
**Solution**: Discovered that Supabase requires an explicit "Publication" to be enabled on the Postgres side for specific tables. I solved this by configuring the `supabase_realtime` publication via SQL to include the `bookmarks` table.

---

## ⚙️ Local Setup

1.  **Clone the Repo**:

    ```bash
    git clone https://github.com/devhimanshuu/smart-bookmark-app.git
    cd smart-bookmark-app
    ```

2.  **Environment Variables**: Create a `.env.local` and add your Supabase credentials:

    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
    ```

3.  **Database Migration**: Run the following SQL in your Supabase Editor to support the advanced features:

    ```sql
    ALTER TABLE bookmarks
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS image_url TEXT,
    ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

    ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
    ```

4.  **Run Dev**:
    ```bash
    npm install
    npm run dev
    ```

---

_This project was developed for the Assignment submission._
