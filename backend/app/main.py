from fastapi import FastAPI
from app.forecast import get_forecast_and_suggestions
# from app.crop_rules import CROP_RULES

app = FastAPI()

@app.get("/")
def health_check():
    return {"status": "ok"}

@app.get("/forecast")
def forecast(lat: float, lon: float):
    return get_forecast_and_suggestions(lat, lon)
