from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .orchestrator import ExpertOrchestrator
import json

router = APIRouter(prefix="/api/expert", tags=["Expert"])
orchestrator = ExpertOrchestrator()

class CodeInput(BaseModel):
    code: str
    language: str = "python"

@router.post("/review")
def review_code(input: CodeInput):
    try:
        result = orchestrator.review_code(input.code, input.language)
        return {"status": "success", "data": result.model_dump()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
def health_check():
    return {"status": "ok", "service": "expert-orchestrator"}
