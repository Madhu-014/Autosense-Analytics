# agent.py

from ai.embeddings import embed_text, EMBEDDING_INFO
from typing import Dict, Any, List, Optional
import re

try:
    from backend.config import MODEL_ID  # when run as module
except Exception:
    try:
        from config import MODEL_ID  # direct script execution
    except Exception:
        MODEL_ID = "gpt-5.1-codex-max"

# Query intent classification patterns - More comprehensive
INTENT_PATTERNS = {
    "comparison": [
        r"\bvs\b", r"versus", r"against", r"compare\s+(?:with|to)",
        r"(?:compared\s+)?to\s+", r"relationship\s+(?:between|of)",
        r"how\s+does.*compare", r"difference\s+between", r"contrast",
        r"head\s+to\s+head", r"side\s+by\s+side", r"competing"
    ],
    "top_bottom": [
        r"top\s+(\d+)", r"bottom\s+(\d+)", r"highest\s+(\d+)?",
        r"lowest\s+(\d+)?", r"best\s+(\d+)?", r"worst\s+(\d+)?",
        r"rank(?:ing)?", r"sorted\s+by", r"order\s+by", r"greatest",
        r"least", r"most\s+\w+", r"leading\s+\d+", r"top\s+performing"
    ],
    "timeseries": [
        r"over\s+time", r"by\s+(?:month|quarter|year|day|week|date)",
        r"time\s+series", r"trend(?:s)?", r"historical", r"progress",
        r"growth", r"change\s+over", r"monthly", r"seasonal", r"forecast",
        r"daily", r"weekly", r"yearly", r"evolution", r"progression",
        r"when\s+did", r"how\s+has", r"throughput"
    ],
    "distribution": [
        r"distribution", r"histogram", r"spread", r"range", r"density",
        r"frequency", r"breakdown", r"scatter", r"concentration",
        r"how\s+is.*distributed", r"spread.*across", r"variance"
    ],
    "correlation": [
        r"correl(?:ate|ation)?", r"relationship", r"associated",
        r"impact\s+(?:on|of)", r"effect\s+(?:on|of)", r"influence",
        r"heatmap.*correl", r"matrix", r"dependent", r"connection",
        r"link.*between", r"affecting\s+", r"driven\s+by"
    ],
    "single_chart": [
        r"(?<!dashboard\s)show\s+", r"display\s+", r"create\s+(?:a\s+)?(?:one\s+)?chart",
        r"single\s+chart", r"one\s+chart", r"just\s+", r"simple\s+chart",
        r"quick\s+(?:look|view|chart)", r"single\s+visualization"
    ],
    "dashboard": [
        r"dashboard", r"overview", r"(?:multiple|several|various)\s+charts",
        r"comprehensive\s+view", r"full\s+analysis", r"all\s+charts",
        r"holistic", r"complete\s+picture", r"executive\s+(?:summary|view)"
    ],
    "heatmap": [
        r"heatmap", r"heat\s+map", r"pivot\s+(?:table)?",
        r"cross\s+tabulation", r"pivot.*heatmap"
    ],
    "anomaly": [
        r"anomal", r"outlier", r"unusual", r"unexpected", r"suspicious",
        r"deviation", r"abnormal", r"flag", r"alert"
    ],
    "pareto": [
        r"pareto", r"80/20", r"concentration", r"contribution", r"cumulative",
        r"leading\s+factor", r"main\s+driver"
    ],
    "segment": [
        r"segment(?:ation)?", r"cohort", r"group\s+by", r"slice",
        r"breakdown\s+by", r"split\s+(?:by|across)"
    ],
    "business_kpi": [
        r"kpi", r"metric", r"performance", r"key\s+indicator",
        r"business\s+metric", r"measure", r"track(?:ing)?",
        r"monitor", r"objective", r"target", r"goal"
    ],
    "financial": [
        r"revenue", r"profit", r"cost", r"margin", r"roi", r"return",
        r"budget", r"expense", r"income", r"earnings", r"cash\s+flow",
        r"p&l", r"profit\s+and\s+loss", r"financial"
    ],
    "funnel": [
        r"funnel", r"conversion", r"pipeline", r"stage", r"journey",
        r"drop\s+off", r"retention", r"churn", r"attrition"
    ],
    "forecast": [
        r"forecast", r"predict", r"projection", r"estimate", r"future",
        r"what\s+if", r"scenario", r"model"
    ]
}

