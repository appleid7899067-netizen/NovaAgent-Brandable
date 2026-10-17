from fastapi import FastAPI
from expert_system.api import router

app = FastAPI(title="Expert Orchestrator API")
app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    print("🚀 เปิด Expert API ที่ http://localhost:8001")
    print("📚 ดู Swagger UI ที่ http://localhost:8001/docs")
    uvicorn.run(app, host="0.0.0.0", port=8001)
