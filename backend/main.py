from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from ai.agent import run_agent
from ai.advanced_agent import enhance_analysis_with_ai
from io import BytesIO
from ai.analyzer import generate_chart_specs
from fastapi.responses import StreamingResponse, JSONResponse
import matplotlib.pyplot as plt
import io
import zipfile
import hashlib
import time
from typing import Dict, Any
import json
from functools import lru_cache

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory dataset cache (simple LRU with timestamp)
DATASETS: Dict[str, dict] = {}
MAX_DATASETS = 20  # Increased for better performance
ANALYSIS_CACHE: Dict[str, dict] = {}  # Cache for analysis results
MAX_CACHE_SIZE = 50

def _put_dataset(dataset_id: str, df: pd.DataFrame):
    """Store dataset with LRU eviction"""
    if len(DATASETS) >= MAX_DATASETS:
        oldest = sorted(DATASETS.items(), key=lambda kv: kv[1]["ts"])[0][0]
        DATASETS.pop(oldest, None)
    DATASETS[dataset_id] = {"df": df, "ts": time.time(), "size": df.memory_usage(deep=True).sum()}

def _get_dataset(dataset_id: str) -> pd.DataFrame | None:
    """Retrieve dataset and update timestamp"""
    rec = DATASETS.get(dataset_id)
    if not rec:
        return None
    rec["ts"] = time.time()
    return rec["df"]

def _cache_key(dataset_id: str, prompt: str | None) -> str:
    """Generate cache key for analysis result"""
    prompt_clean = (prompt or "").strip().lower()
    return f"{dataset_id}:{hashlib.md5(prompt_clean.encode()).hexdigest()}"

def _get_cached_analysis(key: str) -> dict | None:
    """Retrieve cached analysis result"""
    return ANALYSIS_CACHE.get(key)

def _put_cached_analysis(key: str, result: dict):
    """Store analysis result in cache with LRU eviction"""
    if len(ANALYSIS_CACHE) >= MAX_CACHE_SIZE:
        # Simple FIFO eviction for simplicity
        oldest_key = next(iter(ANALYSIS_CACHE))
        ANALYSIS_CACHE.pop(oldest_key, None)
    ANALYSIS_CACHE[key] = result

@app.get("/")
def home():
    return {
        "message": "AutoSense Analytics Backend v3",
        "tagline": "Enterprise AI-Powered Data Visualization",
        "version": "3.0.0",
        "features": [
            "🤖 Multi-step AI reasoning with confidence scoring",
            "📊 Diverse chart generation (15+ types)",
            "💡 Smart business recommendations with ROI insights",
            "⚡ Performance optimized with intelligent caching",
            "🏢 Enterprise SaaS-ready architecture",
            "🔍 Data quality assessment & anomaly detection",
            "🎯 Correlation analysis and relationship mapping",
            "📈 Predictive insights and trend analysis"
        ],
        "status": "🟢 Ready for enterprise deployment",
        "endpoints": {
            "analyze": "POST /analyze - Main analysis endpoint",
            "data_quality": "POST /data-quality - Data assessment",
            "correlations": "POST /correlations - Relationship analysis",
            "recommendations": "POST /recommendations - Business recommendations"
        }
    }

def _analyze_dataset(df: pd.DataFrame, prompt: str | None) -> dict:
    """Core analysis logic with optimizations"""
    # Quick validation
    if df.shape[0] == 0 or df.shape[1] == 0:
        return {"error": "Empty dataset"}
    
    # Run agent for NLP understanding
    summary_text = f"Dataset: {df.shape}. Analysis: {prompt or 'general'}"
    agent_response = run_agent(summary_text)
    
    # Generate comprehensive analysis
    analysis = generate_chart_specs(df, prompt)
    
    return {
        "metrics": analysis["metrics"],
        "summary": analysis["summary"],
        "charts": analysis["charts"],
        "agent_response": agent_response,
        "suggestions": analysis.get("suggestions", []),
    }