CHART_TYPE_PATTERNS = {
    "bar": [r"bar\s+chart", r"bar\s+graph", r"\bbar\b", r"bar\s+plot"],
    "line": [r"line\s+chart", r"line\s+graph", r"trend\s+line", r"line\s+plot"],
    "pie": [r"pie\s+chart", r"pie\s+graph"],
    "scatter": [r"scatter", r"scatter\s+plot", r"scatterplot"],
    "histogram": [r"histogram", r"distribution\s+chart"],
    "heatmap": [r"heatmap", r"heat\s+map"],
    "waterfall": [r"waterfall", r"flow\s+chart"],
    "gauge": [r"gauge", r"gauge\s+chart", r"speedometer"],
    "tree": [r"tree\s+map", r"treemap"],
    "sunburst": [r"sunburst"],
    "bubble": [r"bubble", r"bubble\s+chart"],
    "box": [r"box\s+plot", r"boxplot"],
    "violin": [r"violin"],
}

def detect_intent(query: str) -> Dict[str, Any]:
    """
    Analyze natural language query to extract visualization intent with advanced NLP.
    Detects multiple intents, measures, categories, and chart type preferences.
    
    Returns comprehensive intent dictionary with high confidence scoring.
    """
    query_lower = query.lower()
    result = {
        'intents': set(),
        'target_columns': [],
        'measure_field': None,
        'category_field': None,
        'chart_type': None,
        'is_single_chart': True,
        'is_comparison': False,
        'is_top_bottom': False,
        'top_n': 10,
        'comparison_fields': [],
        'confidence': 0.0,
        'multi_intent_score': 0.0,  # Score for multiple intent detection
    }
    
    # Detect intents with improved matching
    intent_scores = {}
    for intent_key, patterns in INTENT_PATTERNS.items():
        matches = 0
        for pattern in patterns:
            if re.search(pattern, query_lower, re.IGNORECASE):
                matches += 1
        if matches > 0:
            result['intents'].add(intent_key)
            intent_scores[intent_key] = matches
    
    # Calculate multi-intent score (bonus for complex queries)
    if len(result['intents']) > 1:
        result['multi_intent_score'] = min(1.0, len(result['intents']) * 0.15)
    
    # Determine single vs dashboard
    if 'dashboard' in result['intents']:
        result['is_single_chart'] = False
    elif 'single_chart' in result['intents']:
        result['is_single_chart'] = True
    else:
        # Default: single chart for specific queries
        result['is_single_chart'] = bool(
            'comparison' in result['intents'] or 
            'top_bottom' in result['intents'] or 
            'timeseries' in result['intents'] or
            'anomaly' in result['intents'] or
            'pareto' in result['intents']
        )
    
    # Extract chart type preference (more comprehensive)
    for chart_type, patterns in CHART_TYPE_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, query_lower, re.IGNORECASE):
                result['chart_type'] = chart_type
                break
        if result['chart_type']:
            break
    
    # Extract top_n value with better patterns
    top_match = re.search(r'top\s+(\d+)', query_lower)
    if top_match:
        result['is_top_bottom'] = True
        result['top_n'] = int(top_match.group(1))
    else:
        bottom_match = re.search(r'bottom\s+(\d+)', query_lower)
        if bottom_match:
            result['is_top_bottom'] = True
            result['top_n'] = int(bottom_match.group(1))
        else:
            highest_match = re.search(r'(?:highest|greatest|leading)\s+(\d+)', query_lower)
            if highest_match:
                result['is_top_bottom'] = True
                result['top_n'] = int(highest_match.group(1))
            else:
                # Default top_n inference from "show top" pattern
                if 'top_bottom' in result['intents']:
                    result['is_top_bottom'] = True
    
    # Detect comparison intent
    if any(re.search(pattern, query_lower) for pattern in INTENT_PATTERNS.get('comparison', [])):
        result['is_comparison'] = True
    
    # Enhanced measure field extraction
    measure_patterns = [
        r'based\s+on\s+(\w+(?:\s+\w+)*)',           # "based on budget"
        r'(?:top|bottom|by)\s+\d+\s+(?:\w+\s+)*by\s+(\w+(?:\s+\w+)*)',  # "top 10 by revenue"
        r'sorted\s+(?:by|on)\s+(\w+(?:\s+\w+)*)',   # "sorted by price"
        r'(?:highest|lowest|greatest|least)\s+(\w+(?:\s+\w+)*)',  # "highest budget"
        r'(?:most|least)\s+(\w+(?:\s+\w+)*)',       # "most expensive"
        r'by\s+(\w+(?:\s+\w+)*)',                    # "by sales"
        r'against\s+(\w+(?:\s+\w+)*)',              # "against revenue"
    ]
    
    for pattern in measure_patterns:
        match = re.search(pattern, query_lower, re.IGNORECASE)
        if match:
            result['measure_field'] = match.group(1).strip()
            break
    
    # Enhanced comparison field extraction (vs patterns)
    vs_patterns = [
        r'(\w+(?:\s+\w+)*?)\s+(?:vs|versus|v\.s\.?|against|v)\s+(\w+(?:\s+\w+)*)',
        r'(\w+(?:\s+\w+)*?)\s+compared\s+to\s+(\w+(?:\s+\w+)*)',
        r'(?:between|relationship\s+between)\s+(\w+(?:\s+\w+)*?)\s+and\s+(\w+(?:\s+\w+)*)',
        r'(\w+(?:\s+\w+)*?)\s+head\s+to\s+head\s+(\w+(?:\s+\w+)*)',
    ]
    
    for pattern in vs_patterns:
        matches = re.findall(pattern, query_lower, re.IGNORECASE)
        for match in matches:
            result['comparison_fields'].append((match[0].strip(), match[1].strip()))
    
    # Extract capitalized column names and quoted strings
    capitalized = re.findall(r'\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b', query)
    quoted = re.findall(r'"([^"]+)"|\'([^\']+)\'', query)
    quoted_flat = [q[0] or q[1] for q in quoted]
    
    stop_words = {
        'the', 'a', 'an', 'and', 'or', 'in', 'of', 'to', 'for', 'by', 'on', 'at',
        'show', 'display', 'create', 'chart', 'dashboard', 'vs', 'versus', 'against',
        'compare', 'between', 'top', 'bottom', 'over', 'time', 'series', 'analysis',
        'data', 'please', 'want', 'like', 'would', 'could', 'can', 'that', 'this',
        'is', 'are', 'be', 'get', 'make', 'take', 'based', 'using', 'about', 'from',
        'with', 'as', 'if', 'have', 'has', 'when', 'where', 'what', 'how', 'why',
        'which', 'who', 'visualiz', 'across', 'movie', 'movies', 'product', 'products',
        'sales', 'data', 'items', 'records', 'trend', 'trends', 'relationship', 'heatmap'
    }
    
    all_extracted = capitalized + quoted_flat
    result['target_columns'] = [
        col for col in all_extracted 
        if col.lower() not in stop_words and len(col) > 2
    ]
    
    # Business context detection
    business_keywords = {
        'revenue', 'profit', 'sales', 'cost', 'margin', 'roi', 'conversion',
        'growth', 'retention', 'churn', 'arpu', 'ltv', 'cac', 'mrr', 'arr',
        'forecast', 'target', 'goal', 'kpi', 'performance', 'efficiency'
    }
    has_business_context = any(kw in query_lower for kw in business_keywords)
    result['has_business_context'] = has_business_context
    
    # Enhanced confidence calculation
    intent_count = len(result['intents'])
    has_measure = 1.0 if result['measure_field'] else 0.0
    has_comparison = 1.0 if result['comparison_fields'] else 0.0
    is_top_bottom = 1.0 if result['is_top_bottom'] else 0.0
    has_chart_type = 0.15 if result['chart_type'] else 0.0
    business_boost = 0.1 if has_business_context else 0.0
    
    result['confidence'] = min(1.0, 
        (intent_count * 0.12) +
        (has_measure * 0.30) +
        (has_comparison * 0.15) +
        (is_top_bottom * 0.15) +
        (has_chart_type) +
        (result['multi_intent_score'] * 0.08) +
        business_boost
    )
    
    return result

def run_agent(text: str):
    """
    Process user query and detect visualization intent with high accuracy.
    Extracts measure field, category field, and comparison details.
    """
    embedding = embed_text(text)
    intent = detect_intent(text)
    
    return {
        "prompt": text,
        "embedding_length": len(embedding),
        "embedding_engine": EMBEDDING_INFO.get("engine", "unknown"),
        "message": "Agent processed text successfully",
        "llm_model": MODEL_ID,
        "intent": {
            "intents": list(intent['intents']),
            "target_columns": intent['target_columns'],
            "measure_field": intent['measure_field'],
            "category_field": intent['category_field'],
            "chart_type": intent['chart_type'],
            "is_single_chart": intent['is_single_chart'],
            "is_comparison": intent['is_comparison'],
            "is_top_bottom": intent['is_top_bottom'],
            "top_n": intent['top_n'],
            "comparison_fields": intent['comparison_fields'],
            "confidence": intent['confidence'],
        }
    }

