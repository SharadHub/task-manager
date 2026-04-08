#!/bin/bash

# TaskFlow Development Starter
# Opens two terminals - one for server, one for client

echo "🚀 Starting TaskFlow in development mode..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Function to check if .env file exists and create if needed
setup_env() {
    local dir=$1
    local env_file=$2
    local example_file=$3
    
    if [ ! -f "$dir/$env_file" ]; then
        if [ -f "$dir/$example_file" ]; then
            echo "📝 Creating $env_file from $example_file in $dir"
            cp "$dir/$example_file" "$dir/$env_file"
            echo "⚠️  Please edit $dir/$env_file with your configuration"
        else
            echo "⚠️  No $example_file found in $dir"
        fi
    else
        echo "✅ $env_file already exists in $dir"
    fi
}

# Setup environments
echo "🔧 Setting up environments..."
setup_env "server" ".env" ".env.example"
setup_env "client" ".env.local" ".env.local.example"

# Install dependencies if needed
if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

echo ""
echo "🌟 Opening terminals..."
echo "🔹 Server terminal: Express server on http://localhost:5000"
echo "🔹 Client terminal: Next.js dev server on http://localhost:3000"
echo ""

# Detect terminal emulator
if command -v gnome-terminal &> /dev/null; then
    # GNOME Terminal
    gnome-terminal --tab --title="TaskFlow Server" -- bash -c "cd '$PWD/server' && npm run dev; exec bash"
    gnome-terminal --tab --title="TaskFlow Client" -- bash -c "cd '$PWD/client' && npm run dev; exec bash"
elif command -v konsole &> /dev/null; then
    # KDE Konsole
    konsole --new-tab --title "TaskFlow Server" -e bash -c "cd '$PWD/server' && npm run dev; exec bash"
    konsole --new-tab --title "TaskFlow Client" -e bash -c "cd '$PWD/client' && npm run dev; exec bash"
elif command -v xterm &> /dev/null; then
    # XTerm
    xterm -title "TaskFlow Server" -e "cd '$PWD/server' && npm run dev" &
    xterm -title "TaskFlow Client" -e "cd '$PWD/client' && npm run dev" &
elif command -v xfce4-terminal &> /dev/null; then
    # XFCE Terminal
    xfce4-terminal --tab --title="TaskFlow Server" -- bash -c "cd '$PWD/server' && npm run dev; exec bash"
    xfce4-terminal --tab --title="TaskFlow Client" -- bash -c "cd '$PWD/client' && npm run dev; exec bash"
else
    echo "⚠️  No supported terminal found. Starting in background processes..."
    echo "Server will run on: http://localhost:5000"
    echo "Client will run on: http://localhost:3000"
    
    # Fallback: run in background
    cd server && npm run dev &
    SERVER_PID=$!
    cd ..
    
    cd client && npm run dev &
    CLIENT_PID=$!
    cd ..
    
    echo "Press Ctrl+C to stop both services"
    trap "kill $SERVER_PID $CLIENT_PID 2>/dev/null; exit" INT
    wait $SERVER_PID $CLIENT_PID
fi

echo "✅ Development environment started!"
