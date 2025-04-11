# imports.py

# Flask-related imports
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from werkzeug.security import generate_password_hash, check_password_hash
# Cryptography-related imports
from cryptography.fernet import Fernet
from flask_cors import CORS
from dotenv import load_dotenv
import os
# Other useful imports
import socket
import datetime

load_dotenv()
db = SQLAlchemy()
jwt = JWTManager()

jwt_secret_key = os.getenv('JWT_SECRET_KEY')
admin_secret_key = os.getenv('ADMIN_SECRET_KEY')