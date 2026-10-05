from google import genai
from config import settings

SYSTEM_INSTRUCTION = (
    "You are an AI College FAQ Assistant.\n"
    "Answer only from the retrieved college knowledge-base context.\n"
    "Do not use unsupported external knowledge.\n"
    "If the retrieved context does not contain the answer, respond:\n"
    "'I couldn't find this information in the college knowledge base. Please contact the relevant college department for confirmation.'\n"
    "Never invent: dates, fees, regulations, contact information, faculty information, examination schedules, or policies.\n"
    "Keep answers concise, accurate and student-friendly."
)

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = None
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)

    def answer_query(self, question: str, retrieved_contexts: list[dict]) -> str:
        if not self.client:
            return (
                "GEMINI_API_KEY is not configured on the server. "
                "Please configure the key in your .env file."
            )

        if not retrieved_contexts:
            return "I couldn't find this information in the college knowledge base. Please contact the relevant college department for confirmation."

        context_blocks = []
        for i, ctx in enumerate(retrieved_contexts):
            context_blocks.append(f"--- Context {i+1} (Source: {ctx['source']}) ---\n{ctx['text']}")

        full_context = "\n\n".join(context_blocks)
        prompt = (
            f"Retrieved College Knowledge Base:\n{full_context}\n\n"
            f"Student Question: {question}\n\n"
            f"Student-friendly answer:"
        )

        try:
            response = self.client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config={
                    "system_instruction": SYSTEM_INSTRUCTION,
                    "temperature": 0.1,
                }
            )
            return response.text.strip()
        except Exception as e:
            return f"An error occurred while generating the answer: {str(e)}"

gemini_service = GeminiService()