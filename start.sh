#!/bin/bash

echo "🚀 Starting Seal Web App"
echo "========================"

# Function to cleanup on exit
cleanup() {
    echo "🛑 Shutting down servers..."
    pkill -f "node server/index.js" 2>/dev/null
    pkill -f "react-scripts start" 2>/dev/null
    exit 0
}

# Set up cleanup trap
trap cleanup SIGINT SIGTERM

# Kill any existing processes on ports 3000 and 5000
echo "🧹 Cleaning up existing processes..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5000 | xargs kill -9 2>/dev/null || true

# Wait a moment for cleanup
sleep 2

echo "🔧 Starting backend server..."
npm run server:dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

echo "🌐 Starting frontend server..."
cd client
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Seal Web App is starting up!"
echo "🔗 Frontend: http://localhost:3000"
echo "🔗 Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait
