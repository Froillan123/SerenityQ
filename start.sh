#!/usr/bin/env bash
# start.sh - Script to ensure database is set up before starting the application

echo "🚀 Starting SerenityQ application..."

# Set environment variables
export FLASK_APP=app.py 
export PYTHONUNBUFFERED=1

# Try to create tables directly (in case migrations failed during build)
echo "📊 Ensuring database tables exist..."
python -c "
from app import app, db; 
with app.app_context(): 
    try:
        db.create_all()
        print('✅ Database tables verified/created')
    except Exception as e:
        print(f'⚠️ Table check error: {str(e)}')
"

# Start the app with Gunicorn
echo "🚀 Starting server..."
gunicorn app:app "$@" 