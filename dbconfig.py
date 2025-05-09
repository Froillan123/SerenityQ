# dbconfig.py
import os
from dotenv import load_dotenv
load_dotenv()

# Fetch database URL directly from environment variables
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:SSUFPJfWdKlXdtwMGIlXOMDYkQVwdDRE@shortline.proxy.rlwy.net:19479/railway')

# Configure SQLAlchemy
SQLALCHEMY_DATABASE_URI = DATABASE_URL
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Add SSL configuration for production PostgreSQL
if 'proxy.rlwy.net' in DATABASE_URL:
    from sqlalchemy.engine.url import make_url
    
    # Enable SSL for Railway PostgreSQL connections
    SQLALCHEMY_ENGINE_OPTIONS = {
        'connect_args': {
            'sslmode': 'require',
            'sslcert': None,
            'sslkey': None,
            'sslrootcert': None
        },
    }
    
    # Print connection info (remove in production)
    url = make_url(DATABASE_URL)
    print(f"Connecting to PostgreSQL: {url.host}:{url.port}/{url.database}")

# For backward compatibility with other components
DB_CONFIG = {
    'url': DATABASE_URL,
    'host': os.getenv('DB_HOST', 'shortline.proxy.rlwy.net'),
    'port': os.getenv('DB_PORT', '19479'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'SSUFPJfWdKlXdtwMGIlXOMDYkQVwdDRE'),
    'database': os.getenv('DB_NAME', 'railway')
}
