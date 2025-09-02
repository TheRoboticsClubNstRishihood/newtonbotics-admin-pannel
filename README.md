# Newtonbotics Admin Panel

A professional admin panel for the Newtonbotics Robotics Club website, built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

### 🎯 Core Functionality
- **Dashboard**: Overview with key metrics, charts, and recent activity
- **Member Management**: Complete member database with search and filtering
- **Event Management**: Event creation, tracking, and attendance monitoring
- **Analytics**: Data visualization with charts and statistics
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

### 📊 Dashboard Features
- Real-time statistics and metrics
- Interactive charts (Area, Bar, Pie charts)
- Recent activity feed
- Member growth tracking
- Event overview

### 👥 Member Management
- Member database with detailed information
- Search and filter functionality
- Role-based categorization (Student, Faculty, Alumni)
- Status tracking (Active/Inactive)
- Project count tracking

### 📅 Event Management
- Event creation and management
- Attendance tracking with progress bars
- Event categorization (Workshop, Meeting, Showcase, etc.)
- Status management (Upcoming, Completed, Cancelled)
- Location and time management

### 🎨 UI/UX Features
- Modern, clean design with Tailwind CSS
- Responsive sidebar navigation
- Mobile-friendly interface
- Professional color scheme
- Intuitive user experience

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **Charts**: Recharts
- **UI Components**: Headless UI
- **Package Manager**: npm

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd newtonbotics-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
newtonbotics-admin/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Dashboard page
│   │   ├── members/
│   │   │   └── page.tsx          # Members management
│   │   ├── events/
│   │   │   └── page.tsx          # Events management
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   └── Sidebar.tsx           # Navigation sidebar
│   └── ...
├── public/                       # Static assets
├── package.json
└── README.md
```

## Pages Overview

### Dashboard (`/`)
- Overview statistics
- Member growth chart
- Events overview
- Member distribution pie chart
- Recent activity feed

### Members (`/members`)
- Member list with search and filtering
- Add/Edit/Delete member functionality
- Role and status management
- Pagination support

### Events (`/events`)
- Event grid view
- Event creation and management
- Attendance tracking
- Status and type filtering

## Customization

### Colors and Branding
The admin panel uses a professional blue color scheme. You can customize colors by modifying the Tailwind configuration in `tailwind.config.js`.

### Adding New Pages
1. Create a new directory in `src/app/`
2. Add a `page.tsx` file
3. Import and use the `Sidebar` component
4. Add navigation link in `src/components/Sidebar.tsx`

### Data Management
Currently, the app uses mock data. To integrate with a real backend:
1. Replace mock data with API calls
2. Add state management (e.g., Zustand, Redux)
3. Implement authentication and authorization

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the Newtonbotics team.

---

**Built with ❤️ for Newtonbotics Robotics Club**
