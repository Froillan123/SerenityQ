# 🧠⚡ SerenityQ: AI-Powered Mental Health Companion

<div align="center">
  <img src="https://media.giphy.com/media/L1R1tvI9svkIWwpVYr/giphy.gif" width="400" alt="Mental Health Awareness" autoplay>
  <br>
  <em>Your intelligent gateway to personalized mental health support</em>
</div>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![Python](https://img.shields.io/badge/Python-3.9+-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-2.0+-green?logo=flask)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue?logo=postgresql)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript)

## 🌟 Table of Contents
- [✨ Why SerenityQ?](#-why-serenityq)
- [🚀 Key Features](#-key-features)
- [🛠 Tech Stack](#-tech-stack)
- [🎯 How It Works](#-how-it-works)
- [🧭 Getting Started](#-getting-started)
- [🌈 Project Showcase](#-project-showcase)
- [🔒 Data Privacy](#-data-privacy--security)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)
- [📬 Contact](#-contact)
- [📋 Database Synchronization Features](#-database-synchronization-features)

## ✨ Why SerenityQ?

> "The right help at the right time" - powered by AI

| Traditional Therapy Booking | SerenityQ Advantage |
|----------------------------|---------------------|
| ❌ Manual therapist search | ✅ **AI-powered matching** |
| ❌ One-size-fits-all approach | ✅ **Personalized recommendations** |
| ❌ Phone tag for appointments | ✅ **Real-time booking** |
| ❌ No progress tracking | ✅ **Data-driven insights** |
| ❌ Limited access | ✅ **24/7 multi-platform access** |

## 🚀 Key Features

### 🧠 AI-Powered Psychologist Matching
```python
# AI Matching Algorithm Example
def match_therapist(user_profile):
    therapists = filter_by_specialty(user_profile['symptoms'])
    therapists = rank_by_compatibility(therapists, user_profile)
    return personalize_recommendations(therapists)


Personalized Recommendations
Therapy approaches (CBT, mindfulness, etc.)

Budget considerations

Gender preference

Language and cultural factors




Seamless Appointment Booking

sequenceDiagram
    User->>+SerenityQ: Select therapist
    SerenityQ->>+Calendar: Check availability
    Calendar-->>-SerenityQ: Available slots
    SerenityQ->>+User: Display options
    User->>+Payment: Confirm booking
    Payment-->>-User: Confirmation



Progress Tracking Dashboard
Session history

Mood trends

Treatment milestones

Customizable metrics




 Secure Communication

 End-to-end encrypted messaging

File sharing for therapy materials

Secure video conferencing


Tech Stack

Frontend
HTML5
CSS3
JavaScript

Backend
Python
Flask

Database
PostgreSQL

Authentication
JWT

Payment
PayPal
Stripe
GCash
Maya


 How It Works

 User Registration
📝 Create account + basic mental health profile

AI Matching
🤖 Algorithm suggests 3-5 ideal therapists

Appointment Booking
🗓 Real-time availability + multiple payment options

Session Tracking
📈 Progress metrics + historical data

Follow-up Support
🔄 Automatic session recommendations

## 📋 Database Synchronization Features

SerenityQ includes automatic database synchronization, similar to how nodemon works in Node.js applications, and Sequelize's `sync({alter: true})` functionality.

### Environment Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Configure your database:
   - Rename `env.sample` to `.env`
   - Set your Railway PostgreSQL URL in the `DATABASE_URL` variable
   - Or use local MySQL (XAMPP) by default if no DATABASE_URL is provided

### Running the Application

You have two ways to run the application with database synchronization:

#### Option 1: Using the run.py script (Recommended)

This method provides automatic model change detection and database migration:

```
python run.py
```

**Features:**
- Automatically detects your database type (PostgreSQL or MySQL)
- Detects changes to models.py file in real-time
- Automatically generates and applies migrations when models change
- Restarts the application when necessary
- Works similarly to nodemon in Node.js

#### Option 2: Using Flask directly

If you prefer more control over migrations:

```
# Start the application (creates database and tables if needed)
python app.py

# When you make model changes:
flask db migrate -m "Description of changes"
flask db upgrade
```

### How It Works

The database synchronization system includes:

1. **Database Detection**: Automatically detects if you're using PostgreSQL (Railway) or MySQL (local)
2. **Table Creation**: Creates tables based on your SQLAlchemy models if none exist
3. **Automatic Migrations**: Similar to Sequelize's `sync({alter: true})`, it detects and applies schema changes
4. **Real-time Monitoring**: Watches for changes to your models and applies migrations automatically

### Database Selection

The system automatically chooses your database based on:

1. If `DATABASE_URL` is present in your `.env` file, it uses PostgreSQL
2. Otherwise, it defaults to MySQL with XAMPP (localhost:3306)

### PostgreSQL on Railway

For Railway deployment:

1. Set your `DATABASE_URL` in the `.env` file
2. The system will handle SSL connections automatically
3. No need to create the database manually - Railway provisions it for you

### Troubleshooting

If you encounter issues with the automatic migrations:

1. Try running migrations manually:
   ```
   flask db stamp head  # Reset migration state
   flask db migrate     # Generate migration
   flask db upgrade     # Apply migration
   ```

2. Check the migration files in the `migrations` directory for any errors

3. Make sure your database server is running:
   - For local development: Start XAMPP/MySQL
   - For Railway: Check your connection string and network access