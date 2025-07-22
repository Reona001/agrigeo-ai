from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.forecast import get_forecast_and_suggestions

app = FastAPI()

# ✅ Add CORS support before defining routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Use specific domains in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok"}

@app.get("/forecast")
def forecast(lat: float, lon: float):
    return get_forecast_and_suggestions(lat, lon)
