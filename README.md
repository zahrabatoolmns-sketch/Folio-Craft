# FolioCraft - Portfolio Builder Web Application

🔗 **Live Demo:** [https://folio-craft-6frg.vercel.app](https://folio-craft-6frg.vercel.app)

A full-stack web application that allows users to build, customize, and deploy professional portfolio websites in minutes - no coding required.

##  Features

-  **10 Unique Templates** - Modern Dark, Minimal White, Cyber Neon, Creative Gradient, Split Layout, Corporate, CV Single, Neumorphism, Card Grid, Terminal
-  **5-Step Guided Wizard** - Personal info, skills, projects, experience, social links
-  **Authentication** - Email/Password + Google OAuth login
-  **Cloud Save** - MongoDB Atlas integration, access portfolios from any device
-  **Analytics Dashboard** - Track views, device breakdown, traffic sources with Chart.js
-  **Share Links** - Unique shareable URL for each portfolio
-  **QR Code Generator** - Instant portfolio sharing
-  **Export Options** - Download as standalone ZIP or PDF
-  **Unlimited Portfolios** - Create multiple portfolios per account

##  Tech Stack

**Frontend:** HTML5, CSS3, JavaScript (ES6+)
**Backend:** Node.js, Express.js, MongoDB, JWT, Passport.js (Google OAuth)
**Libraries:** Chart.js, JSZip, html2canvas, jsPDF
**Deployment:** Vercel (CI/CD via GitHub)

##  Project Structure
foliocraft-frontend/

├── index.html          # Landing page

├── dashboard.html          # Analytics dashboard

├── wizard.html          # Portfolio creation wizard

├── preview.html          # Live preview + export

├── templates/          # 10 portfolio templates

└── api.js              # Backend API integration

##  Setup

```bash
git clone <repo-url>
cd foliocraft-frontend
# Open index.html with Live Server
```
##  Related Repository

Backend API: [foliocraft-backend](https://folio-craft-two.vercel.app)
# FolioCraft Backend - REST API

 **Live API:** [https://folio-craft-two.vercel.app](https://folio-craft-two.vercel.app)

RESTful API powering the FolioCraft portfolio builder application, handling authentication, portfolio CRUD operations, analytics, and public portfolio sharing.

##  Tech Stack

- **Runtime:** Node.js (v18.x)
- **Framework:** Express.js
- **Database:** MongoDB Atlas (via Mongoose)
- **Authentication:** JWT + Google OAuth (Passport.js)
- **Email:** Nodemailer (Gmail SMTP)
- **Security:** Helmet, express-rate-limit, bcryptjs

##  API Endpoints

| Method | Endpoint | Description |
|--------|----------|--------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/google` | Google OAuth login |
| POST | `/api/auth/forgot-password` | Password reset request |
| GET | `/api/portfolio/all` | Get all user portfolios |
| POST | `/api/portfolio/create` | Create new portfolio |
| PUT | `/api/portfolio/:id` | Update portfolio |
| POST | `/api/portfolio/:id/publish` | Publish portfolio |
| GET | `/api/public/p/:shareId` | View published portfolio |
| GET | `/api/analytics/overview` | Get analytics data |

##  Environment Variables

```env
MONGODB_URI=
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
EMAIL_USER=
EMAIL_PASS=
FRONTEND_URL=
APP_BASE_URL=
```

##  Setup

```bash
npm install
cp .env.example .env  # fill in your values
npm run dev
```

##  Related Repository

Frontend: [foliocraft-frontend](https://folio-craft-6frg.vercel.app)



