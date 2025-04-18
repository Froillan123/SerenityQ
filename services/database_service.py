from typing import List, Dict, Optional
from models import (
    db, AIChat, AIChatMessage, AIUserPreference, 
    AIMatchHistory, Psychologist, User
)
from datetime import datetime
from sqlalchemy import text, inspect  # Added inspect import here

class DatabaseService:
    async def create_chat_session(self, user_id: int):
        chat = AIChat(user_id=user_id)
        db.session.add(chat)
        db.session.commit()
        return chat

    async def save_message(self, chat_id: int, role: str, content: str):
        message = AIChatMessage(
            chat_id=chat_id,
            role=role,
            content=content
        )
        db.session.add(message)
        db.session.commit()
        return message

    async def get_chat_history(self, chat_id: int) -> List[Dict]:
        messages = AIChatMessage.query.filter_by(chat_id=chat_id)\
            .order_by(AIChatMessage.created_at.asc())\
            .all()
        
        return [
            {
                "role": msg.role,
                "content": msg.content
            }
            for msg in messages
        ]

    async def update_message_intent(self, chat_id: int, intent_analysis: Dict):
        message = AIChatMessage.query.filter_by(chat_id=chat_id)\
            .order_by(AIChatMessage.created_at.desc())\
            .first()
        
        if message:
            message.intent = intent_analysis.get('intent')
            message.entities = intent_analysis.get('entities')
            db.session.commit()

    async def update_user_preferences(self, user_id: int, intent_analysis: Dict):
        prefs = AIUserPreference.query.filter_by(user_id=user_id).first()
        if not prefs:
            prefs = AIUserPreference(user_id=user_id)
            db.session.add(prefs)
            
        if 'symptoms' in intent_analysis.get('entities', {}):
            prefs.symptoms = ",".join(intent_analysis['entities']['symptoms'])
            
        if 'preferences' in intent_analysis.get('entities', {}):
            if 'gender' in intent_analysis['entities']['preferences']:
                prefs.preferred_gender = intent_analysis['entities']['preferences']['gender']
            if 'approach' in intent_analysis['entities']['preferences']:
                prefs.preferred_approach = intent_analysis['entities']['preferences']['approach']
        
        db.session.commit()
        return prefs

    async def get_user_preferences(self, user_id: int):
        return AIUserPreference.query.filter_by(user_id=user_id).first()

    async def get_verified_psychologists(self):
        return Psychologist.query.filter_by(
            is_verified=True, 
            is_approved=True
        ).all()

    async def save_match_history(self, user_id: int, psychologist_id: int, 
                               chat_id: int, score: float, reasons: Dict):
        match = AIMatchHistory(
            user_id=user_id,
            psychologist_id=psychologist_id,
            chat_id=chat_id,
            match_score=score,
            match_reasons=reasons
        )
        db.session.add(match)
        db.session.commit()
        return match

    async def verify_db_connection(self):
        try:
            db.session.execute(text('SELECT 1'))
            print("Database connection successful!")
            return True
        except Exception as e:
            print(f"Database connection failed: {str(e)}")
            return False

    async def check_tables_exist(self):
        try:
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            print("Existing tables:", tables)
            
            required_tables = {'users', 'ai_chats', 'ai_user_preferences'}
            missing_tables = required_tables - set(tables)
            
            if missing_tables:
                print(f"Missing tables: {missing_tables}")
                return False
            return True
        except Exception as e:
            print(f"Error checking tables: {str(e)}")
            return False

    async def verify_user_exists(self, username: str = 'kimperor'):
        try:
            user = User.query.filter_by(username=username).first()
            if user:
                print(f"User found: {user.username} ({user.email})")
                return True, user
            print(f"User '{username}' not found in database!")
            return False, None
        except Exception as e:
            print(f"Error checking user: {str(e)}")
            return False, None

    async def init_chat_session(self, username: str = 'kimperor'):
        try:
            user_found, user = await self.verify_user_exists(username)
            if not user_found:
                print("Error: User not found in database!")
                return None, None

            print(f"\nLogged in as: {user.first_name} {user.last_name}")
            print(f"Email: {user.email}")

            # Get or create chat session
            chat = AIChat.query.filter_by(user_id=user.id).first()
            if not chat:
                chat = AIChat(
                    user_id=user.id,
                    status='active'
                )
                db.session.add(chat)
                db.session.commit()

            # Get or create user preferences
            prefs = AIUserPreference.query.filter_by(user_id=user.id).first()
            if not prefs:
                prefs = AIUserPreference(
                    user_id=user.id,
                    symptoms="anxiety,depression",
                    preferred_gender="female",
                    price_range_max=150.00,
                    preferred_approach="cognitive behavioral therapy"
                )
                db.session.add(prefs)
                db.session.commit()

            return user, chat

        except Exception as e:
            print(f"Error initializing chat session: {str(e)}")
            db.session.rollback()
            return None, None