# dbconfig.py

import os

# Fetching database URL from environment variables
SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost/dbname')
SQLALCHEMY_TRACK_MODIFICATIONS = False
