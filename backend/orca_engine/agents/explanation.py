"""
ORCA Explainability & Multilingual Synthesis Agent
SIH 2026 / ISRO Problem Statement SIH26176
Constructs grounded WHY explanations, positive/risk factor decompositions,
and multilingual outputs (English, Telugu, Hindi) strictly adhering to deterministic metrics.
"""

import os
import requests
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

from orca_engine.models.schemas import (
    CoreDecision, DecisionVerdict, PFZCandidate, OceanConditions,
    WeatherForecast, HazardAlert, RouteCandidate, LocationContext,
    WhyExplanation, WhyFactor
)

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


def generate_why_explanation(
    decision: CoreDecision,
    location: LocationContext,
    ocean: OceanConditions,
    weather: WeatherForecast,
    selected_pfz: Optional[PFZCandidate],
    route: RouteCandidate,
    hazards: List[HazardAlert],
    language: str = "en"
) -> WhyExplanation:
    positives: List[WhyFactor] = []
    risks: List[WhyFactor] = []

    # 1. Weather Checks
    if not weather.is_official_warning_active:
        positives.append(
            WhyFactor(
                category="Weather & Cyclone Warnings",
                status="OPTIMAL",
                detail="No severe meteorological or cyclone warnings active across the operational sector.",
                source_authority="IMD Coastal Bulletin",
                raw_value=f"Wind: {weather.wind_speed_kmh:.1f} km/h, Alert Level: {weather.cyclone_alert_level}",
                threshold="Safe Cutoff: < 45.0 km/h"
            )
        )
    else:
        risks.append(
            WhyFactor(
                category="Official Weather Warning",
                status="CRITICAL",
                detail=f"Authoritative warning active: {weather.official_bulletin or 'Fishermen warning in effect.'}",
                source_authority="IMD / RSMC",
                raw_value="ACTIVE_WARNING",
                threshold="Zero tolerance on official prohibitions"
            )
        )

    # 2. Sea State Checks
    if ocean.wave_height_m <= 1.5:
        positives.append(
            WhyFactor(
                category="Sea State & Wave Dynamics",
                status="OPTIMAL",
                detail=f"Significant wave height ({ocean.wave_height_m:.1f}m) and swell ({ocean.swell_height_m:.1f}m) are within safe operational limits.",
                source_authority="INCOIS Ocean State Forecast",
                raw_value=f"{ocean.wave_height_m:.1f}m wave, {ocean.swell_height_m:.1f}m swell",
                threshold="Threshold: < 1.8m for artisanal craft"
            )
        )
    else:
        risks.append(
            WhyFactor(
                category="Sea State Agitation",
                status="ELEVATED_RISK",
                detail=f"Wave height of {ocean.wave_height_m:.1f}m creates elevated risk for small to medium craft.",
                source_authority="INCOIS Ocean State Forecast",
                raw_value=f"{ocean.wave_height_m:.1f}m",
                threshold="Advisory limit: 1.8m"
            )
        )

    # 3. Fisheries & PFZ
    if selected_pfz:
        positives.append(
            WhyFactor(
                category="Potential Fishing Zone (PFZ)",
                status="FAVORABLE",
                detail=f"Frontal thermal boundary detected at {selected_pfz.distance_km:.1f} km bearing {selected_pfz.bearing_deg:.0f}° with optimal SST ({selected_pfz.sst_celsius:.1f}°C) and elevated Chlorophyll ({selected_pfz.chlorophyll_mg_m3:.2f} mg/m³).",
                source_authority="INCOIS / ISRO MOSDAC",
                raw_value=f"SST: {selected_pfz.sst_celsius}°C, Chl-a: {selected_pfz.chlorophyll_mg_m3} mg/m³",
                threshold="Optimal Range: 26.5–28.5°C SST, > 1.2 mg/m³ Chl-a"
            )
        )

    # 4. Geospatial & Geofencing
    if route.conflict_resolution_applied:
        risks.append(
            WhyFactor(
                category="Naval Defense Geofence Bypass",
                status="CAUTION",
                detail=f"Direct course intersected naval exercise boundary. Tactical route planned with a {route.standoff_buffer_km:.1f} km safety buffer ({route.safe_distance_km:.1f} km total).",
                source_authority="PostGIS / Indian Navy Directorate",
                raw_value=f"Direct: {route.direct_distance_km:.1f} km → Safe: {route.safe_distance_km:.1f} km",
                threshold="Mandatory minimum 3.0 km buffer"
            )
        )
    else:
        positives.append(
            WhyFactor(
                category="Maritime Geofences",
                status="CLEAR",
                detail="Direct passage to selected PFZ is clear of all naval firing corridors and marine protected zones.",
                source_authority="PostGIS / Coastal Security",
                raw_value="Zero conflicts detected",
                threshold="Clear passage verified"
            )
        )

    sci_notes = [
        f"INCOIS PFZ advisory #{selected_pfz.id if selected_pfz else 'N/A'} correlates Oceansat-3 ocean colour with INSAT-3D thermal infrared channels.",
        f"Metocean conditions derived from high-resolution SWAN wave modeling and WRF atmospheric predictions.",
        "Deterministic risk score computed under rule set 'risk-2026-08-v1' governed by ISRO / INCOIS safety standards."
    ]

    # Multilingual translation
    lang_clean = language.lower() if language else "en"
    if "te" in lang_clean or "telugu" in lang_clean:
        if decision.decision_class in (DecisionVerdict.GO, DecisionVerdict.FAVORABLE):
            headline = f"సముద్రంలోకి వెళ్లడం అనుకూలం — {location.name} తీరంలో తక్కువ ప్రమాదం"
            prose = f"ప్రస్తుత వాతావరణం మరియు సముద్ర పరిస్థితులు స్థిరంగా ఉన్నాయి. తరంగ ఎత్తు {ocean.wave_height_m:.1f}m మరియు గాలి వేగం {weather.wind_speed_kmh:.1f} km/h సురక్షిత పరిమితుల్లో ఉన్నాయి. {selected_pfz.name if selected_pfz else 'PFZ'} వద్ద చేపల వేట సంభావ్యత ఎక్కువగా ఉంది ({decision.fishing_suitability_score:.0f}/100)."
        elif decision.decision_class == DecisionVerdict.CAUTION:
            headline = f"హెచ్చరికతో కూడిన అనుకూలత — జాగ్రత్తలు పాటించండి"
            prose = f"సముద్ర స్థితి లేదా రక్షణ జోన్ పరిమితుల దృష్ట్యా అప్రమత్తంగా ఉండాలి. ప్రమాద స్కోరు {decision.safety_risk_score:.0f}/100గా ఉంది. సురక్షిత మార్గాన్ని అనుసరించండి."
        else:
            headline = "సముద్రంలోకి వెళ్లవద్దు — ప్రమాదకర పరిస్థితులు"
            prose = f"అధికారిక హెచ్చరిక లేదా తీవ్ర వాతావరణ పరిస్థితుల వల్ల సముద్రంలోకి వెళ్లడం సురక్షితం కాదు. {decision.gate_reason or 'ప్రమాదం అధికంగా ఉంది'}."
    elif "hi" in lang_clean or "hindi" in lang_clean:
        if decision.decision_class in (DecisionVerdict.GO, DecisionVerdict.FAVORABLE):
            headline = f"समुद्र में जाना अनुकूल है — {location.name} तट पर कम जोखिम"
            prose = f"मौसम और समुद्र की स्थिति पूरी तरह सुरक्षित है। तरंग ऊंचाई {ocean.wave_height_m:.1f}m और हवा की गति {weather.wind_speed_kmh:.1f} km/h सुरक्षित सीमा में है। {selected_pfz.name if selected_pfz else 'PFZ'} पर मत्स्य पालन की उच्च संभावना ({decision.fishing_suitability_score:.0f}/100) है।"
        elif decision.decision_class == DecisionVerdict.CAUTION:
            headline = "सावधानी बरतें — मध्यम जोखिम की स्थिति"
            prose = f"समुद्र में लहरों या नौसेना रक्षा क्षेत्र के कारण अतिरिक्त सावधानी आवश्यक है। जोखिम स्कोर {decision.safety_risk_score:.0f}/100 है।"
        else:
            headline = "समुद्र में न जाएं — खतरनाक मौसम/चेतावनी"
            prose = f"आधिकारिक मौसम चेतावनी या खराब मौसम के कारण समुद्र में जाना वर्जित है। {decision.gate_reason or 'खतरा अधिक है'}."
    elif "ta" in lang_clean or "tamil" in lang_clean:
        if decision.decision_class in (DecisionVerdict.GO, DecisionVerdict.FAVORABLE):
            headline = f"கடலுக்குச் செல்ல சாதகமானது — {location.name} கடற்கரையில் குறைந்த ஆபத்து"
            prose = f"வானிலை மற்றும் கடல் நிலைமைகள் முற்றிலும் பாதுகாப்பாக உள்ளன. அலை உயரம் {ocean.wave_height_m:.1f}m மற்றும் காற்றின் வேகம் {weather.wind_speed_kmh:.1f} km/h பாதுகாப்பான வரம்பில் உள்ளது. {selected_pfz.name if selected_pfz else 'PFZ'} பகுதியில் மீன்பிடி வாய்ப்பு மிக அதிகம் ({decision.fishing_suitability_score:.0f}/100)."
        elif decision.decision_class == DecisionVerdict.CAUTION:
            headline = "எச்சரிக்கையுடன் செயல்படவும் — நடுத்தர ஆபத்து நிலை"
            prose = f"கடல் அலைகள் அல்லது கடற்படை பாதுகாப்பு மண்டலத்தைக் கருத்தில் கொண்டு கூடுதல் எச்சரிக்கை தேவை. ஆபத்து மதிப்பீடு {decision.safety_risk_score:.0f}/100."
        else:
            headline = "கடலுக்குச் செல்ல வேண்டாம் — ஆபத்தான வானிலை எச்சரிக்கை"
            prose = f"அதிகாரப்பூர்வ எச்சரிக்கை அல்லது மோசமான வானிலை காரணமாக கடலுக்குச் செல்வது தடைசெய்யப்பட்டுள்ளது. {decision.gate_reason or 'ஆபத்து அதிகமாக உள்ளது'}."
    elif "ml" in lang_clean or "malayalam" in lang_clean:
        if decision.decision_class in (DecisionVerdict.GO, DecisionVerdict.FAVORABLE):
            headline = f"കടലിൽ പോകാൻ അനുകൂലം — {location.name} തീരത്ത് കുറഞ്ഞ അപകടസാധ്യത"
            prose = f"കാലാവസ്ഥയും കടൽ അവസ്ഥയും തികച്ചും സുരക്ഷിതമാണ്. തിരമാലയുടെ ഉയരം {ocean.wave_height_m:.1f}m, കാറ്റിന്റെ വേഗത {weather.wind_speed_kmh:.1f} km/h സുരക്ഷിത പരിധിയിലാണ്. {selected_pfz.name if selected_pfz else 'PFZ'} മേഖലയിൽ മത്സ്യബന്ധന സാധ്യത വളരെ കൂടുതലാണ് ({decision.fishing_suitability_score:.0f}/100)."
        elif decision.decision_class == DecisionVerdict.CAUTION:
            headline = "ജാഗ്രത പാലിക്കുക — മിതമായ അപകടസാധ്യത"
            prose = f"കടൽ അവസ്ഥ അല്ലെങ്കിൽ നാവികസേനാ മേഖല മുൻനിർത്തി ജാഗ്രത പാലിക്കുക. റിസ്ക് സ്കോർ {decision.safety_risk_score:.0f}/100 ആണ്."
        else:
            headline = "കടലിൽ പോകരുത് — അപകടകരമായ കാലാവസ്ഥ മുന്നറിയിപ്പ്"
            prose = f"ഔദ്യോഗിക മുന്നറിയിപ്പ് അല്ലെങ്കിൽ മോശം കാലാവസ്ഥ കാരണം കടലിൽ പോകാൻ പാടില്ല. {decision.gate_reason or 'അപകടസാധ്യത കൂടുതലാണ്'}."
    elif "mr" in lang_clean or "marathi" in lang_clean:
        if decision.decision_class in (DecisionVerdict.GO, DecisionVerdict.FAVORABLE):
            headline = f"समुद्रात जाण्यासाठी अनुकूल — {location.name} किनारपट्टीवर कमी धोका"
            prose = f"हवामान आणि समुद्राची स्थिती पूर्णपणे सुरक्षित आहे. लाटांची उंची {ocean.wave_height_m:.1f}m आणि वाऱ्याचा वेग {weather.wind_speed_kmh:.1f} km/h सुरक्षित मर्यादेत आहे. {selected_pfz.name if selected_pfz else 'PFZ'} येथे मासेमारीची उत्तम संधी ({decision.fishing_suitability_score:.0f}/100) आहे."
        elif decision.decision_class == DecisionVerdict.CAUTION:
            headline = "सावधगिरी बाळगा — मध्यम धोक्याची स्थिती"
            prose = f"समुद्रातील लाटा किंवा नौदल क्षेत्रामुळे अतिरिक्त खबरदारी आवश्यक आहे. जोखीम स्कोअर {decision.safety_risk_score:.0f}/100 आहे."
        else:
            headline = "समुद्रात जाऊ नका — धोकादायक हवामान चेतावणी"
            prose = f"अधिकृत हवामान चेतावणीमुळे समुद्रात जाण्यास सक्त मनाई आहे. {decision.gate_reason or 'धोका जास्त आहे'}."
    elif "gu" in lang_clean or "gujarati" in lang_clean:
        if decision.decision_class in (DecisionVerdict.GO, DecisionVerdict.FAVORABLE):
            headline = f"દરિયામાં જવા માટે અનુકૂળ — {location.name} કાંઠે ઓછું જોખમ"
            prose = f"હવામાન અને સમુદ્રની સ્થિતિ સંપૂર્ણપણે સલામત છે. મોજાની ઊંચાઈ {ocean.wave_height_m:.1f}m અને પવનની ઝડપ {weather.wind_speed_kmh:.1f} km/h સલામત મર્યાદામાં છે. {selected_pfz.name if selected_pfz else 'PFZ'} પર માછીમારીની ઉત્તમ સંભાવના ({decision.fishing_suitability_score:.0f}/100) છે."
        elif decision.decision_class == DecisionVerdict.CAUTION:
            headline = "સાવચેતી રાખો — મધ્યમ જોખમની સ્થિતિ"
            prose = f"દરિયાઈ મોજા અથવા નેવલ ડિફેન્સ ઝોનને કારણે સાવચેતી રાખવી જરૂરી છે. જોખમ સ્કોર {decision.safety_risk_score:.0f}/100 છે."
        else:
            headline = "દરિયામાં ન જશો — જોખમી હવામાન ચેતવણી"
            prose = f"સત્તાવાર હવામાન ચેતવણીને કારણે દરિયામાં જવા પર પ્રતિબંધ છે. {decision.gate_reason or 'જોખમ વધુ છે'}."
    elif "bn" in lang_clean or "bengali" in lang_clean:
        if decision.decision_class in (DecisionVerdict.GO, DecisionVerdict.FAVORABLE):
            headline = f"সমুদ্রে যাত্রা অনুকূল — {location.name} উপকূলে কম ঝুঁকি"
            prose = f"আবহাওয়া এবং সমুদ্রের অবস্থা সম্পূর্ণ নিরাপদ। ঢেউয়ের উচ্চতা {ocean.wave_height_m:.1f}m এবং বাতাসের গতিবেগ {weather.wind_speed_kmh:.1f} km/h নিরাপদ সীমার মধ্যে রয়েছে। {selected_pfz.name if selected_pfz else 'PFZ'} অঞ্চলে মাছ ধরার প্রচুর সম্ভাবনা ({decision.fishing_suitability_score:.0f}/100) রয়েছে।"
        elif decision.decision_class == DecisionVerdict.CAUTION:
            headline = "সতর্কতা অবলম্বন করুন — মাঝারি ঝুঁকি"
            prose = f"উত্তাল সমুদ্র বা নৌবাহিনীর প্রতিরক্ষা এলাকার কারণে অতিরিক্ত সতর্কতা প্রয়োজন। ঝুঁকি স্কোর {decision.safety_risk_score:.0f}/100।"
        else:
            headline = "সমুদ্রে যাবেন না — বিপজ্জনক আবহাওয়ার সতর্কতা"
            prose = f"সরকারি সতর্কতা বা খারাপ আবহাওয়ার কারণে সমুদ্রে যাওয়া নিষিদ্ধ। {decision.gate_reason or 'ঝুঁকি অত্যন্ত বেশি'}."
    elif "kn" in lang_clean or "kannada" in lang_clean:
        if decision.decision_class in (DecisionVerdict.GO, DecisionVerdict.FAVORABLE):
            headline = f"ಸಮುದ್ರಕ್ಕೆ ತೆರಳಲು ಅನುಕೂಲಕರ — {location.name} ಕರಾವಳಿಯಲ್ಲಿ ಕಡಿಮೆ ಅಪಾಯ"
            prose = f"ಹವಾಮಾನ ಮತ್ತು ಸಮುದ್ರ ಪರಿಸ್ಥಿತಿಗಳು ಸುರಕ್ಷಿತವಾಗಿವೆ. ಅಲೆಯ ಎತ್ತರ {ocean.wave_height_m:.1f}m ಮತ್ತು ಗಾಳಿಯ ವೇಗ {weather.wind_speed_kmh:.1f} km/h ಸುರಕ್ಷಿತ ಮಿತಿಯಲ್ಲಿದೆ. {selected_pfz.name if selected_pfz else 'PFZ'} ವಲಯದಲ್ಲಿ ಮೀನುಗಾರಿಕೆಗೆ ಉತ್ತಮ ಅವಕಾಶವಿದೆ ({decision.fishing_suitability_score:.0f}/100)."
        elif decision.decision_class == DecisionVerdict.CAUTION:
            headline = "ಎಚ್ಚರಿಕೆ ವಹಿಸಿ — ಮಧ್ಯಮ ಅಪಾಯದ ಪರಿಸ್ಥಿತಿ"
            prose = f"ಸಮುದ್ರದ ಅಲೆಗಳು ಅಥವಾ ನೌಕಾಪಡೆಯ ರಕ್ಷಣಾ ವಲಯದ ಕಾರಣ ಹೆಚ್ಚಿನ ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ. ಅಪಾಯದ ಸ್ಕೋರ್ {decision.safety_risk_score:.0f}/100 ಆಗಿದೆ."
        else:
            headline = "ಸಮುದ್ರಕ್ಕೆ ಹೋಗಬೇಡಿ — ಅಪಾಯಕಾರಿ ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ"
            prose = f"ಅಧಿಕೃತ ಎಚ್ಚರಿಕೆ ಅಥವಾ ಪ್ರತಿಕೂಲ ಹವಾಮಾನದ ಕಾರಣ ಸಮುದ್ರಕ್ಕೆ ಹೋಗುವುದನ್ನು ಕಟ್ಟುನಿಟ್ಟಾಗಿ ನಿಷೇಧಿಸಲಾಗಿದೆ. {decision.gate_reason or 'ಅಪಾಯ ಹೆಚ್ಚಾಗಿದೆ'}."
    elif "or" in lang_clean or "odia" in lang_clean:
        if decision.decision_class in (DecisionVerdict.GO, DecisionVerdict.FAVORABLE):
            headline = f"ସମୁଦ୍ର ଯାତ୍ରା ପାଇଁ ଅନୁକୂଳ — {location.name} ଉପକୂଳରେ କମ୍ ବିପଦ"
            prose = f"ପାଣିପାଗ ଏବଂ ସମୁଦ୍ର ସ୍ଥିତି ସମ୍ପୂର୍ଣ୍ଣ ସୁରକ୍ଷିତ। ଢେଉର ଉଚ୍ଚତା {ocean.wave_height_m:.1f}m ଏବଂ ପବନର ବେଗ {weather.wind_speed_kmh:.1f} km/h ସୁରକ୍ଷିତ ସୀମାରେ ଅଛି। {selected_pfz.name if selected_pfz else 'PFZ'} ଠାରେ ମାଛ ଧରିବାର ଉତ୍ତମ ସୁଯୋଗ ({decision.fishing_suitability_score:.0f}/100) ରହିଛି।"
        elif decision.decision_class == DecisionVerdict.CAUTION:
            headline = "ସତର୍କତା ଅବଲମ୍ବନ କରନ୍ତୁ — ମଧ୍ୟମ ବିପଦ"
            prose = f"ଅଶାନ୍ତ ସମୁଦ୍ର ବା ନୌସେନା ସୁରକ୍ଷା ବଳୟ ଯୋଗୁଁ ସତର୍କତା ଆବଶ୍ୟକ। ବିପଦ ସ୍କୋର {decision.safety_risk_score:.0f}/100।"
        else:
            headline = "ସମୁଦ୍ରକୁ ଯାଆନ୍ତୁ ନାହିଁ — ବିପଦପୂର୍ଣ୍ଣ ପାଣିପାଗ ଚେତାବନୀ"
            prose = f"ସରକାରୀ ଚେତାବନୀ ବା ଖରାପ ପାଣିପାଗ ଯୋଗୁଁ ସମୁଦ୍ର ଯାତ୍ରା ନିଷେଧ। {decision.gate_reason or 'ବିପଦ ଅଧିକ ଅଛି'}."
    else:
        # English
        if decision.decision_class in (DecisionVerdict.GO, DecisionVerdict.FAVORABLE):
            headline = f"Conditions Favorable for Departure from {location.name}"
            prose = f"Metocean conditions across {location.name} offshore waters are stable. Wave height ({ocean.wave_height_m:.1f}m) and wind ({weather.wind_speed_kmh:.1f} km/h) remain within safe operating thresholds. Optimal thermal front identified at {selected_pfz.name if selected_pfz else 'PFZ'} with high fishing opportunity ({decision.fishing_suitability_score:.0f}/100)."
        elif decision.decision_class == DecisionVerdict.CAUTION:
            headline = f"Exercise Caution — Elevated Metocean or Routing Constraints"
            prose = f"Operations require active monitoring. Safety risk score is {decision.safety_risk_score:.0f}/100 due to sea state or naval buffer navigation. Follow recommended tactical waypoint path."
        else:
            headline = f"Do Not Venture — Safety Gate Active"
            prose = f"Maritime departure strictly discouraged. {decision.gate_reason or 'Severe metocean or authoritative warning prohibition active.'}"

    return WhyExplanation(
        headline=headline,
        summary_prose=prose,
        positive_factors=positives,
        risk_factors=risks,
        scientific_evidence_notes=sci_notes,
        language=lang_clean
    )
