# dbconfig.py
import os
import sys
from dotenv import load_dotenv
load_dotenv()

# Railway PostgreSQL database connection
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:SSUFPJfWdKlXdtwMGIlXOMDYkQVwdDRE@shortline.proxy.rlwy.net:19479/railway')

# Print connection info for debugging
print(f"🚂 Connecting to Railway PostgreSQL: {DATABASE_URL[:25]}...{DATABASE_URL[-20:]}")

# Fix for SQLAlchemy 1.4.x
if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
    print("🔧 Fixed PostgreSQL URL format")

# Configure SQLAlchemy
SQLALCHEMY_DATABASE_URI = DATABASE_URL
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Add SSL configuration for Railway PostgreSQL
SQLALCHEMY_ENGINE_OPTIONS = {
    'connect_args': {
        'sslmode': 'require',
        'sslrootcert': None,
        'sslcert': None,
        'sslkey': None
    },
    # Add this to help with connection stability
    'pool_pre_ping': True,
    'pool_recycle': 300,
    'pool_size': 10,
    'max_overflow': 15
}

# For backward compatibility with other components
DB_CONFIG = {
    'url': DATABASE_URL,
    'host': os.getenv('DB_HOST', 'shortline.proxy.rlwy.net'),
    'port': os.getenv('DB_PORT', '19479'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'SSUFPJfWdKlXdtwMGIlXOMDYkQVwdDRE'),
    'database': os.getenv('DB_NAME', 'railway')
}
