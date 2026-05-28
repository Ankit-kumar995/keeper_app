# Keeper App - Household Asset & Maintenance Management

A full-stack MERN application for managing household appliances, tracking warranties, scheduling maintenance, and storing important documents.

## Features

- **User Authentication**: Google OAuth login + Email/Password authentication
- **Asset Management**: Add, view, edit, and delete household items
- **Document Storage**: Upload warranty cards, invoices, and product images
- **Google Drive Integration**: Store files securely in Google Drive
- **Reminder System**: Track warranty expiry and service due dates
- **Dashboard**: View total items, upcoming reminders, and recent uploads
- **Search & Filters**: Search by item name, filter by category and warranty status

## Tech Stack

### Frontend
- React.js 18
- React Router v6
- Axios
- Tailwind CSS
- Material UI
- @react-oauth/google

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Google OAuth 2.0
- Google Drive API
- Multer (file uploads)

## Project Structure

```
keeper-app/
├── Backend/                 # Express.js backend
│   ├── src/
│   │   ├── config/         # Database & Google Drive config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/    # Auth & upload middleware
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── app.js         # Express app
│   │   └── server.js      # Server entry
│   └── package.json
│
├── Frontend/
│   └── keeper-app/         # React frontend
│       └── src/
│           ├── api/       # Axios config
│           ├── components/# Reusable components
│           ├── context/    # Auth context
│           ├── pages/      # Page components
│           ├── App.jsx    # Main app
│           └── main.jsx   # Entry point
│
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Google Cloud Console project

### Backend Setup

1. Navigate to backend folder:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/keeper
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_DRIVE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----..."
GOOGLE_DRIVE_FOLDER_ID=your-drive-folder-id
PORT=5000
```

4. Run development server:
```bash
npm run dev
```

Server will start at `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd Frontend/keeper-app
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

4. Run development server:
```bash
npm run dev
```

Frontend will start at `http://localhost:5173`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/google` | Google OAuth login |
| POST | `/api/auth/register` | Email registration |
| POST | `/api/auth/login` | Email login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout user |

### Items
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/items` | Get all items (with filters) |
| POST | `/api/items` | Create new item |
| GET | `/api/items/:id` | Get single item |
| PUT | `/api/items/:id` | Update item |
| DELETE | `/api/items/:id` | Delete item |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Get dashboard data |

## Query Parameters for Items

```
GET /api/items?search=AC&category=Electronics&expiryStatus=expired&page=1&limit=10
```

- `search` - Search by item name
- `category` - Filter by category
- `expiryStatus` - Filter: `expired`, `expiring_soon`
- `page` - Pagination page number
- `limit` - Items per page

## Deployment

### Backend Deployment (Render/Railway)

1. Push code to GitHub
2. Connect to Render/Railway
3. Add environment variables
4. Deploy

### Frontend Deployment (Vercel/Netlify)

1. Push code to GitHub
2. Import to Vercel
3. Add environment variable: `VITE_BACKEND_URL`
4. Deploy

## Environment Variables Reference

### Backend (.env)
| Variable | Description |
|----------|-------------|
| MONGO_URI | MongoDB Atlas connection string |
| JWT_SECRET | Secret key for JWT tokens |
| GOOGLE_CLIENT_ID | Google OAuth Client ID |
| GOOGLE_CLIENT_SECRET | Google OAuth Client Secret |
| GOOGLE_DRIVE_CLIENT_EMAIL | Google Drive service account email |
| GOOGLE_DRIVE_PRIVATE_KEY | Google Drive private key |
| GOOGLE_DRIVE_FOLDER_ID | Google Drive folder ID for uploads |
| PORT | Server port (default: 5000) |

### Frontend (.env)
| Variable | Description |
|----------|-------------|
| VITE_BACKEND_URL | Backend API URL |
| VITE_GOOGLE_CLIENT_ID | Google OAuth Client ID |

## Screenshots

![Dashboard](https://via.placeholder.com/800x400?text=Dashboard)
![Items List](https://via.placeholder.com/800x400?text=Items+List)
![Add Item Form](https://via.placeholder.com/800x400?text=Add+Item+Form)

## Live URLs

- **Frontend URL**: _________________
- **Backend URL**: _________________

## GitHub Repositories

- **Frontend**: _________________
- **Backend**: _________________

## License

MIT License

---

Built with ❤️ for Codegrameen Assignment