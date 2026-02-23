#!/bin/bash

# Define filenames for storing process IDs (Still good for reference)
FRONT_PID_FILE=".frontend.pid"
BACK_PID_FILE=".backend.pid"

start_apps() {
    echo "🚀 Starting Fullstack App..."

    # 1. Start Backend
    echo "📡 Starting FastAPI Backend..."
    cd backend || exit
    # 'uv run' works great here
    uv run uvicorn app:app --reload > ../backend.log 2>&1 &
    echo $! > "../$BACK_PID_FILE"
    cd ..

    # 2. Start Frontend
    echo "🎨 Starting React Frontend..."
    cd frontend || exit
    npm run dev > ../frontend.log 2>&1 &
    echo $! > "../$FRONT_PID_FILE"
    cd ..

    echo "✅ Services started in background."
}

stop_apps() {
    echo "🛑 Stopping services (Windows Force Mode)..."

    # Use a more robust way to grab the LAST column (the PID) from netstat
    # We look for 'LISTENING' to make sure we don't kill a random connection
    FRONT_PID=$(netstat -ano | grep :5173 | grep LISTENING | awk '{print $NF}' | head -n 1)
    BACK_PID=$(netstat -ano | grep :8000 | grep LISTENING | awk '{print $NF}' | head -n 1)

    if [ -n "$FRONT_PID" ] && [ "$FRONT_PID" -gt 0 ] 2>/dev/null; then
        echo "Terminating Frontend (PID: $FRONT_PID)"
        taskkill //F //T //PID "$FRONT_PID"
    fi

    if [ -n "$BACK_PID" ] && [ "$BACK_PID" -gt 0 ] 2>/dev/null; then
        echo "Terminating Backend (PID: $BACK_PID)"
        taskkill //F //T //PID "$BACK_PID"
    fi

    # Cleanup the PID files
    rm -f "$FRONT_PID_FILE" "$BACK_PID_FILE"
    echo "✨ Ports 5173 and 8000 are clean."
}

case "$1" in
    start) start_apps ;;
    stop) stop_apps ;;
    restart) stop_apps; sleep 2; start_apps ;;
    *) echo "Usage: $0 {start|stop|restart}"; exit 1 ;;
esac