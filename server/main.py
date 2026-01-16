import uvicorn
from fastapi import FastAPI

from api.v1.routes import health

app = FastAPI(title="Revel8 Server")

# Register routes
app.include_router(health.router, prefix="/api/v1", tags=["health"])


def main():
    uvicorn.run(app, host="0.0.0.0", port=8000)


if __name__ == "__main__":
    main()
