# Amrooz Collection - Backend API

NestJS-based backend API for the Amrooz Collection e-commerce platform.

## 🚀 Features

- **Products Management:** Full CRUD with variants, images, and reviews
- **Orders System:** Complete order processing with Rs 250 flat delivery charge
- **Admin Dashboard:** Secure admin authentication with JWT
- **Categories & Tags:** Flexible product organization
- **Authentication:** JWT-based auth with access and refresh tokens
- **Database:** MySQL with TypeORM

## 📋 Prerequisites

- Node.js 20.x or higher
- MySQL 8.x or higher
- npm or yarn

## 🛠️ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/web-braindevlop/amrooz_backend.git
   cd amrooz_backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` with your settings:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=your_db_user
   DB_PASSWORD=your_db_password
   DB_DATABASE=amrooz_collection
   
   NODE_ENV=development
   PORT=3001
   FRONTEND_URL=http://localhost:3000
   
   JWT_ACCESS_SECRET=your-super-secret-jwt-access-key
   JWT_REFRESH_SECRET=your-super-secret-jwt-refresh-key
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   ```

4. **Run database migrations:**
   ```bash
   npm run migration:run
   ```

5. **Seed initial data (optional):**
   ```bash
   npm run seed
   npm run seed:admin
   ```

6. **Start development server:**
   ```bash
   npm run start:dev
   ```

   API will be available at `http://localhost:3001/api`

## 🏗️ Build for Production

```bash
npm run build
npm run start:prod
```

## 📦 Deployment

This project uses GitHub Actions for automatic deployment to Hostinger.

### Required GitHub Secrets:

Set these in: GitHub Repository → Settings → Secrets and variables → Actions

```
SSH_HOST=145.79.30.125
SSH_USERNAME=u278943707
SSH_PASSWORD=<your-ssh-password>
SSH_PORT=65002
```

### Deployment Process:

1. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```

2. **Automatic deployment** will trigger via GitHub Actions

3. **Monitor deployment:**
   - Go to GitHub repository → Actions tab
   - View the deployment progress

## 🔧 Available Scripts

- `npm run start:dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run seed` - Seed sample products
- `npm run seed:admin` - Create admin user

## 📝 API Documentation

### Base URL
- **Production:** `https://api.amroozcollection.com/api`
- **Local:** `http://localhost:3001/api`

### Main Endpoints

#### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

#### Orders
- `GET /api/orders` - List orders (Admin)
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order
- `PATCH /api/orders/:id` - Update order status (Admin)

#### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current admin

#### Categories, Tags, Brands
- `GET /api/categories` - List categories
- `GET /api/tags` - List tags
- `GET /api/brands` - List brands

## 🔐 Security

- JWT tokens with access/refresh pattern
- Password hashing with bcrypt
- CORS configured for frontend domain
- Rate limiting with throttler
- SQL injection protection via TypeORM

## 🛡️ Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `3306` |
| `DB_USERNAME` | Database user | `root` |
| `DB_PASSWORD` | Database password | `password` |
| `DB_DATABASE` | Database name | `amrooz_collection` |
| `NODE_ENV` | Environment | `development` / `production` |
| `PORT` | API port | `3001` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://amroozcollection.com` |
| `JWT_ACCESS_SECRET` | JWT access token secret | Random 64-char string |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | Random 64-char string |

## 📄 License

Private - Amrooz Collection

## 👥 Contact

- Email: web.brain.devlop@gmail.com
- Website: https://amroozcollection.com
