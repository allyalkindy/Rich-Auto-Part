#!/bin/bash

echo "🚀 Setting up Rich Auto Parts - Car Spare Parts Inventory System"
echo "=========================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies. Please check your network connection and try again."
    echo "💡 You can try: npm install --legacy-peer-deps"
    exit 1
fi

# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
    echo "🔧 Creating .env.local file..."
    cat > .env.local << EOF
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
EOF
    echo "✅ .env.local file created!"
    echo "⚠️  Please update the .env.local file with your actual values before running the app."
else
    echo "✅ .env.local file already exists"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Update .env.local with your actual configuration values"
echo "2. Make sure MongoDB is running locally or update MONGODB_URI"
echo "3. Run: npm run dev"
echo "4. Open http://localhost:3000 in your browser"
echo "5. Register an owner account at /register"
echo ""
echo "📚 For more information, see README.md"
