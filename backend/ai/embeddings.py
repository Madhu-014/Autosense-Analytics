# embeddings.py

from __future__ import annotations
from typing import List
import math
import re
import hashlib

EMBEDDING_INFO = {"engine": "hashing", "dim": 256}
_st_model = None

def _load_sentence_transformer():
    global _st_model, EMBEDDING_INFO
    if _st_model is not None:
        return _st_model
    try:
        from sentence_transformers import SentenceTransformer
        # Small, fast model; downloads on first use
        _st_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        EMBEDDING_INFO = {"engine": "sentence-transformers", "dim": 384}
    except Exception:
        _st_model = None
        EMBEDDING_INFO = {"engine": "hashing", "dim": 256}
    return _st_model

_token_re = re.compile(r"[A-Za-z0-9_]+")

def _simple_hash_embedding(text: str, dim: int = 256) -> List[float]:
    vec = [0.0] * dim
    if not text:
        return vec
    tokens = _token_re.findall(text.lower())
    if not tokens:
        return vec
    for tok in tokens:
        h = hashlib.md5(tok.encode("utf-8")).digest()
        idx = int.from_bytes(h[:4], "big") % dim
        sign = 1.0 if (h[4] & 1) == 1 else -1.0
        vec[idx] += sign
    # L2 normalize
    norm = math.sqrt(sum(v*v for v in vec)) or 1.0
    return [v / norm for v in vec]

def embed_text(text: str) -> List[float]:
    """
    Returns a fixed-length embedding for the input text.
    - Prefers Sentence Transformers (if installed) for high-quality vectors.
    - Falls back to a lightweight hashing-based embedding (no extra deps).
    """
    model = _load_sentence_transformer()
    if model is not None:
        try:
            emb = model.encode([text], normalize_embeddings=True)
            return emb[0].tolist()
        except Exception:
            # Fallback on runtime failure
            pass
    return _simple_hash_embedding(text, dim=EMBEDDING_INFO.get("dim", 256))

