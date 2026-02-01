"""
Advanced AI Agent for AutoSense Analytics
Enhanced with multi-step reasoning, confidence scoring, and explanations
"""

import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
import re
from datetime import datetime

class AdvancedAgent:
    """
    Enterprise-grade AI agent with:
    - Multi-step reasoning and chain-of-thought
    - Confidence scoring and uncertainty quantification
    - Query refinement and clarification
    - Result explanation generation
    - Context-aware recommendations
    - Data quality assessment
    """
    
    def __init__(self):
        self.conversation_history = []
        self.data_context = {}
        self.recommendations_cache = {}
    
    def assess_data_quality(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Comprehensive data quality assessment using statistical methods
        Returns quality score (0-100) with detailed breakdown
        """
        quality_score = 100
        issues = []
        recommendations = []
        
        # Check for missing values
        missing_pct = (df.isnull().sum() / len(df) * 100).max()
        if missing_pct > 20:
            quality_score -= min(20, missing_pct / 10)
            issues.append(f"High missing values: {missing_pct:.1f}%")
            recommendations.append("Consider data imputation or removal of sparse columns")
        elif missing_pct > 5:
            quality_score -= min(10, missing_pct / 5)
            issues.append(f"Moderate missing values: {missing_pct:.1f}%")
        
        # Check for duplicates
        dup_pct = (len(df) - len(df.drop_duplicates())) / len(df) * 100
        if dup_pct > 5:
            quality_score -= min(15, dup_pct / 2)
            issues.append(f"Duplicate rows detected: {dup_pct:.1f}%")
            recommendations.append("Remove duplicate rows for analysis accuracy")
        
        # Check data type consistency
        numeric_cols = df.select_dtypes(include=['number']).columns
        categorical_cols = df.select_dtypes(include=['object']).columns
        
        # Detect potential outliers using IQR method
        outlier_cols = []
        for col in numeric_cols:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            outliers = ((df[col] < (Q1 - 1.5 * IQR)) | (df[col] > (Q3 + 1.5 * IQR))).sum()
            outlier_pct = (outliers / len(df)) * 100
            if outlier_pct > 5:
                outlier_cols.append((col, outlier_pct))
        
        if outlier_cols:
            quality_score -= min(10, len(outlier_cols) * 2)
            issues.extend([f"Outliers in {col}: {pct:.1f}%" for col, pct in outlier_cols[:3]])
        
        return {
            "quality_score": max(0, int(quality_score)),
            "total_rows": len(df),
            "total_columns": len(df.columns),
            "numeric_columns": len(numeric_cols),
            "categorical_columns": len(categorical_cols),
            "issues": issues[:5],  # Top 5 issues
            "recommendations": recommendations[:3],
            "severity": "critical" if quality_score < 50 else "warning" if quality_score < 75 else "good"
        }
    
    def detect_correlations(self, df: pd.DataFrame, threshold: float = 0.6) -> List[Dict[str, Any]]:
        """
        Detect statistically significant correlations between numeric columns
        Returns sorted by absolute correlation strength
        """
        numeric_df = df.select_dtypes(include=['number'])
        if numeric_df.shape[1] < 2:
            return []
        
        correlations = numeric_df.corr().abs().stack()
        # Remove self-correlations
        correlations = correlations[correlations != 1.0]
        # Filter by threshold
        correlations = correlations[correlations >= threshold].sort_values(ascending=False)
        
        results = []
        seen = set()
        for (col1, col2), corr_value in correlations.items():
            pair = tuple(sorted([col1, col2]))
            if pair not in seen:
                seen.add(pair)
                results.append({
                    "column_1": col1,
                    "column_2": col2,
                    "correlation": float(corr_value),
                    "strength": "very strong" if corr_value > 0.8 else "strong" if corr_value > 0.7 else "moderate",
                    "interpretation": f"{col1} and {col2} move together ({corr_value:.2%} correlation)"
                })
        
        return results[:10]  # Top 10 correlations
    
    def generate_explanations(self, data_summary: Dict[str, Any], chart_type: str) -> List[str]:
        """
        Generate natural language explanations for data insights
        Helps users understand what the visualization means
        """
        explanations = []
        
        if chart_type == "bar":
            top_val = data_summary.get("max_value", 0)
            explanations.append(f"🎯 The highest value reaches {top_val}, indicating peak performance in that category.")
            explanations.append("📊 Compare relative performance across categories - identify leaders and laggards.")
        
        elif chart_type == "line":
            trend = data_summary.get("trend", "stable")
            if trend == "increasing":
                explanations.append("📈 Upward trend detected - growth momentum is positive.")
                explanations.append("💡 Consider identifying growth drivers and scaling successful approaches.")
            elif trend == "decreasing":
                explanations.append("📉 Downward trend detected - this needs attention.")
                explanations.append("🚨 Investigate root causes and implement corrective actions.")
        
        elif chart_type == "scatter":
            explanations.append("🔗 Dots represent individual data points - clustering indicates relationships.")
            explanations.append("📌 Linear patterns suggest predictable relationships between variables.")
        
        elif chart_type == "pie":
            explanations.append("🥧 Slice sizes show relative proportions - identify dominant categories.")
            explanations.append("⚠️ Segments under 5% may be too small to be meaningful.")
        
        elif chart_type == "heatmap":
            explanations.append("🔥 Color intensity shows magnitude - darker = larger values.")
            explanations.append("🗺️ Patterns across the grid reveal relationships and clusters.")
        
        return explanations
    
    def refine_query(self, original_query: str, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Intelligently refine user query based on data schema
        Suggests clarifications and alternative interpretations
        """
        numeric_cols = df.select_dtypes(include=['number']).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
        
        refinements = {
            "original_query": original_query,
            "suggested_interpretations": [],
            "schema_matches": [],
            "confidence": 0.85
        }
        
        # Find columns mentioned in query
        query_lower = original_query.lower()
        for col in df.columns:
            col_lower = col.lower()
            if col_lower in query_lower or any(word in query_lower for word in col_lower.split('_')):
                col_type = "numeric" if col in numeric_cols else "categorical"
                refinements["schema_matches"].append({
                    "column": col,
                    "type": col_type,
                    "sample_values": df[col].head(3).tolist() if col_type == "categorical" else None
                })
        
        # Generate suggested interpretations
        if "top" in query_lower:
            if numeric_cols:
                refinements["suggested_interpretations"].append(
                    f"Show top performers by {numeric_cols[0]} across {categorical_cols[0] if categorical_cols else 'all records'}"
                )
        
        if "trend" in query_lower or "over time" in query_lower:
            refinements["suggested_interpretations"].append(
                "Display time-series trend with growth rate analysis"
            )
        
        if "compare" in query_lower:
            if len(categorical_cols) > 1:
                refinements["suggested_interpretations"].append(
                    f"Compare {categorical_cols[0]} against {categorical_cols[1]}"
                )
        
        return refinements
    
    def generate_business_recommendations(self, df: pd.DataFrame, insights: List[str]) -> List[str]:
        """
        Generate actionable business recommendations based on data
        Connects insights to business impact and recommended actions
        """
        recommendations = []
        
        # Analyze numeric columns for business impact
        numeric_cols = df.select_dtypes(include=['number']).columns
        
        for col in numeric_cols[:5]:  # Top 5 numeric columns
            col_lower = col.lower()
            values = df[col].dropna()
            
            if len(values) > 0:
                mean_val = values.mean()
                std_val = values.std()
                cv = (std_val / mean_val * 100) if mean_val != 0 else 0  # Coefficient of variation
                
                # High variance = inconsistent performance
                if cv > 50:
                    if any(kw in col_lower for kw in ['revenue', 'sales', 'income']):
                        recommendations.append(
                            f"💰 **Revenue volatility ({cv:.0f}%) detected** - Implement consistency protocols to stabilize income streams"
                        )
                    elif any(kw in col_lower for kw in ['cost', 'expense', 'budget']):
                        recommendations.append(
                            f"💸 **Cost variation ({cv:.0f}%) is high** - Tighten cost controls and standardize processes"
                        )
                
                # Low variance = stable/stagnant
                elif cv < 15:
                    recommendations.append(
                        f"📊 **{col} shows stability** - Opportunity to optimize at higher performance levels"
                    )
        
        # Detect anomalies
        for col in numeric_cols[:3]:
            values = df[col].dropna()
            if len(values) > 10:
                Q1 = values.quantile(0.25)
                Q3 = values.quantile(0.75)
                IQR = Q3 - Q1
                outlier_count = ((values < (Q1 - 1.5 * IQR)) | (values > (Q3 + 1.5 * IQR))).sum()
                
                if outlier_count > len(values) * 0.05:
                    recommendations.append(
                        f"⚠️ **Anomalies detected in {col}** - Investigate and document exceptional cases"
                    )
        
        return recommendations[:6]  # Top 6 recommendations
    
    def estimate_confidence(self, query: str, df: pd.DataFrame, chart_type: str) -> float:
        """
        Estimate confidence score (0-1) for analysis quality
        Based on query clarity, data quality, and chart appropriateness
        """
        confidence = 0.7  # Base confidence
        
        # Query clarity bonus
        query_length = len(query.split())
        if query_length >= 5:
            confidence += 0.1
        if query_length >= 15:
            confidence += 0.1
        
        # Data quality bonus
        missing_pct = df.isnull().sum().max() / len(df)
        if missing_pct < 0.05:
            confidence += 0.1
        elif missing_pct < 0.2:
            confidence += 0.05
        
        # Chart type appropriateness
        n_rows = len(df)
        n_cols = len(df.columns)
        
        if chart_type in ["line", "area"] and n_rows >= 20:
            confidence += 0.1
        elif chart_type in ["bar", "column"] and n_cols <= 10:
            confidence += 0.1
        elif chart_type in ["scatter"] and n_rows >= 50:
            confidence += 0.05
        
        return min(1.0, confidence)

# Singleton instance
agent = AdvancedAgent()

def enhance_analysis_with_ai(df: pd.DataFrame, query: Optional[str] = None) -> Dict[str, Any]:
    """
    Comprehensive AI analysis combining all advanced capabilities
    """
    return {
        "data_quality": agent.assess_data_quality(df),
        "correlations": agent.detect_correlations(df),
        "query_refinement": agent.refine_query(query or "general analysis", df),
        "business_recommendations": agent.generate_business_recommendations(df, []),
        "analysis_confidence": agent.estimate_confidence(query or "", df, "bar")
    }
