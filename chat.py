from flask import Flask
import asyncio
from services import AIChatService, DatabaseService
import os
from dotenv import load_dotenv
from models import db
from sqlalchemy import inspect
from dbconfig_xampp import SQLALCHEMY_DATABASE_URI
import google.generativeai as genai

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configure Flask app
    app.config['GEMINI_API_KEY'] = os.getenv('GEMINI_API_KEY')
    
    # Set up the model
    generation_config = {
        "temperature": 0.9,
        "top_p": 1,
        "top_k": 1,
        "max_output_tokens": 2048,
    }

    safety_settings = [
        {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_MEDIUM_AND_ABOVE"
        },
        # Add other safety settings as needed
    ]

    app.config['GEMINI_MODEL'] = genai.GenerativeModel(
        model_name="gemini-1.0-pro",  # Updated model name
        generation_config=generation_config,
        safety_settings=safety_settings
    )
    
    # Initialize Gemini
    genai.configure(api_key=app.config['GEMINI_API_KEY'])
    
    # Use XAMPP MySQL configuration
    app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    
    return app

async def run_chat():
    try:
        # Initialize services
        db_service = DatabaseService()
        chat_service = AIChatService(db_service)
        
        # Get user and chat session
        user, chat = await db_service.init_chat_session()
        if not user or not chat:
            return
        
        print("\n=== Welcome to SerenityQ AI Chat ===")
        print(f"Session ID: {chat.id}")
        print("\nCommands:")
        print("- Type 'quit' to exit")
        print("- Type 'matches' to see psychologist recommendations")
        print("- Type 'clear' to start a new chat session")
        print("\nStart chatting about how you're feeling or what kind of help you're looking for.")
        
        while True:
            user_input = input("\nYou: ").strip()
            
            if not user_input:
                continue
                
            if user_input.lower() == 'quit':
                print("\nThank you for using SerenityQ AI Chat. Take care!")
                break
                
            if user_input.lower() == 'clear':
                chat = AIChat(user_id=user.id, status='active')
                db.session.add(chat)
                db.session.commit()
                print("\nStarted new chat session.")
                continue
                
            if user_input.lower() == 'matches':
                matches = await chat_service._find_matching_psychologists(user.id, chat.id)
                if matches:
                    print("\nMatching Psychologists:")
                    for match in matches:
                        psych = match['psychologist']
                        print(f"\n- Dr. {psych['first_name']} {psych['last_name']}")
                        print(f"  Primary Specialty: {psych['primary_specialty']}")
                        print(f"  Specialties: {', '.join(psych['specialties'])}")
                        print(f"  Years of Experience: {psych['years_experience']}")
                        print(f"  Match Score: {match['score']:.2f}")
                        if match.get('match_reasons'):
                            print("  Match Reasons:")
                            for category, reasons in match['match_reasons'].items():
                                if reasons:
                                    print(f"    - {category.replace('_', ' ').title()}: {', '.join(reasons)}")
                else:
                    print("\nNo matching psychologists found at the moment.")
                continue
            
            try:
                response = await chat_service.process_message(
                    chat_id=chat.id,
                    user_id=user.id,
                    content=user_input
                )
                
                print("\nAI:", response['response'])
                
                if response['should_show_matches'] and response['matches']:
                    print("\nRecommended Psychologists:")
                    for match in response['matches']:
                        psych = match['psychologist']
                        print(f"\n- Dr. {psych['first_name']} {psych['last_name']}")
                        print(f"  Primary Specialty: {psych['primary_specialty']}")
                        print(f"  Specialties: {', '.join(psych['specialties'])}")
                        print(f"  Years of Experience: {psych['years_experience']}")
                        print(f"  Match Score: {match['score']:.2f}")
                        
            except Exception as e:
                print(f"\nError processing message: {str(e)}")
                print("Please try again or type 'clear' to start a new session.")
                    
    except Exception as e:
        print(f"Error during chat: {str(e)}")

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db_service = DatabaseService()
        
        # Verify database connection
        if not asyncio.run(db_service.verify_db_connection()):
            print("\nFailed to connect to database. Please check your database connection.")
            exit(1)
            
        # Check tables exist
        if not asyncio.run(db_service.check_tables_exist()):
            print("\nRequired tables are missing. Please run database migrations.")
            exit(1)
            
        # Verify test user exists
        user_found, _ = asyncio.run(db_service.verify_user_exists())
        if not user_found:
            print("\nTest user not found. Please create the user first.")
            exit(1)
            
        asyncio.run(run_chat())