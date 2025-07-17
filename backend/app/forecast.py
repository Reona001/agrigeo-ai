import requests
from app.crop_rules import CROP_RULES


def get_forecast_and_suggestions(lat: float, lon: float):
    url = (
        f"https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&longitude={lon}&daily=temperature_2m_max,"
        f"temperature_2m_min&timezone=Asia/Tokyo"
    )
    res = requests.get(url)
    data = res.json()

    temps = data["daily"]["temperature_2m_max"]
    matching_crops = []

    for crop, rules in CROP_RULES.items():
        if all(rules["temp_min"] <= t <= rules["temp_max"] for t in temps):
            matching_crops.append(crop)

    return {
        "location": {"lat": lat, "lon": lon},
        "forecast": temps,
        "recommended": matching_crops
    }
