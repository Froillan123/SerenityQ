# imports.py

# Flask-related imports
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from werkzeug.security import generate_password_hash, check_password_hash
# Cryptography-related imports
from cryptography.fernet import Fernet
# Other useful imports
import socket
import datetime

db = SQLAlchemy()
jwt = JWTManager()

