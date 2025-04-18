import google.generativeai as genai
from typing import Dict, List
from models import db
from sqlalchemy import inspect
import json

class GeminiService:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.0-pro')
        self.chat = self.model.start_chat(history=[])

    async def get_database_schema(self) -> str:
        """Get the database schema as a string for context"""
        inspector = inspect(db.engine)
        schema = []
        
        for table_name in inspector.get_table_names():
            columns = []
            for column in inspector.get_columns(table_name):
                columns.append(f"{column['name']} ({column['type']})")
            
            schema.append(f"Table: {table_name}\nColumns: {', '.join(columns)}")
        
        return "\n\n".join(schema)

    async def generate_response(self, prompt: str, user_id: int) -> Dict:
        """Generate a response with database context"""
        try:
            # Get database schema for context
            schema = await self.get_database_schema()
            
            # Get user info from database
            user = User.query.get(user_id)
            user_info = f"User: {user.username}, Email: {user.email}" if user else ""
            
            # Create enhanced prompt
            enhanced_prompt = f"""
            Database Schema:
            {schema}
            
            User Info:
            {user_info}
            
            Current Conversation:
            {prompt}
            
            Instructions:
            1. Analyze the user's message in context of the database schema
            2. Provide helpful response considering available data
            3. If relevant, suggest database queries that could provide more info
            """
            
            response = self.chat.send_message(enhanced_prompt)
            return {
                "response": response.text,
                "should_query_db": self._should_query_db(response.text),
                "possible_queries": self._extract_possible_queries(response.text)
            }
            
        except Exception as e:
            print(f"Error in GeminiService: {str(e)}")
            return {
                "response": "I encountered an error processing your request.",
                "should_query_db": False,
                "possible_queries": []
            }

    def _should_query_db(self, response: str) -> bool:
        """Determine if the response suggests database queries are needed"""
        return any(keyword in response.lower() for keyword in 
                  ['query', 'search', 'look up', 'find', 'retrieve'])

    def _extract_possible_queries(self, response: str) -> List[str]:
        """Extract potential database queries from the response"""
        # This is a simple implementation - you might want to enhance it
        queries = []
        if "SELECT" in response:
            queries = [line for line in response.split('\n') if "SELECT" in line]
        return queries