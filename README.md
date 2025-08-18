# Rich Auto Parts - Car Spare Parts Inventory Management System

A comprehensive full-stack web application for managing car spare parts inventory and sales tracking for shop owners with multiple locations.

## Features

### 🔐 Authentication & Authorization

- **Staff Role**: Can add stock, update sales, view daily reports
- **Owner Role**: Can view all shop reports (daily, monthly, yearly) and low-stock alerts
- Secure login/register with email and password
- Role-based access control

### 📦 Product Management

- Add, edit, and delete products
- Product fields: name, category, quantity, price per unit, minimum stock
- Search products by name or category
- Real-time stock tracking

### 💰 Sales Recording

- Search and select products for sale
- Automatic stock deduction
- Sale recording with product details, quantity, price, date, and staff member
- Real-time inventory updates

### 📊 Comprehensive Reports

- **Daily Reports**: Total sales amount, products sold, detailed sales list
- **Monthly Reports**: Aggregated totals with category breakdown
- **Yearly Reports**: Annual overview with monthly breakdown
- **Low Stock Alerts**: Products below minimum stock threshold

### 🔔 Email Notifications

- Automatic email alerts when products go below minimum stock
- Configurable email settings using Nodemailer

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js with credentials provider
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Email**: Nodemailer

## Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- npm or yarn

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd duka-smart
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/duka-smart

   # NextAuth
   NEXTAUTH_SECRET=your-secret-key-here-change-in-production
   NEXTAUTH_URL=http://localhost:3000

   # Email (for notifications)
   EMAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=your-email@gmail.com
   EMAIL_SERVER_PASSWORD=your-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Setup

The application will automatically create the necessary collections when you first add data. The main collections are:

- **users**: User accounts with roles
- **products**: Product inventory
- **sales**: Sales transactions

## Usage

### Initial Setup

1. **Register an Owner Account**

   - Go to `/register`
   - Create an account with "owner" role
   - This account will have access to all features

2. **Register Staff Accounts**
   - Create additional accounts with "staff" role
   - Staff can manage products and record sales

### Daily Operations

1. **Add Products**

   - Navigate to `/products`
   - Click "Add Product"
   - Fill in product details including minimum stock level

2. **Record Sales**

   - Go to `/sales`
   - Search for products
   - Enter quantity sold
   - System automatically updates inventory

3. **Monitor Reports**
   - **Daily**: `/reports/daily` - View today's sales
   - **Monthly**: `/reports/monthly` - Monthly summaries
   - **Yearly**: `/reports/yearly` - Annual overview
   - **Low Stock**: `/low-stock` - Products needing restocking

### Email Notifications

When a product's quantity falls below the minimum stock level, the system automatically sends an email alert to the configured email address.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints

### Products

- `GET /api/products` - Get all products (with optional search/category filters)
- `POST /api/products` - Create new product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Sales

- `GET /api/sales` - Get all sales (with optional date filter)
- `POST /api/sales` - Record new sale

### Reports

- `GET /api/reports/daily` - Daily sales report
- `GET /api/reports/monthly` - Monthly sales report
- `GET /api/reports/yearly` - Yearly sales report
- `GET /api/reports/low-stock` - Low stock products

## Project Structure

```
duka-smart/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── products/          # Products management
│   ├── sales/             # Sales recording
│   ├── reports/           # Reports pages
│   ├── login/             # Login page
│   └── register/          # Registration page
├── components/            # React components
│   ├── auth/              # Authentication components
│   ├── layout/            # Layout components
│   └── providers/         # Context providers
├── lib/                   # Utility libraries
├── models/                # MongoDB models
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**

   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Environment Variables for Production

Make sure to update these for production:

```env
NEXTAUTH_SECRET=your-very-secure-secret-key
NEXTAUTH_URL=https://your-domain.com
MONGODB_URI=your-production-mongodb-uri
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Rich Auto Parts** - Streamlining car spare parts inventory management for modern businesses.
