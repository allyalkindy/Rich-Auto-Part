# Quick Start Guide - Rich Auto Parts

## 🚀 Get Started in 5 Minutes

### Prerequisites

- Node.js 18+ installed
- MongoDB running (local or cloud)
- Internet connection for npm packages

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Create `.env.local` file:

```env
MONGODB_URI=mongodb://localhost:27017/duka-smart
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

### Step 3: Start Development Server

```bash
npm run dev
```

### Step 4: Access the Application

1. Open http://localhost:3000
2. Go to `/register` to create your first account
3. Choose "Owner" role for full access
4. Start adding products and recording sales!

## 🎯 Key Features to Test

### 1. User Registration & Login

- Visit `/register` to create accounts
- Test both "Owner" and "Staff" roles
- Login at `/login`

### 2. Product Management

- Add products with categories, quantities, and prices
- Set minimum stock levels for alerts
- View product inventory

### 3. Sales Recording

- Search and select products
- Record sales with quantities
- Watch inventory update automatically

### 4. Reports & Analytics

- **Daily Reports**: View today's sales
- **Monthly Reports**: Category breakdown
- **Yearly Reports**: Annual overview
- **Low Stock Alerts**: Products needing restocking

### 5. Email Notifications

- Configure email settings in `.env.local`
- Test low stock alerts

## 🔧 Troubleshooting

### Common Issues

**1. MongoDB Connection Error**

```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution**: Start MongoDB or update MONGODB_URI to your cloud database

**2. NextAuth Error**

```
Error: NEXTAUTH_SECRET is not set
```

**Solution**: Add NEXTAUTH_SECRET to your .env.local file

**3. Build Errors**

```
Error: Cannot find module 'react'
```

**Solution**: Run `npm install` to install dependencies

**4. Port Already in Use**

```
Error: listen EADDRINUSE :::3000
```

**Solution**: Use different port: `npm run dev -- -p 3001`

## 📱 Mobile Responsive

The application is fully responsive and works on:

- Desktop browsers
- Tablets
- Mobile phones

## 🔐 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Role-based access control
- Protected API routes

## 📊 Sample Data

After registration, try adding these sample products:

1. **Engine Oil Filter** - Category: Engine - Price: $15.99 - Min Stock: 10
2. **Brake Pads** - Category: Brake - Price: $45.99 - Min Stock: 5
3. **Air Filter** - Category: Engine - Price: $12.99 - Min Stock: 8

Then record some sales to see the system in action!

## 🚀 Production Deployment

Ready to deploy? Check the main README.md for deployment instructions to:

- Vercel
- Netlify
- Railway
- Other platforms

---

**Need help?** Check the main README.md for detailed documentation.
