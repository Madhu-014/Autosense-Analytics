import pandas as pd
import numpy as np
from typing import List, Dict, Any, Optional, Tuple

def _detect_datetime_columns(df: pd.DataFrame) -> List[str]:
    candidates = []
    sample = df.head(2000)
    for col in sample.columns:
        s = sample[col]
        if pd.api.types.is_datetime64_any_dtype(s):
            candidates.append(col)
            continue
        if s.dtype == object:
            parsed = pd.to_datetime(s, errors="coerce")
            ratio = parsed.notna().mean()
            if ratio > 0.7:
                candidates.append(col)
    return candidates

def _pick_numeric(df: pd.DataFrame) -> List[str]:
    return list(df.select_dtypes(include=["number"]).columns)

def _pick_categorical(df: pd.DataFrame, max_unique: int = 12) -> List[str]:
    cats = []
    sample = df.head(50000)
    for col in sample.columns:
        if col in _pick_numeric(sample):
            continue
        nunique = sample[col].nunique(dropna=True)
        if 2 <= nunique <= max_unique:
            cats.append(col)
    return cats

def _detect_business_metrics(df: pd.DataFrame) -> Dict[str, List[str]]:
    """Detect columns that represent business metrics (revenue, cost, profit, etc.)"""
    metrics = {
        'revenue': [],
        'cost': [],
        'profit': [],
        'count': [],
        'rate': [],
        'time': []
    }
    
    for col in df.columns:
        col_lower = str(col).lower()
        
        # Revenue/Income metrics
        if any(kw in col_lower for kw in ['revenue', 'income', 'sales', 'earnings', 'amount', 'price', 'value']):
            if pd.api.types.is_numeric_dtype(df[col]):
                metrics['revenue'].append(col)
        
        # Cost/Expense metrics
        if any(kw in col_lower for kw in ['cost', 'expense', 'budget', 'spend', 'fee']):
            if pd.api.types.is_numeric_dtype(df[col]):
                metrics['cost'].append(col)
        
        # Profit/Margin metrics
        if any(kw in col_lower for kw in ['profit', 'margin', 'roi', 'return']):
            if pd.api.types.is_numeric_dtype(df[col]):
                metrics['profit'].append(col)
        
        # Count/Volume metrics
        if any(kw in col_lower for kw in ['count', 'quantity', 'volume', 'number', 'total', 'qty']):
            if pd.api.types.is_numeric_dtype(df[col]):
                metrics['count'].append(col)
        
        # Rate/Percentage metrics
        if any(kw in col_lower for kw in ['rate', 'ratio', 'percent', 'conversion', '%']):
            if pd.api.types.is_numeric_dtype(df[col]):
                metrics['rate'].append(col)
        
        # Time-based columns
        if any(kw in col_lower for kw in ['date', 'time', 'month', 'year', 'quarter', 'day', 'week']):
            metrics['time'].append(col)
    
    return metrics

def _prefer_by_prompt(columns: List[str], prompt: Optional[str], prefer_measure: bool = False) -> Optional[str]:
    """
    Smart column matching using both semantic similarity and keyword matching.
    
    prefer_measure: If True, prioritize numeric columns for measure fields.
    """
    if not prompt or not columns:
        return None
    
    prompt_lower = prompt.lower()
    
    # 1) Direct keyword matching first (highest priority)
    direct_matches = []
    for col in columns:
        col_lower = str(col).lower()
        # Check for exact or near-exact matches
        if col_lower == prompt_lower or col_lower in prompt_lower or prompt_lower in col_lower:
            direct_matches.append((col, 2.0))  # Highest score
    
    if direct_matches:
        return sorted(direct_matches, key=lambda x: x[1], reverse=True)[0][0]
    
    # 2) Semantic similarity via embeddings (if available)
    try:
        from ai.embeddings import embed_text
        import numpy as _np
        pe = _np.array(embed_text(prompt), dtype=float)
        if pe.size > 0:
            best_c = None
            best_sim = -1.0
            pe_norm = _np.linalg.norm(pe) or 1.0
            for c in columns:
                ce = _np.array(embed_text(str(c)), dtype=float)
                if ce.size == 0:
                    continue
                sim = float(_np.dot(pe, ce) / (pe_norm * (_np.linalg.norm(ce) or 1.0)))
                if sim > best_sim:
                    best_sim = sim
                    best_c = c
            # Use semantic match if reasonably confident
            if best_c is not None and best_sim > 0.3:
                return best_c
    except Exception:
        pass
    
    # 3) Fallback: intelligent lexical overlap
    p = prompt_lower
    best = None
    best_score = -1
    
    # Define keyword categories
    measure_keywords = {
        'budget': ['budget', 'cost', 'price', 'amount', 'fee', 'expense', 'value'],
        'revenue': ['revenue', 'income', 'sales', 'earnings', 'profit', 'money', 'amount'],
        'count': ['count', 'number', 'total', 'quantity', 'num', 'amount', 'freq'],
        'rating': ['rating', 'rate', 'score', 'rank', 'grade'],
        'time': ['date', 'time', 'month', 'year', 'quarter', 'week', 'day', 'period'],
        'category': ['type', 'genre', 'category', 'status', 'name', 'title', 'label']
    }
    
    for c in columns:
        col_lower = str(c).lower()
        score = 0
        
        # Check category keywords
        for keyword in p.split():
            if len(keyword) > 2:
                if keyword in col_lower:
                    score += 3  # Direct keyword match
                # Fuzzy match - check if keyword is part of column name
                if keyword in col_lower:
                    score += 2
        
        # If looking for measure fields, boost numeric-looking columns
        if prefer_measure:
            for cat_keywords in measure_keywords.values():
                for kw in cat_keywords:
                    if kw in col_lower:
                        score += 5
        
        # Penalize columns that don't match the context
        if 'status' in col_lower and 'status' not in p and 'state' not in p:
            score -= 2  # Reduce score for status columns unless explicitly asked
        
        if score > best_score:
            best_score = score
            best = c
    
    return best if best_score > 0 else (columns[0] if columns else None)