@app.post("/analyze")
async def analyze(file: UploadFile = File(...), prompt: str | None = Form(None)):
    """Upload file and analyze with optional prompt - cached for performance"""
    content = await file.read()
    name = (file.filename or "").lower()
    df = None
    try:
        if name.endswith(".xls") or name.endswith(".xlsx"):
            df = pd.read_excel(BytesIO(content))
        else:
            df = pd.read_csv(BytesIO(content))
    except Exception:
        try:
            df = pd.read_csv(BytesIO(content), encoding="latin-1")
        except Exception as e:
            return {"error": f"Failed to parse file: {str(e)}"}

    # Generate dataset ID for caching
    dataset_id = hashlib.sha256(content).hexdigest()
    
    # Check cache for analysis
    cache_key = _cache_key(dataset_id, prompt)
    cached = _get_cached_analysis(cache_key)
    if cached:
        return {**cached, "dataset_id": dataset_id, "cached": True}
    
    # Perform analysis
    result = _analyze_dataset(df, prompt)
    if "error" in result:
        return result
    
    # Store dataset and cache result
    _put_dataset(dataset_id, df)
    _put_cached_analysis(cache_key, result)

    return {**result, "dataset_id": dataset_id, "cached": False}

@app.post("/analyze/prompt")
async def analyze_prompt(dataset_id: str = Form(...), prompt: str | None = Form(None)):
    """Re-analyze existing dataset with new prompt - cached for performance"""
    df = _get_dataset(dataset_id)
    if df is None:
        return JSONResponse({"error": "Unknown dataset_id. Please re-upload the file."}, status_code=400)
    
    # Check cache first
    cache_key = _cache_key(dataset_id, prompt)
    cached = _get_cached_analysis(cache_key)
    if cached:
        return {**cached, "dataset_id": dataset_id, "cached": True}
    
    # Perform analysis
    result = _analyze_dataset(df, prompt)
    _put_cached_analysis(cache_key, result)
    
    return {**result, "dataset_id": dataset_id, "cached": False}


@app.post("/data-quality")
async def analyze_data_quality(file: UploadFile = File(...)):
    """Comprehensive data quality assessment with detailed insights"""
    try:
        from datetime import datetime
        content = await file.read()
        name = (file.filename or "").lower()
        
        if name.endswith((".xls", ".xlsx")):
            df = pd.read_excel(BytesIO(content))
        else:
            df = pd.read_csv(BytesIO(content), encoding="utf-8")
        
        ai_analysis = enhance_analysis_with_ai(df)
        return {
            "status": "success",
            "file_name": file.filename,
            "quality_assessment": ai_analysis["data_quality"],
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"error": f"Data quality analysis failed: {str(e)}"}
        )


@app.post("/correlations")
async def analyze_correlations(file: UploadFile = File(...)):
    """Detect statistically significant correlations between variables"""
    try:
        from datetime import datetime
        content = await file.read()
        name = (file.filename or "").lower()
        
        if name.endswith((".xls", ".xlsx")):
            df = pd.read_excel(BytesIO(content))
        else:
            df = pd.read_csv(BytesIO(content), encoding="utf-8")
        
        ai_analysis = enhance_analysis_with_ai(df)
        return {
            "status": "success",
            "file_name": file.filename,
            "correlations": ai_analysis["correlations"],
            "correlation_count": len(ai_analysis["correlations"]),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"error": f"Correlation analysis failed: {str(e)}"}
        )


@app.post("/recommendations")
async def generate_recommendations(file: UploadFile = File(...), prompt: str | None = Form(None)):
    """Generate business-focused recommendations based on data"""
    try:
        from datetime import datetime
        content = await file.read()
        name = (file.filename or "").lower()
        
        if name.endswith((".xls", ".xlsx")):
            df = pd.read_excel(BytesIO(content))
        else:
            df = pd.read_csv(BytesIO(content), encoding="utf-8")
        
        ai_analysis = enhance_analysis_with_ai(df, prompt)
        
        return {
            "status": "success",
            "file_name": file.filename,
            "recommendations": ai_analysis["business_recommendations"],
            "query_refinement": ai_analysis["query_refinement"],
            "confidence_score": ai_analysis["analysis_confidence"],
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"error": f"Recommendation generation failed: {str(e)}"}
        )


