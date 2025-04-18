# dbconfig_xampp.py
import os
from dotenv import load_dotenv
load_dotenv()

# MySQL configuration for XAMPP
db_user = os.getenv('MYSQL_USER', 'root')
db_pass = os.getenv('MYSQL_PASSWORD', '')
db_host = os.getenv('MYSQL_HOST', 'localhost')
db_port = os.getenv('MYSQL_PORT', '3306')
db_name = os.getenv('MYSQL_DATABASE', 'serenityq')

SQLALCHEMY_DATABASE_URI = f'mysql://{db_user}:{db_pass}@{db_host}:{db_port}/{db_name}'
SQLALCHEMY_TRACK_MODIFICATIONS = False