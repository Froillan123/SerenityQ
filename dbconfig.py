# dbconfig.py
import os
from urllib.parse import quote_plus
from dotenv import load_dotenv
load_dotenv()

# Fetch database URL from environment variables
database_url = os.getenv('DATABASE_URL')

# If DATABASE_URL isn't set, construct it from individual components
if not database_url:
    db_user = os.getenv('PGUSER', 'postgres')
    db_pass = quote_plus(os.getenv('PGPASSWORD', ''))
    db_host = os.getenv('PGHOST', 'localhost')
    db_port = os.getenv('PGPORT', '5432')
    db_name = os.getenv('PGDATABASE', 'serenityq')
    database_url = f'postgresql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}'

SQLALCHEMY_DATABASE_URI = database_url
SQLALCHEMY_TRACK_MODIFICATIONS = False

DB_CONFIG = {
    'host': os.getenv('DB_HOST'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'database': os.getenv('DB_NAME')
}