@app.post("/query-refinement")
async def refine_query(file: UploadFile = File(...), query: str = Form(...)):
    """Intelligently refine and clarify user query based on data schema"""
    try:
        from datetime import datetime
        content = await file.read()
        name = (file.filename or "").lower()
        
        if name.endswith((".xls", ".xlsx")):
            df = pd.read_excel(BytesIO(content))
        else:
            df = pd.read_csv(BytesIO(content), encoding="utf-8")
        
        ai_analysis = enhance_analysis_with_ai(df, query)
        
        return {
            "status": "success",
            "original_query": query,
            "refinement": ai_analysis["query_refinement"],
            "interpretations": ai_analysis["query_refinement"].get("suggested_interpretations", []),
            "confidence": ai_analysis["analysis_confidence"],
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return JSONResponse(
            status_code=400,
            content={"error": f"Query refinement failed: {str(e)}"}
        )


def _render_matplotlib(option):
    fig, ax = plt.subplots(figsize=(6, 4), dpi=150)
    t = option.get("series", [])
    x = option.get("xAxis", {}).get("data")
    if t and isinstance(t, list):
        s = t[0]
        if s.get("type") == "line" and x:
            ax.plot(x, s.get("data", []), label="Series")
        elif s.get("type") == "bar" and x:
            ax.bar(x, s.get("data", []), label="Series")
        elif s.get("type") == "pie":
            data = s.get("data", [])
            ax.pie([d.get("value", 0) for d in data], labels=[d.get("name", "") for d in data])
    ax.legend(loc="best")
    ax.set_title(option.get("title", "Chart"))
    buf = io.BytesIO()
    fig.tight_layout()
    fig.savefig(buf, format="png")
    plt.close(fig)
    buf.seek(0)
    return buf

@app.post("/export/jpg")
async def export_jpg(charts: list[dict]):
    # export first chart as JPG
    if not charts:
        return JSONResponse({"error": "No charts provided"}, status_code=400)
    option = charts[0].get("option", charts[0])
    buf = _render_matplotlib(option)
    im = buf.getvalue()
    return StreamingResponse(io.BytesIO(im), media_type="image/jpeg")

@app.post("/export/pdf")
async def export_pdf(charts: list[dict]):
    # simple PDF with embedded PNGs for each chart
    mem = io.BytesIO()
    z = zipfile.ZipFile(mem, mode="w", compression=zipfile.ZIP_DEFLATED)
    for idx, chart in enumerate(charts):
        option = chart.get("option", chart)
        buf = _render_matplotlib(option)
        z.writestr(f"chart_{idx+1}.png", buf.getvalue())
    z.close()
    mem.seek(0)
    return StreamingResponse(mem, media_type="application/zip")

@app.post("/export/csv-bundle")
async def export_csv_bundle(charts: list[dict]):
    # Export underlying series data as CSVs suitable for BI tools
    mem = io.BytesIO()
    z = zipfile.ZipFile(mem, mode="w", compression=zipfile.ZIP_DEFLATED)
    for idx, chart in enumerate(charts):
        option = chart.get("option", chart)
        # Try to extract data
        series = option.get("series", [])
        x = option.get("xAxis", {}).get("data", [])
        if series and series[0].get("type") in ("line","bar") and x:
            y = series[0].get("data", [])
            csv = "label,value\n" + "\n".join(f"{str(x[i])},{str(y[i])}" for i in range(min(len(x), len(y))))
            z.writestr(f"chart_{idx+1}.csv", csv)
        elif series and series[0].get("type") == "pie":
            data = series[0].get("data", [])
            csv = "label,value\n" + "\n".join(f"{d.get('name','')},{d.get('value',0)}" for d in data)
            z.writestr(f"chart_{idx+1}.csv", csv)
    z.close()
    mem.seek(0)
    return StreamingResponse(mem, media_type="application/zip")
