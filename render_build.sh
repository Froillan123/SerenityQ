#!/usr/bin/env bash
# render_build.sh - Build script for Render.com deployments

set -o errexit

echo "🔧 Starting SerenityQ build process..."

# Install system dependencies if needed
# apt-get update && apt-get install -y ...

# Install Python dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Initialize database and run migrations
echo "🗄 Setting up database..."
export FLASK_APP=app.py
export RENDER=true

# Try to initialize and apply migrations
echo "🔄 Running database migrations..."
python -m flask db init || echo "Migration directory already exists"
python -m flask db migrate -m "Render deployment migration" || echo "Migration skipped"
python -m flask db upgrade || echo "Upgrade skipped, will use direct table creation"

# Force create tables (backup in case migrations fail)
echo "📊 Force creating database tables..."
python -c "
from app import app, db; 
with app.app_context(): 
    db.create_all(); 
    print('✅ Database tables created')
"

echo "✅ Build process completed successfully!" 