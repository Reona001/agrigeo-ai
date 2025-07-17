from fastapi import FastAPI
from forecast import get_forecast_and_suggestions

app = FastAPI()

@app.get("/")
def health_check():
    return {"status": "ok"}

@app.get("/forecast")
def forecast(lat: float, lon: float):
    return get_forecast_and_suggestions(lat, lon)