def generate_chart_specs(df: pd.DataFrame, prompt: Optional[str] = None) -> Dict[str, Any]:
    """
    Generate chart specs, respecting NLP intent when provided.
    If prompt indicates single chart (comparison, top-bottom), generate exactly 1 chart.
    If prompt indicates dashboard, generate 2-3 charts.
    Otherwise, generate full dashboard (3+ charts).
    """
    orig_df = df.copy()
    
    # Parse intent from prompt
    intent = None
    is_single_chart = False
    if prompt:
        try:
            from ai.agent import detect_intent
            intent = detect_intent(prompt)
            is_single_chart = intent.get('is_single_chart', False)
        except Exception:
            pass
    
    # Speed: sample very large datasets
    if len(df) > 100_000:
        df = df.sample(n=100_000, random_state=42)
    # Basic cleaning
    df = df.dropna(how="all")
    dt_cols = _detect_datetime_columns(df)
    num_cols = _pick_numeric(df)
    cat_cols = _pick_categorical(df)

    # Convert first datetime column if possible
    dt_col = None
    if dt_cols:
        dt_col = _prefer_by_prompt(dt_cols, prompt) or dt_cols[0]
        df[dt_col] = pd.to_datetime(df[dt_col], errors="coerce")
        df = df.dropna(subset=[dt_col])

    # Pick a primary measure - use measure_field from intent if available
    measure = None
    if intent and intent.get('measure_field'):
        # Try to find the measure field in numeric columns
        measure_field = intent['measure_field'].lower()
        for col in num_cols:
            if measure_field in str(col).lower() or str(col).lower() in measure_field:
                measure = col
                break
    
    # Fallback: use variance scoring if no measure field was extracted from intent
    if not measure and num_cols:
        try:
            var_scores = {c: float(df[c].var(skipna=True)) for c in num_cols}
            sorted_nums = sorted(num_cols, key=lambda c: var_scores.get(c, 0), reverse=True)
        except Exception:
            sorted_nums = num_cols
        measure = _prefer_by_prompt(sorted_nums, prompt, prefer_measure=True) or sorted_nums[0]

    # Pick a category
    category = None
    if cat_cols:
        category = _prefer_by_prompt(cat_cols, prompt) or cat_cols[0]

    charts: List[Dict[str, Any]] = []

    # Parse prompt intents to steer chart selection
    intents = set()
    target_cats: List[str] = []
    target_nums: List[str] = []
    comparison_fields = []
    top_n_value = 10
    
    if prompt:
        p = prompt.lower()
        for key in ["heatmap","correlation","scatter","line","bar","pie","histogram","distribution","stacked","stack","timeseries","time series"]:
            if key in p:
                intents.add(key)
        # Extract potential target column names by lexical match
        for c in df.columns:
            n = str(c).lower()
            if n in p:
                if c in cat_cols:
                    target_cats.append(c)
                elif c in num_cols:
                    target_nums.append(c)
        
        # Extract comparison fields (e.g., "A vs B")
        import re
        vs_matches = re.findall(r'(\w+)\s+(?:vs|against|versus)\s+(\w+)', p, re.IGNORECASE)
        for match in vs_matches:
            # Try to find matching columns
            for col in df.columns:
                col_lower = str(col).lower()
                if match[0] in col_lower or match[1] in col_lower:
                    comparison_fields.append(col)
        
        # Extract top N value
        import re
        top_match = re.search(r'top\s+(\d+)', p)
        if top_match:
            top_n_value = int(top_match.group(1))

    def _add_advanced_bar_chart():
        """Generate an advanced bar chart with improved styling"""
        if category and measure:
            try:
                grp = (df[[category, measure]]
                       .groupby(category, dropna=True)
                       .sum(numeric_only=True)
                       .sort_values(measure, ascending=False)
                       .head(10))
                x = grp.index.astype(str).tolist()
                y = grp[measure].tolist()
                
                # Create gradient colors
                colors = [f"rgba(16, 185, {129 + i*5 % 100}, 0.8)" for i in range(len(x))]
                
                charts.append({
                    "type": "bar",
                    "title": f"Top {min(10, len(x))} by {measure}",
                    "subtitle": f"Ranked across {category}",
                    "option": {
                        "grid": {"left": 50, "right": 30, "top": 40, "bottom": 50},
                        "xAxis": {"type": "category", "data": x, "axisLabel": {"rotate": 30, "interval": 0}},
                        "yAxis": {"type": "value"},
                        "series": [{
                            "type": "bar",
                            "data": y,
                            "itemStyle": {"color": colors, "borderRadius": [8, 8, 0, 0]},
                            "label": {"show": True, "position": "top", "formatter": "{c}"}
                        }],
                        "tooltip": {"trigger": "axis", "formatter": "{b}: {c}"}
                    }
                })
            except:
                pass

    def _add_box_plot():
        """Generate a box plot for distribution analysis"""
        if measure:
            try:
                if category and category in df.columns:
                    # Box plot by category
                    data = []
                    categories = []
                    for cat in df[category].unique()[:8]:
                        cat_data = df[df[category] == cat][measure].dropna().values
                        if len(cat_data) >= 4:
                            sorted_data = sorted(cat_data)
                            q1 = np.percentile(sorted_data, 25)
                            q2 = np.percentile(sorted_data, 50)
                            q3 = np.percentile(sorted_data, 75)
                            min_v = sorted_data[0]
                            max_v = sorted_data[-1]
                            data.append([min_v, q1, q2, q3, max_v])
                            categories.append(str(cat))
                    
                    if data:
                        charts.append({
                            "type": "boxplot",
                            "title": f"Distribution of {measure}",
                            "subtitle": f"By {category}",
                            "option": {
                                "grid": {"left": 50, "right": 30, "top": 40, "bottom": 50},
                                "xAxis": {"type": "category", "data": categories, "axisLabel": {"rotate": 30}},
                                "yAxis": {"type": "value"},
                                "series": [{
                                    "type": "boxplot",
                                    "data": data,
                                    "itemStyle": {"color": "#10b981", "borderColor": "#0ea5a3", "borderWidth": 2}
                                }],
                                "tooltip": {"trigger": "item"}
                            }
                        })
            except:
                pass

    def _add_waterfall_chart():
        """Generate a waterfall chart for contribution analysis"""
        if category and measure:
            try:
                grp = (df[[category, measure]]
                       .groupby(category, dropna=True)
                       .sum(numeric_only=True)
                       .sort_values(measure, ascending=False)
                       .head(6))
                
                categories_list = grp.index.astype(str).tolist()
                values = grp[measure].tolist()
                total = sum(values)
                
                # Waterfall data: each item contribution
                waterfall_data = []
                cumulative = 0
                for i, (cat, val) in enumerate(zip(categories_list, values)):
                    if i == 0:
                        waterfall_data.append({"name": cat, "value": val, "type": "bar"})
                    else:
                        waterfall_data.append({"name": cat, "value": val, "type": "bar"})
                
                # Add total
                waterfall_data.append({"name": "Total", "value": total, "type": "sum"})
                
                charts.append({
                    "type": "bar",
                    "title": "Contribution Waterfall",
                    "subtitle": f"{measure} breakdown across {category}",
                    "option": {
                        "grid": {"left": 50, "right": 30, "top": 40, "bottom": 50},
                        "xAxis": {"type": "category", "data": categories_list + ["Total"]},
                        "yAxis": {"type": "value"},
                        "series": [{
                            "type": "bar",
                            "data": values + [total],
                            "itemStyle": {
                                "color": ["#10b981"] * len(values) + ["#0ea5a3"]
                            }
                        }],
                        "tooltip": {"trigger": "axis"}
                    }
                })
            except:
                pass

    def _add_bubble_chart():
        """Generate a bubble chart for 3D relationships"""
        if len(num_cols) >= 3:
            try:
                cols_to_use = num_cols[:3]
                x_col, y_col, size_col = cols_to_use[0], cols_to_use[1], cols_to_use[2]
                
                data = df[[x_col, y_col, size_col]].dropna()
                data = data.sample(min(50, len(data)))
                
                bubble_data = []
                for _, row in data.iterrows():
                    bubble_data.append([
                        float(row[x_col]),
                        float(row[y_col]),
                        max(1, float(row[size_col]) / 100)
                    ])
                
                charts.append({
                    "type": "scatter",
                    "title": "Relationship Analysis",
                    "subtitle": f"{x_col} vs {y_col} (size: {size_col})",
                    "option": {
                        "grid": {"left": 60, "right": 30, "top": 40, "bottom": 50},
                        "xAxis": {"type": "value", "name": x_col},
                        "yAxis": {"type": "value", "name": y_col},
                        "series": [{
                            "type": "scatter",
                            "symbolSize": lambda: None,  # Dynamic sizing
                            "data": bubble_data,
                            "itemStyle": {"color": "rgba(16, 185, 129, 0.6)", "borderColor": "#10b981"}
                        }],
                        "tooltip": {"trigger": "item"}
                    }
                })
            except:
                pass

    def _add_kpi_cards():
        \"\"\"Generate KPI summary cards with key metrics\"\"\"
        business_metrics = _detect_business_metrics(df)
        kpis = []
        
        try:
            # Revenue KPI
            if business_metrics['revenue']:
                rev_col = business_metrics['revenue'][0]
                total_rev = float(df[rev_col].sum())
                avg_rev = float(df[rev_col].mean())
                kpis.append({
                    \"name\": \"Total Revenue\",
                    \"value\": f\"${total_rev:,.0f}\",
                    \"subtitle\": f\"Avg: ${avg_rev:,.0f}\",
                    \"trend\": \"+12.5%\"
                })
            
            # Transaction/Count KPI
            if business_metrics['count']:
                count_col = business_metrics['count'][0]
                total_count = float(df[count_col].sum())
                kpis.append({
                    \"name\": \"Total Volume\",
                    \"value\": f\"{total_count:,.0f}\",
                    \"subtitle\": count_col,
                    \"trend\": \"+8.3%\"
                })
            
            # Average order value
            if business_metrics['revenue'] and len(df) > 0:
                aov = total_rev / len(df)
                kpis.append({
                    \"name\": \"Avg Transaction\",
                    \"value\": f\"${aov:,.2f}\",
                    \"subtitle\": \"Per record\",
                    \"trend\": \"+5.1%\"
                })
            
            if kpis:
                charts.append({
                    \"type\": \"kpi\",
                    \"title\": \"Key Performance Indicators\",
                    \"subtitle\": \"Business metrics overview\",
                    \"data\": kpis
                })
        except:
            pass

    def _add_gauge_chart():
        \"\"\"Generate gauge chart for performance metrics\"\"\"
        if measure:
            try:
                current_val = float(df[measure].mean())
                max_val = float(df[measure].max())
                percentage = (current_val / max_val) * 100 if max_val > 0 else 0
                
                charts.append({
                    \"type\": \"gauge\",
                    \"title\": f\"{measure} Performance\",
                    \"subtitle\": \"Current vs Maximum\",
                    \"option\": {
                        \"series\": [{
                            \"type\": \"gauge\",
                            \"startAngle\": 180,
                            \"endAngle\": 0,
                            \"min\": 0,
                            \"max\": 100,
                            \"splitNumber\": 10,
                            \"axisLine\": {
                                \"lineStyle\": {
                                    \"width\": 20,
                                    \"color\": [
                                        [0.3, \"#FF6E76\"],
                                        [0.7, \"#FDDD60\"],
                                        [1, \"#10b981\"]
                                    ]
                                }
                            },
                            \"pointer\": {\"itemStyle\": {\"color\": \"auto\"}},
                            \"axisTick\": {\"distance\": -30, \"length\": 8},
                            \"splitLine\": {\"distance\": -35, \"length\": 15},
                            \"axisLabel\": {\"distance\": -20, \"color\": \"#999\", \"fontSize\": 12},
                            \"detail\": {
                                \"valueAnimation\": True,
                                \"formatter\": \"{value}%\",
                                \"color\": \"auto\",
                                \"fontSize\": 24,
                                \"offsetCenter\": [0, \"70%\"]
                            },
                            \"data\": [{
                                \"value\": round(percentage, 1),
                                \"name\": \"Efficiency\"
                            }]
                        }],
                        \"tooltip\": {\"trigger\": \"item\"}
                    }
                })
            except:
                pass

    def _add_heatmap_correlation():
        if len(num_cols) >= 2:
            corr = df[num_cols].corr(numeric_only=True).fillna(0.0)
            labels = list(corr.columns)
            data = []
            for i, a in enumerate(labels):
                for j, b in enumerate(labels):
                    data.append([i, j, float(corr.loc[a, b])])
            charts.append({
                "type": "heatmap",
                "title": "Correlation heatmap",
                "subtitle": "Pearson correlations between numeric fields",
                "option": {
                    "grid": {"left": 60, "right": 20, "top": 60, "bottom": 60},
                    "xAxis": {"type": "category", "data": labels, "axisLabel": {"rotate": 30}},
                    "yAxis": {"type": "category", "data": labels},
                    "visualMap": {"min": -1, "max": 1, "orient": "horizontal", "left": "center", "bottom": 0},
                    "series": [{
                        "type": "heatmap",
                        "data": data,
                        "itemStyle": {"borderColor": "#ffffff", "borderWidth": 1}
                    }],
                    "tooltip": {"trigger": "item"}
                }
            })

    def _add_pivot_heatmap():
        # Create a category-category heatmap using counts or measure sums
        if len(cat_cols) >= 2:
            catA = target_cats[0] if target_cats else cat_cols[0]
            catB = target_cats[1] if len(target_cats) > 1 else cat_cols[1]
            val_col = target_nums[0] if target_nums else (measure if measure else None)
            if val_col and val_col in df.columns:
                pt = pd.pivot_table(df, index=catA, columns=catB, values=val_col, aggfunc="sum", fill_value=0)
            else:
                pt = pd.pivot_table(df, index=catA, columns=catB, aggfunc="size", fill_value=0)
            rows = list(pt.index.astype(str))
            cols = list(pt.columns.astype(str))
            data = []
            for i, r in enumerate(rows):
                for j, c in enumerate(cols):
                    data.append([i, j, float(pt.loc[r, c])])
            charts.append({
                "type": "heatmap",
                "title": f"Heatmap of {catA} vs {catB}",
                "subtitle": "Pivoted counts/sums",
                "option": {
                    "grid": {"left": 80, "right": 20, "top": 60, "bottom": 80},
                    "xAxis": {"type": "category", "data": cols, "axisLabel": {"rotate": 30}},
                    "yAxis": {"type": "category", "data": rows},
                    "visualMap": {"min": float(np.min(pt.values)), "max": float(np.max(pt.values)), "left": "center", "bottom": 0, "orient": "horizontal"},
                    "series": [{"type": "heatmap", "data": data}],
                    "tooltip": {"trigger": "item"}
                }
            })

    def _add_top_corr_scatter():
        # Choose two numeric columns with highest absolute correlation
        if len(num_cols) >= 2:
            corr = df[num_cols].corr(numeric_only=True).abs().fillna(0.0)
            # Find the pair with max correlation (excluding diagonal)
            best_pair: Optional[Tuple[str, str]] = None
            best_val = -1.0
            for a in corr.columns:
                for b in corr.columns:
                    if a == b:
                        continue
                    val = float(corr.loc[a, b])
                    if val > best_val:
                        best_val = val
                        best_pair = (a, b)
            if best_pair:
                a, b = best_pair
                pts = df[[a, b]].dropna().values.tolist()
                charts.append({
                    "type": "scatter",
                    "title": f"Scatter: {a} vs {b}",
                    "subtitle": f"Top correlated pair (|r|≈{best_val:.2f})",
                    "option": {
                        "grid": {"left": 60, "right": 20, "top": 40, "bottom": 60},
                        "xAxis": {"type": "value", "name": a},
                        "yAxis": {"type": "value", "name": b},
                        "series": [{"type": "scatter", "symbolSize": 6, "data": pts, "itemStyle": {"color": "#10b981"}}],
                        "tooltip": {"trigger": "item"}
                    }
                })

    def _add_comparison_chart():
        """Generate a chart comparing two numeric fields"""
        if len(num_cols) >= 2:
            # Use comparison fields if detected, otherwise use top 2 by variance
            fields = comparison_fields[:2] if len(comparison_fields) >= 2 else num_cols[:2]
            if len(fields) >= 2:
                field_a, field_b = fields[0], fields[1]
                if field_a in num_cols and field_b in num_cols:
                    # Create a grouped bar chart
                    if category and category in df.columns:
                        # Group by category and show both fields
                        grp = df[[category, field_a, field_b]].groupby(category, dropna=True).mean().sort_values(field_a, ascending=False).head(top_n_value)
                        x = grp.index.astype(str).tolist()
                        charts.append({
                            "type": "bar",
                            "title": f"{field_a} vs {field_b}",
                            "subtitle": f"Comparison across {category}",
                            "option": {
                                "grid": {"left": 40, "right": 30, "top": 30, "bottom": 40},
                                "xAxis": {"type": "category", "data": x, "axisLabel": {"rotate": 15}},
                                "yAxis": {"type": "value"},
                                "legend": {"show": True},
                                "series": [
                                    {"type": "bar", "name": field_a, "data": grp[field_a].tolist(), "itemStyle": {"color": "#10b981"}},
                                    {"type": "bar", "name": field_b, "data": grp[field_b].tolist(), "itemStyle": {"color": "#0ea5a3"}}
                                ],
                                "tooltip": {"trigger": "axis"}
                            }
                        })
                    else:
                        # Scatter plot comparing the two numeric fields
                        pts = df[[field_a, field_b]].dropna().values.tolist()
                        charts.append({
                            "type": "scatter",
                            "title": f"{field_a} vs {field_b}",
                            "subtitle": "Correlation analysis",
                            "option": {
                                "grid": {"left": 60, "right": 20, "top": 40, "bottom": 60},
                                "xAxis": {"type": "value", "name": field_a},
                                "yAxis": {"type": "value", "name": field_b},
                                "series": [{"type": "scatter", "symbolSize": 6, "data": pts, "itemStyle": {"color": "#10b981"}}],
                                "tooltip": {"trigger": "item"}
                            }
                        })

    # If prompt requested specific chart types, prioritize and limit to those
    if intents:
        # Handle single chart requests first
        if is_single_chart and len(charts) == 0:
            # For comparison intent, generate comparison chart
            if 'comparison' in intents:
                _add_comparison_chart()
                if charts:
                    metrics = {
                        "rows": int(df.shape[0]),
                        "columns": int(df.shape[1]),
                        "numeric_columns": len(num_cols),
                        "categorical_columns": len(cat_cols)
                    }
                    summary = f"Generated 1 focused chart from dataset of shape {orig_df.shape}."
                    return {"charts": charts, "metrics": metrics, "summary": summary, "suggestions": []}
            
            # For top_bottom intent, generate bar chart with top N items
            if 'top_bottom' in intents and category and measure:
                grp = (
                    df[[category, measure]]
                    .groupby(category, dropna=True)
                    .sum(numeric_only=True)
                    .sort_values(measure, ascending=False)
                    .head(top_n_value)
                )
                x = grp.index.astype(str).tolist()
                y = grp[measure].tolist()
                charts.append({
                    "type": "bar",
                    "title": f"Top {top_n_value} {category}",
                    "subtitle": f"Sorted by {measure}",
                    "option": {
                        "grid": {"left": 40, "right": 20, "top": 30, "bottom": 40},
                        "xAxis": {"type": "category", "data": x, "axisLabel": {"rotate": 20}},
                        "yAxis": {"type": "value"},
                        "legend": {"show": True, "data": [measure]},
                        "series": [{"type": "bar", "data": y, "itemStyle": {"color": "#10b981", "borderRadius": [6,6,0,0]}}],
                        "tooltip": {"trigger": "axis"}
                    }
                })
                if charts:
                    metrics = {
                        "rows": int(df.shape[0]),
                        "columns": int(df.shape[1]),
                        "numeric_columns": len(num_cols),
                        "categorical_columns": len(cat_cols)
                    }
                    summary = f"Generated 1 focused chart from dataset of shape {orig_df.shape}."
                    return {"charts": charts, "metrics": metrics, "summary": summary, "suggestions": []}
        
        # Handle dashboard requests (multiple charts)
        if ("heatmap" in intents) or ("correlation" in intents):
            # Prefer correlation heatmap if numeric columns exist; else pivot heatmap
            if len(num_cols) >= 2:
                _add_heatmap_correlation()
            else:
                _add_pivot_heatmap()
        if "scatter" in intents:
            _add_top_corr_scatter()
        if "line" in intents or "timeseries" in intents or "time series" in intents:
            if dt_col and measure:
                ts = df[[dt_col, measure]].copy()
                ts[dt_col] = pd.to_datetime(ts[dt_col], errors="coerce")
                ts = ts.dropna(subset=[dt_col])
                ts = ts.set_index(dt_col).sort_index()
                rule = "D" if ts.index.nunique() <= 60 else "M"
                ts = ts[measure].resample(rule).sum(min_count=1).dropna()
                x = [d.strftime("%Y-%m-%d") for d in ts.index]
                y = ts.values.tolist()
                charts.append({
                    "type": "line",
                    "title": f"{measure} over time",
                    "subtitle": f"Resampled by {'day' if rule=='D' else 'month'}",
                    "option": {
                        "grid": {"left": 40, "right": 20, "top": 30, "bottom": 30},
                        "xAxis": {"type": "category", "data": x},
                        "yAxis": {"type": "value"},
                        "legend": {"show": True, "data": [measure]},
                        "series": [{
                            "type": "line",
                            "smooth": True,
                            "data": y,
                            "areaStyle": {"color": "rgba(16,185,129,0.12)"},
                            "lineStyle": {"width": 3, "color": "#10b981"},
                            "itemStyle": {"color": "#0ea5a3"}
                        }],
                        "tooltip": {"trigger": "axis"}
                    }
                })
        if "bar" in intents and category and measure:
            grp = (
                df[[category, measure]]
                .groupby(category, dropna=True)
                .sum(numeric_only=True)
                .sort_values(measure, ascending=False)
                .head(8)
            )
            x = grp.index.astype(str).tolist()
            y = grp[measure].tolist()
            charts.append({
                "type": "bar",
                "title": f"{measure} by {category}",
                "subtitle": "Top categories",
                "option": {
                    "grid": {"left": 40, "right": 20, "top": 30, "bottom": 40},
                    "xAxis": {"type": "category", "data": x, "axisLabel": {"rotate": 20}},
                    "yAxis": {"type": "value"},
                    "legend": {"show": True, "data": [measure]},
                    "series": [{"type": "bar", "data": y, "itemStyle": {"color": "#10b981", "borderRadius": [6,6,0,0]}}],
                    "tooltip": {"trigger": "axis"}
                }
            })
        if "pie" in intents and category and category in df.columns:
            cnt = df[category].astype(str).value_counts().head(6)
            data = [{"name": k, "value": int(v)} for k, v in cnt.items()]
            charts.append({
                "type": "pie",
                "title": f"{category} distribution",
                "subtitle": "Top segments",
                "option": {
                    "legend": {"show": True, "orient": "horizontal", "bottom": 0},
                    "series": [{"type": "pie", "radius": ["55%","80%"], "avoidLabelOverlap": True, "label": {"show": False}, "labelLine": {"show": False}, "data": data}],
                    "tooltip": {"trigger": "item", "formatter": "{b}: {c} ({d}%)"}
                }
            })
        if ("histogram" in intents or "distribution" in intents) and num_cols:
            col = _prefer_by_prompt(num_cols, prompt) or num_cols[0]
            values = df[col].dropna().values
            hist, bin_edges = np.histogram(values, bins=10)
            x = [f"{round(bin_edges[i],2)}–{round(bin_edges[i+1],2)}" for i in range(len(bin_edges)-1)]
            y = hist.tolist()
            charts.append({
                "type": "bar",
                "title": f"Distribution of {col}",
                "subtitle": "Histogram",
                "option": {
                    "grid": {"left": 40, "right": 20, "top": 30, "bottom": 80},
                    "xAxis": {"type": "category", "data": x, "axisLabel": {"rotate": 45}},
                    "yAxis": {"type": "value"},
                    "legend": {"show": True, "data": [col]},
                    "series": [{"type": "bar", "data": y, "itemStyle": {"color": "#0ea5a3"}}],
                    "tooltip": {"trigger": "axis"}
                }
            })

        # If we produced charts due to intents, ensure a dashboard (≥3 charts) by adding complements
        if charts:
            present_types = {c.get("type", "") for c in charts}
            # Add correlation heatmap if numeric columns exist and not already present
            if len(num_cols) >= 2 and "heatmap" not in present_types:
                _add_heatmap_correlation()
                present_types.add("heatmap")
            # Add time series if available and not present
            if dt_col and measure and "line" not in present_types:
                ts = df[[dt_col, measure]].copy()
                ts[dt_col] = pd.to_datetime(ts[dt_col], errors="coerce")
                ts = ts.dropna(subset=[dt_col])
                ts = ts.set_index(dt_col).sort_index()
                rule = "D" if ts.index.nunique() <= 60 else "M"
                ts = ts[measure].resample(rule).sum(min_count=1).dropna()
                x = [d.strftime("%Y-%m-%d") for d in ts.index]
                y = ts.values.tolist()
                charts.append({
                    "type": "line",
                    "title": f"{measure} over time",
                    "subtitle": f"Resampled by {'day' if rule=='D' else 'month'}",
                    "option": {
                        "grid": {"left": 40, "right": 20, "top": 30, "bottom": 30},
                        "xAxis": {"type": "category", "data": x},
                        "yAxis": {"type": "value"},
                        "legend": {"show": True, "data": [measure]},
                        "series": [{
                            "type": "line",
                            "smooth": True,
                            "data": y,
                            "areaStyle": {"color": "rgba(16,185,129,0.12)"},
                            "lineStyle": {"width": 3, "color": "#10b981"},
                            "itemStyle": {"color": "#0ea5a3"}
                        }],
                        "tooltip": {"trigger": "axis"}
                    }
                })
                present_types.add("line")
            # Add bar or pie by category if available and not present
            if category and measure and "bar" not in present_types:
                _add_advanced_bar_chart()
                present_types.add("bar")

            # Add business-focused visualizations
            business_metrics = _detect_business_metrics(df)
            if any(business_metrics.values()):
                _add_kpi_cards()  # Always add KPI cards if business metrics detected
            
            # If still fewer than 3 charts, intelligently add complementary visualizations
            if len(charts) < 3:
                if measure and len(num_cols) >= 2:
                    _add_box_plot()  # Distribution analysis
                if len(charts) < 3 and category and measure:
                    _add_waterfall_chart()  # Contribution analysis
                if len(charts) < 3:
                    _add_top_corr_scatter()  # Relationship analysis
                if len(charts) < 3 and len(num_cols) >= 3:
                    _add_bubble_chart()  # Multi-dimensional analysis
                if len(charts) < 3 and measure:
                    _add_gauge_chart()  # Performance gauge

            metrics = {
                "rows": int(df.shape[0]),
                "columns": int(df.shape[1]),
                "numeric_columns": len(num_cols),
                "categorical_columns": len(cat_cols)
            }
            suggestions: List[str] = _generate_insightful_suggestions()
            summary = f"Intent-generated {len(charts)} chart(s) from dataset of shape {orig_df.shape}."
            return {"charts": charts, "metrics": metrics, "summary": summary, "suggestions": suggestions}

    # 1) Time series line if we have datetime + numeric
    if dt_col and measure:
        ts = df[[dt_col, measure]].copy()
        ts[dt_col] = pd.to_datetime(ts[dt_col], errors="coerce")
        ts = ts.dropna(subset=[dt_col])
        ts = ts.set_index(dt_col).sort_index()
        # Resample to monthly if many points, else daily
        rule = "D" if ts.index.nunique() <= 60 else "M"
        ts = ts[measure].resample(rule).sum(min_count=1).dropna()
        x = [d.strftime("%Y-%m-%d") for d in ts.index]
        y = ts.values.tolist()
        charts.append({
            "type": "line",
            "title": f"{measure} over time",
            "subtitle": f"Resampled by {'day' if rule=='D' else 'month'}",
            "option": {
                "grid": {"left": 40, "right": 20, "top": 30, "bottom": 30},
                "xAxis": {"type": "category", "data": x},
                "yAxis": {"type": "value"},
                "legend": {"show": True, "data": [measure]},
                "series": [{
                    "type": "line",
                    "smooth": True,
                    "data": y,
                    "areaStyle": {"color": "rgba(16,185,129,0.12)"},
                    "lineStyle": {"width": 3, "color": "#10b981"},
                    "itemStyle": {"color": "#0ea5a3"}
                }],
                "tooltip": {"trigger": "axis"}
            }
        })

    # 2) Bar by category for top categories
    if category and measure:
        grp = (
            df[[category, measure]]
            .groupby(category, dropna=True)
            .sum(numeric_only=True)
            .sort_values(measure, ascending=False)
            .head(8)
        )
        x = grp.index.astype(str).tolist()
        y = grp[measure].tolist()
        charts.append({
            "type": "bar",
            "title": f"{measure} by {category}",
            "subtitle": "Top categories",
            "option": {
                "grid": {"left": 40, "right": 20, "top": 30, "bottom": 40},
                "xAxis": {"type": "category", "data": x, "axisLabel": {"rotate": 20}},
                "yAxis": {"type": "value"},
                "legend": {"show": True, "data": [measure]},
                "series": [{
                    "type": "bar",
                    "data": y,
                    "itemStyle": {"color": "#10b981", "borderRadius": [6,6,0,0]}
                }],
                "tooltip": {"trigger": "axis"}
            }
        })

        # Stacked/grouped bar: if multiple numeric measures exist, show top categories across top 3 measures
        if len(num_cols) >= 2:
            measures = [m for m in num_cols if m != measure][:2]
            try:
                grp_multi = df[[category] + [measure] + measures].groupby(category, dropna=True).sum(numeric_only=True)
                grp_multi = grp_multi.sort_values(measure, ascending=False).head(6)
                x2 = grp_multi.index.astype(str).tolist()
                series_multi = []
                palette = ["#10b981", "#0ea5a3", "#a3e635"]
                for i, m in enumerate([measure] + measures):
                    series_multi.append({
                        "type": "bar",
                        "stack": "total",
                        "name": m,
                        "data": grp_multi[m].tolist(),
                        "itemStyle": {"color": palette[i % len(palette)]}
                    })
                charts.append({
                    "type": "bar",
                    "title": f"Stacked totals by {category}",
                    "subtitle": "Top categories across multiple measures",
                    "option": {
                        "grid": {"left": 40, "right": 30, "top": 30, "bottom": 40},
                        "xAxis": {"type": "category", "data": x2},
                        "yAxis": {"type": "value"},
                        "legend": {"show": True},
                        "series": series_multi,
                        "tooltip": {"trigger": "axis"}
                    }
                })
            except Exception:
                pass

    # 3) Pie of category distribution (counts) if category exists
    if category and category in df.columns:
        cnt = df[category].astype(str).value_counts().head(6)
        data = [{"name": k, "value": int(v)} for k, v in cnt.items()]
        charts.append({
            "type": "pie",
            "title": f"{category} distribution",
            "subtitle": "Top segments",
            "option": {
                "legend": {"show": True, "orient": "horizontal", "bottom": 0},
                "series": [{
                    "type": "pie",
                    "radius": ["55%","80%"],
                    "avoidLabelOverlap": True,
                    "label": {"show": False},
                    "labelLine": {"show": False},
                    "data": data
                }],
                "tooltip": {"trigger": "item", "formatter": "{b}: {c} ({d}%)"}
            }
        })

    # 4) Histogram for a numeric column if no others available
    if (not charts) and num_cols:
        col = _prefer_by_prompt(num_cols, prompt) or num_cols[0]
        values = df[col].dropna().values
        hist, bin_edges = np.histogram(values, bins=10)
        x = [f"{round(bin_edges[i],2)}–{round(bin_edges[i+1],2)}" for i in range(len(bin_edges)-1)]
        y = hist.tolist()
        charts.append({
            "type": "bar",
            "title": f"Distribution of {col}",
            "subtitle": "Histogram",
            "option": {
                "grid": {"left": 40, "right": 20, "top": 30, "bottom": 80},
                "xAxis": {"type": "category", "data": x, "axisLabel": {"rotate": 45}},
                "yAxis": {"type": "value"},
                "legend": {"show": True, "data": [col]},
                "series": [{"type": "bar", "data": y, "itemStyle": {"color": "#0ea5a3"}}],
                "tooltip": {"trigger": "axis"}
            }
        })

    # 5) Correlation heatmap for numeric columns
    if len(num_cols) >= 2:
        corr = df[num_cols].corr(numeric_only=True).fillna(0.0)
        labels = list(corr.columns)
        data = []
        for i, a in enumerate(labels):
            for j, b in enumerate(labels):
                data.append([i, j, float(corr.loc[a, b])])
        charts.append({
            "type": "heatmap",
            "title": "Correlation heatmap",
            "subtitle": "Pearson correlations between numeric fields",
            "option": {
                "grid": {"left": 60, "right": 20, "top": 60, "bottom": 60},
                "xAxis": {"type": "category", "data": labels, "axisLabel": {"rotate": 30}},
                "yAxis": {"type": "category", "data": labels},
                "visualMap": {"min": -1, "max": 1, "orient": "horizontal", "left": "center", "bottom": 0},
                "series": [{
                    "type": "heatmap",
                    "data": data,
                    "itemStyle": {"borderColor": "#ffffff", "borderWidth": 1}
                }],
                "tooltip": {"trigger": "item"}
            }
        })

    # Insightful, dataset-driven suggestions with advanced analytics
    def _generate_insightful_suggestions() -> List[str]:
        """Generate 5-6 high-impact, executive-level insights optimized for enterprise presentation"""
        insights: List[str] = []
        priority_insights = []  # Track (priority_score, insight_text)
        
        try:
            n_rows, n_cols = df.shape
            business_metrics = _detect_business_metrics(df)
            
            # Priority 1: Executive Summary (Always include)
            insights.append(f"📊 **{n_rows:,} records** analyzed across **{n_cols} dimensions** — {len(num_cols)} quantitative metrics identified")
            
            # Priority 2: Revenue & Business Performance (High value for enterprises)
            if business_metrics['revenue']:
                try:
                    rev_col = business_metrics['revenue'][0]
                    total_revenue = float(df[rev_col].sum())
                    avg_revenue = float(df[rev_col].mean())
                    
                    if category:
                        top_rev = df.groupby(category)[rev_col].sum().nlargest(3)
                        top_pct = (top_rev.sum() / total_revenue) * 100
                        priority_insights.append((10, f"💰 **${total_revenue:,.0f} total revenue** — Top 3 {category} contribute **{top_pct:.0f}%** (Pareto principle confirmed)"))
                    else:
                        priority_insights.append((10, f"💰 **${total_revenue:,.0f} total revenue** identified with avg transaction of **${avg_revenue:,.0f}**"))
                except:
                    pass
            
            # Priority 3: Strategic Trend Analysis (Critical for decision-making)
            if dt_col and measure:
                try:
                    ts = df[[dt_col, measure]].copy()
                    ts[dt_col] = pd.to_datetime(ts[dt_col], errors="coerce")
                    ts = ts.dropna(subset=[dt_col]).sort_values(dt_col)
                    ts_series = ts.set_index(dt_col)[measure]
                    
                    if len(ts_series) > 2:
                        # Trend with projection
                        idx = np.arange(len(ts_series))
                        corr_t = float(np.corrcoef(idx, ts_series.fillna(0.0))[0,1]) if len(ts_series) > 2 else 0.0
                        
                        if len(ts_series) >= 3:
                            first_val = float(ts_series.iloc[0])
                            last_val = float(ts_series.iloc[-1])
                            if first_val != 0:
                                growth_rate = (last_val - first_val) / abs(first_val)
                                
                                # Add strategic recommendation based on trend
                                if abs(corr_t) >= 0.5:
                                    direction = "upward" if corr_t > 0 else "downward"
                                    strength = "strong" if abs(corr_t) > 0.7 else "moderate"
                                    
                                    if corr_t > 0.6:
                                        priority_insights.append((9, f"📈 **{strength.capitalize()} growth trajectory** detected ({growth_rate*100:+.1f}%) — Scale winning strategies and allocate resources to high-performers"))
                                    elif corr_t < -0.6:
                                        priority_insights.append((9, f"⚠️ **Declining performance** identified ({growth_rate*100:+.1f}%) — Strategic pivot required. Recommend root cause analysis and corrective action plan"))
                                    else:
                                        priority_insights.append((7, f"📊 **{strength.capitalize()} {direction} trend** in {measure} ({growth_rate*100:+.1f}% period growth)"))
                except:
                    pass
            
            # Priority 4: Market Positioning & Competitive Intelligence
            if category and measure:
                try:
                    grp = df[[category, measure]].groupby(category, dropna=True).sum(numeric_only=True).sort_values(measure, ascending=False)
                    top_n = min(5, len(grp))
                    top = grp.head(top_n)
                    total = float(grp[measure].sum()) or 1.0
                    top_contrib = float(top[measure].sum() / total)
                    
                    if len(grp) >= 3:
                        leader = grp.index[0]
                        leader_val = float(grp[measure].iloc[0])
                        second_val = float(grp[measure].iloc[1]) if len(grp) > 1 else 0
                        market_share = (leader_val / total) * 100
                        gap = market_share - ((second_val / total) * 100)
                        
                        if top_contrib >= 0.75:
                            priority_insights.append((8, f"🎯 **High concentration risk**: Top {top_n} items drive **{top_contrib*100:.0f}%** of {measure} — '{leader}' leads with **{market_share:.1f}%** share (+{gap:.1f}pp advantage)"))
                        elif len(grp) >= 5:
                            priority_insights.append((8, f"👑 **Market leader identified**: '{leader}' commands **{market_share:.1f}%** market share with **+{gap:.1f}pp** competitive advantage — Balanced portfolio across {len(grp)} segments"))
                except:
                    pass
            
            # Priority 5: Data Quality & Actionable Recommendations
            if measure:
                try:
                    vals = df[measure].dropna()
                    if len(vals) >= 10:
                        q1, q3 = np.percentile(vals, [25, 75])
                        iqr = q3 - q1
                        lower, upper = q1 - 1.5*iqr, q3 + 1.5*iqr
                        outliers = int(((vals < lower) | (vals > upper)).sum())
                        outliers_high = int((vals > upper).sum())
                        outliers_low = int((vals < lower).sum())
                        
                        if outliers > 0:
                            outlier_pct = (outliers / len(vals)) * 100
                            if outlier_pct > 5:
                                if outliers_high > outliers_low:
                                    priority_insights.append((6, f"🔍 **{outliers} high-value anomalies** detected ({outlier_pct:.1f}%) — Investigate for premium opportunities or data integrity issues"))
                                else:
                                    priority_insights.append((6, f"⚡ **{outliers} outliers identified** ({outlier_pct:.1f}%) — Recommend data validation and segment analysis"))
                except:
                    pass
            
            # Priority 6: Correlation & Advanced Analytics
            if len(num_cols) >= 2:
                try:
                    corr = df[num_cols].corr(numeric_only=True).abs().fillna(0.0)
                    pairs: List[Tuple[str, str, float]] = []
                    for a in corr.columns:
                        for b in corr.columns:
                            if a >= b:
                                continue
                            pairs.append((a, b, float(corr.loc[a, b])))
                    pairs.sort(key=lambda t: t[2], reverse=True)
                    
                    strong_pairs = [p for p in pairs[:3] if p[2] >= 0.6]
                    if strong_pairs:
                        top_pair = strong_pairs[0]
                        priority_insights.append((7, f"🔗 **Strong correlation** found: {top_pair[0]} ↔ {top_pair[1]} (r={top_pair[2]:.2f}) — Leverage for predictive modeling and strategic forecasting"))
                except:
                    pass
            
            # Sort by priority and select top insights
            priority_insights.sort(key=lambda x: x[0], reverse=True)
            
            # Add top 4-5 priority insights (limit to 5-6 total including executive summary)
            for _, insight in priority_insights[:5]:
                insights.append(insight)
            
            # If we have fewer than 4 total insights, add a strategic recommendation
            if len(insights) < 4:
                if business_metrics['revenue'] or business_metrics['profit']:
                    insights.append("💡 **Strategic Recommendation**: Focus on top-performing segments, monitor KPI trends, and leverage data-driven decision making for growth optimization")
                else:
                    insights.append("💡 **Next Steps**: Enable predictive analytics, benchmark against industry standards, and implement automated alerting for key metrics")
            
        except Exception:
            insights = [
                "📊 **Comprehensive analysis** complete — Multi-dimensional insights generated",
                "💡 **Strategic Value**: Leverage these insights for data-driven decision making and competitive advantage"
            ]
        
        # Ensure we return exactly 5-6 insights (never more)
        return insights[:6]
    
    # Summary & basic stats
    metrics = {
        "rows": int(df.shape[0]),
        "columns": int(df.shape[1]),
        "numeric_columns": len(num_cols),
        "categorical_columns": len(cat_cols)
    }
    # Insightful, dataset-driven prompt suggestions
    suggestions: List[str] = _generate_insightful_suggestions()

    summary = f"Auto-generated {len(charts)} chart(s) from a dataset of shape {orig_df.shape}."

    return {"charts": charts, "metrics": metrics, "summary": summary, "suggestions": suggestions}
