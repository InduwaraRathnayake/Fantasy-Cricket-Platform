import logging
from typing import Dict, List
import numpy as np
from pymongo import MongoClient
import google.generativeai as genai
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from src.config.settings import MONGODB_URI, DB_NAME, COLLECTION_NAME, GOOGLE_API_KEY, MODEL_NAME

logger = logging.getLogger(__name__)

class Spiriter:
    def __init__(self):
        # Initialize MongoDB connection
        self.client = MongoClient(MONGODB_URI)
        self.db = self.client[DB_NAME]
        self.collection = self.db[COLLECTION_NAME]
        
        # Initialize Gemini
        genai.configure(api_key=GOOGLE_API_KEY)
        self.model = genai.GenerativeModel(MODEL_NAME)
        
        # Initialize vectorizer and document storage
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.documents = []
        self.player_data = []
        
        # Chat configuration
        self.temperature = 0.7
        self.max_tokens = 200
        self.context_window = 5 
        self.chat_history = []
        self.system_prompt = """You are Spiriter, an AI chatbot designed to provide users with information about players' personal details and statistics based on the available dataset. Your responses must be concise, factual, and directly relevant to the user's queries.
                                1. If a user asks about any player's statistics, retrieve the relevant data from the dataset and provide an accurate response.
                                2. If a user asks for information that is not available in the dataset, respond with: 'I don't have enough knowledge to answer that question.'
                                3. Under no circumstances should you reveal a player's points. If a user asks for points, politely refuse to answer without disclosing any numerical values.
                                4. Maintain a professional and neutral tone in all interactions.
                            Always ensure that your responses align strictly with the data provided and do not generate or infer any additional information beyond the dataset."""     
        # Initialize data
        self.prepare_data()

    def prepare_data(self):
        """Prepare palyer data for searching"""
        try:
            players = self.collection.find({})
            
            for player in players:
                text_parts = []
                
                # Add core informations
                text_parts.append(f"Player Name - {player.get('Name', '')} and University - {player.get('University', '')}")
                text_parts.append(f"Category - {player.get('Category', '')}")
                text_parts.append(f"Total Runs - {player.get('Total Runs', '')}")
                text_parts.append(f"Balls Faced - {player.get('Balls Faced', '')}")
                text_parts.append(f"Innings Played - {player.get('Innings Played', '')}")
                text_parts.append(f"Wickets - {player.get('Wickets', '')}")
                text_parts.append(f"Overs Bowled - {player.get('Overs Bowled', '')}")
                text_parts.append(f"Runs Conceded - {player.get('Runs Conceded', '')}")

                final_text = " ".join(text_parts).strip()
                self.documents.append(final_text)
                self.player_data.append(player)
            
            if self.documents:
                self.tfidf_matrix = self.vectorizer.fit_transform(self.documents)
            else:
                logger.warning("No player documents found to process")
            
        except Exception as e:
            logger.error(f"Error preparing player data: {str(e)}")
            raise

    def prepare_context(self, query: str) -> str:
        """Prepare context for the model using relevant player content and chat history."""
        # Get relevant course content
        relevant_player = self.find_relevant_players(query)
        
        if not relevant_player:
            return "I couldn't find any relevant players for your query."
        
        # Create context with detailed course information
        context = "Relevant player details:\n\n"
        for player in relevant_player:
            context += self.format_player_info(player) + "\n" + "-"*50 + "\n"
        
        # Combine chat history and new query
        context_parts = [
            "Previous context:",
            *[f"{'User: ' if i%2==0 else 'Assistant: '}{msg}" 
              for i, msg in enumerate(self.chat_history[-self.context_window:])],
            f"Current query: {query}",
            context
        ]
        
        return "\n".join(context_parts)

    def format_player_info(self, player: Dict) -> str:
        """Format course information in a readable way"""
        info = []

        info.append(f"Player Name - {player.get('Name', '')} and His University - {player.get('University', '')}")
        info.append(f"Category - {player.get('Category', '')}")
        info.append(f"Total Runs - {player.get('Total Runs', '')}")
        info.append(f"Balls Faced - {player.get('Balls Faced', '')}")
        info.append(f"Innings Played - {player.get('Innings Played', '')}")
        info.append(f"Wickets - {player.get('Wickets', '')}")
        info.append(f"Overs Bowled - {player.get('Overs Bowled', '')}")
        info.append(f"Runs Conceded - {player.get('Runs Conceded', '')}")
        
        # # Basic course information
        # info.append(f"Course: {course.get('moduleCode')} - {course.get('moduleTitle')}")
        # info.append(f"Semester: {', '.join(map(str, course.get('semester', [])))} ({course.get('intake', '')})")
        # info.append(f"Credits: {course.get('credits')}")
        # info.append(f"Type: {course.get('compulsoryOrElective')} ({course.get('gpaOrNgpa', '')})")
        
        # # Prerequisites
        # prereqs = course.get('prerequisitesOrCorequisites', [])
        # if prereqs and any(prereq for prereq in prereqs):
        #     info.append(f"Prerequisites: {', '.join(prereq for prereq in prereqs if prereq)}")
        
        # # Hours per week
        # if course.get('hoursPerWeek'):
        #     info.append("\nWeekly Hours:")
        #     info.append(f"- Lectures: {course['hoursPerWeek'].get('lecture', 0)} hours")
        #     info.append(f"- Tutorial/Labs: {course['hoursPerWeek'].get('lab_tutes', 0)} hours")
        
        # # Evaluation
        # if course.get('evaluation'):
        #     info.append("\nEvaluation:")
        #     info.append(f"- Continuous Assessment (CA): {course['evaluation'].get('CA', 0)}%")
        #     info.append(f"- Written Exam (WE): {course['evaluation'].get('WE', 0)}%")
        
        # # Learning outcomes
        # if course.get('learningOutcomes'):
        #     info.append("\nLearning Outcomes:")
        #     info.extend(f"- {outcome}" for outcome in course['learningOutcomes'] if outcome)
        
        # # Syllabus content
        # if course.get('syllabusOutline') and course['syllabusOutline'].get('content'):
        #     info.append("\nSyllabus Content:")
        #     for topic in course['syllabusOutline']['content']:
        #         if topic.get('topic'):
        #             info.append(f"\n- {topic['topic']}")
        #             if topic.get('subtopics') and any(topic['subtopics']):
        #                 info.extend(f"  * {subtopic}" for subtopic in topic['subtopics'] if subtopic)
        
        return "\n".join(info)

    def find_relevant_players(self, query: str, top_k: int = 3) -> List[Dict]:
        """Find most relevant player for the given query"""
        if not self.player_data:
            return []
            
        try:
            # Create query vector
            query_vector = self.vectorizer.transform([query])
            
            # Calculate similarities
            similarities = cosine_similarity(query_vector, self.tfidf_matrix)
            
            # Get top-k most similar documents
            top_indices = np.argsort(similarities[0])[-top_k:][::-1]
            return [self.player_data[i] for i in top_indices]
            
        except Exception as e:
            logger.error(f"Error getting relevant player: {str(e)}")
            return []

    def generate_response(self, query: str) -> str:
        """Generate a response based on the query and relevant courses using Gemini"""
        try:
            # Prepare context
            context = self.prepare_context(query)
            
            # Construct the prompt
            full_prompt = f"{self.system_prompt}\n\nContext:\n{context}\n\nResponse:"
            
            # Generate response with specific parameters
            response = self.model.generate_content(
                full_prompt,
                generation_config={
                    'temperature': self.temperature,
                    'max_output_tokens': self.max_tokens,
                    'top_p': 0.8,
                    'top_k': 40
                }
            )
            
            # Update chat history
            self.chat_history.extend([query, response.text])
            
            # Trim chat history if it gets too long
            if len(self.chat_history) > self.context_window * 2:
                self.chat_history = self.chat_history[-self.context_window * 2:]
            
            return response.text
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            # Fallback response with basic course information
            return "I apologize, but I encountered an error. Please try again."
        
    def set_temperature(self, temperature: float) -> None:
        """Adjust the temperature (creativity) of responses."""
        if 0 <= temperature <= 1:
            self.temperature = temperature
            logger.info(f"Temperature updated to {temperature}")
        else:
            raise ValueError("Temperature must be between 0 and 1")

    def set_max_tokens(self, max_tokens: int) -> None:
        """Set maximum tokens for response."""
        if max_tokens > 0:
            self.max_tokens = max_tokens
            logger.info(f"Max tokens updated to {max_tokens}")
        else:
            raise ValueError("Max tokens must be greater than 0")

    def update_system_prompt(self, new_prompt: str) -> None:
        """Update the system prompt."""
        if new_prompt.strip():
            self.system_prompt = new_prompt
            logger.info("System prompt updated")
        else:
            raise ValueError("System prompt cannot be empty")

    def clear_chat_history(self) -> None:
        """Clear the chat history."""
        self.chat_history = []
        logger.info("Chat history cleared")

    def set_context_window(self, size: int) -> None:
        """Set the size of the context window."""
        if size > 0:
            self.context_window = size
            logger.info(f"Context window size updated to {size}")
        else:
            raise ValueError("Context window size must be greater than 0")

    def get_chat_history(self) -> List[str]:
        """Return the current chat history."""
        return self.chat_history

    def refresh_player_data(self) -> None:
        """Refresh player data from the database."""
        self.documents = []
        self.player_data = []
        self.prepare_data()
        logger.info("Player data refreshed")