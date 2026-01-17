import uvicorn
from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware
from api.v1.routes import health, sec, target, webhook, osint

app = FastAPI(title="Revel8 Server")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(sec.router, prefix="/api/v1", tags=["sec"])
app.include_router(target.router, prefix="/api/v1", tags=["target"])
app.include_router(webhook.router, prefix="/api/v1", tags=["webhook"])
app.include_router(osint.router, prefix="/api/v1", tags=["osint"])


def main():
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
