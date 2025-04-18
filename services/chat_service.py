import google.generativeai as genai
from typing import Dict, List, Optional
import json
from sklearn.metrics.pairwise import cosine_similarity
from flask import current_app
from .database_service import DatabaseService
from gemini_service import GeminiService
import os

class AIChatService:
     def __init__(self, db_service: DatabaseService):
        self.db_service = db_service
        self.gemini = GeminiService(os.getenv('GEMINI_API_KEY'))
        self.system_prompt = """You are an empathetic AI assistant for a mental health platform called SerenityQ. 
        Your role is to help users find the most suitable psychologist based on their needs, symptoms, and preferences. 
        Follow these guidelines:
        
        1. Start by understanding the user's symptoms and emotional state
        2. Ask about their preferences for a therapist (gender, language, approach)
        3. Consider their schedule and budget constraints
        4. Use empathetic and supportive language
        5. Never provide medical diagnosis or treatment advice
        6. Always encourage professional help for serious concerns
        7. Maintain confidentiality and privacy
        8. Be sensitive to cultural and personal differences
        
        When matching with psychologists, consider:
        - Expertise matching the user's symptoms
        - Language and cultural compatibility
        - Schedule availability
        - Price range alignment
        - Treatment approach preferences
        
        Format your responses in a conversational, empathetic manner."""

async def create_chat_session(self, user_id: int):
        return await self.db.create_chat_session(user_id)

async def process_message(self, chat_id: int, user_id: int, content: str) -> Dict:
        try:
            # Save user message
            await self.db.save_message(chat_id, "user", content)
            
            # Get chat history
            messages = await self.db.get_chat_history(chat_id)
            
            # Analyze intent
            intent_analysis = await self._analyze_intent(content)
            await self.db.update_message_intent(chat_id, intent_analysis)
            
            # Generate AI response
            ai_response = await self._generate_ai_response(messages)
            await self.db.save_message(chat_id, "assistant", ai_response['content'])
            
            # Update preferences if needed
            if intent_analysis['intent'] in ['share_symptoms', 'state_preferences', 'discuss_budget']:
                await self.db.update_user_preferences(user_id, intent_analysis)
            
            # Check for matches
            should_match = self._should_suggest_match(messages)
            matches = []
            if should_match:
                matches = await self._find_matching_psychologists(user_id, chat_id)
            
            return {
                'response': ai_response['content'],
                'intent': intent_analysis['intent'],
                'should_show_matches': should_match,
                'matches': matches
            }
            
        except Exception as e:
            current_app.logger.error(f"Error processing message: {str(e)}")
            raise

async def _analyze_intent(self, content: str) -> Dict:
        try:
            prompt = f"""Analyze this mental health message and return JSON with:
            {{
              "intent": "share_symptoms|request_therapist|etc",
              "symptoms": ["anxiety", "depression"],
              "preferences": {{
                "gender": "male|female|any",
                "approach": "CBT|DBT|etc"
              }},
              "urgency": 1-5
            }}\n\nMessage: {content}"""
            
            response = self.model.generate_content(prompt)
            return json.loads(response.text)
        except Exception as e:
            current_app.logger.error(f"Intent analysis error: {str(e)}")
            return {"intent": "unknown", "entities": {}}

async def _generate_ai_response(self, messages: List[Dict]) -> Dict:
        try:
            chat = self.model.start_chat()
            response = chat.send_message(
                self.system_prompt + "\n\nConversation history:\n" +
                "\n".join(f"{m['role']}: {m['content']}" for m in messages)
            )
            
            return {
                "content": response.text,
                "tokens_used": len(response.text.split())
            }
        except Exception as e:
            current_app.logger.error(f"Response generation error: {str(e)}")
            raise

async def _find_matching_psychologists(self, user_id: int, chat_id: int, limit: int = 3) -> List[Dict]:
        try:
            preferences = await self.db.get_user_preferences(user_id)
            if not preferences:
                return []
            
            psychologists = await self.db.get_verified_psychologists()
            
            matches = []
            for psych in psychologists:
                score = self._calculate_match_score(preferences, psych)
                
                if score >= 0.6:
                    match_reasons = self._get_match_reasons(preferences, psych)
                    await self.db.save_match_history(user_id, psych.id, chat_id, score, match_reasons)
                    
                    matches.append({
                        "psychologist": psych.to_dict(),
                        "score": score,
                        "match_reasons": match_reasons
                    })
            
            matches.sort(key=lambda x: x['score'], reverse=True)
            return matches[:limit]
        except Exception as e:
            current_app.logger.error(f"Matching error: {str(e)}")
            return []

def _calculate_match_score(self, preferences, psychologist) -> float:
        scores = []
        
        if preferences.symptoms and psychologist.specialties:
            specialty_score = self._calculate_text_similarity(
                preferences.symptoms,
                psychologist.specialties
            )
            scores.append(specialty_score * 0.4)
        
        if preferences.preferred_gender:
            gender_score = 1.0 if preferences.preferred_gender.lower() in psychologist.gender.lower() else 0.0
            scores.append(gender_score * 0.1)
        
        if preferences.price_range_max:
            price_score = 1.0 if psychologist.session_price <= preferences.price_range_max else 0.0
            scores.append(price_score * 0.3)
        
        if preferences.preferred_approach and psychologist.approach:
            approach_score = self._calculate_text_similarity(
                preferences.preferred_approach,
                psychologist.approach
            )
            scores.append(approach_score * 0.2)
        
        return sum(scores) / len(scores) if scores else 0.0

def _calculate_text_similarity(self, text1: str, text2: str) -> float:
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        return len(intersection) / len(union) if union else 0.0

def _should_suggest_match(self, messages: List[Dict]) -> bool:
        user_message_count = sum(1 for msg in messages if msg['role'] == 'user')
        return user_message_count >= 3

def _get_match_reasons(self, preferences, psychologist) -> Dict:
        reasons = {
            "specialty_match": [],
            "approach_match": [],
            "other_factors": []
        }
        
        if preferences.symptoms and psychologist.specialties:
            common_specialties = set(preferences.symptoms.lower().split()) & \
                               set(psychologist.specialties.lower().split(','))
            if common_specialties:
                reasons["specialty_match"].extend(list(common_specialties))
        
        if preferences.preferred_approach and psychologist.approach:
            if preferences.preferred_approach.lower() in psychologist.approach.lower():
                reasons["approach_match"].append(preferences.preferred_approach)
        
        if preferences.preferred_gender and \
           preferences.preferred_gender.lower() == psychologist.gender.lower():
            reasons["other_factors"].append("gender preference match")
        
        return reasons
