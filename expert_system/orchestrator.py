import json
import requests
from .schemas import CodeReview, TacticalDecision

class ExpertOrchestrator:
    def __init__(self):
        self.base_url = "http://127.0.0.1:8741/v1"
        self.api_key = "any-value"
        
        # 👑 SYSTEM BLUEPRINT: บังคับให้ตอบเป็น JSON 100%
        self.coding_blueprint = (
            "You are 'Codex-Engineer', an elite Senior Software Engineer. "
            "You MUST respond ONLY with valid JSON. No markdown, no backticks, no explanation outside JSON. "
            "The JSON must follow this exact schema:\n"
            "{\n"
            '  "has_bugs": true/false,\n'
            '  "security_issues": ["issue1", "issue2"],\n'
            '  "performance_issues": ["issue1"],\n'
            '  "refactored_code": "the improved code as a single string",\n'
            '  "reasoning": "your step-by-step reasoning"\n'
            "}\n"
            "Analyze the code for bugs, security (OWASP Top 10), and performance. "
            "Then output the JSON."
        )

    def review_code(self, code_snippet: str, language: str = "python") -> CodeReview:
        prompt = f"Language: {language}\n\nCode to review:\n```{language}\n{code_snippet}\n```"
        
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": self.coding_blueprint},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.1
            # ไม่ส่ง response_format เพราะ Puter ไม่รองรับ
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        response = requests.post(
            f"{self.base_url}/chat/completions",
            headers=headers,
            json=payload,
            timeout=60
        )
        
        if response.status_code != 200:
            raise Exception(f"API Error: {response.status_code} - {response.text}")
        
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        
        # ทำความสะอาดข้อความ (เผื่อบอทใส่ ```json ... ``` มาด้วย)
        content = content.strip()
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        # แปลง JSON กลับเป็น Pydantic Model
        return CodeReview.model_validate_json(content)

# ทดสอบการทำงานเบื้องต้น
if __name__ == "__main__":
    orchestrator = ExpertOrchestrator()
    test_code = "def get_user(id):\n    query = f'SELECT * FROM users WHERE id = {id}'\n    return db.execute(query)"
    result = orchestrator.review_code(test_code)
    print("🤖 Code Review Result:")
    print(f"Has Bugs: {result.has_bugs}")
    print(f"Security Issues: {result.security_issues}")
    print(f"Refactored Code:\n{result.refactored_code}")
