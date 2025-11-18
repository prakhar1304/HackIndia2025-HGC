"""
MeTTa utility functions for movie recommendation system
"""

import json
import re
import threading
from typing import Any, Dict, List, Optional
from hyperon import MeTTa
from config import Config

# Global MeTTa instance and lock
_metta: Optional[MeTTa] = None
_METTA_LOCK = threading.RLock()

def _new_metta() -> MeTTa:
    """Create a new MeTTa instance and load logic file"""
    m = MeTTa()
    with open(Config.LOGIC_FILE, "r", encoding="utf-8") as f:
        res = m.run(f.read())
    return m

def initialize_metta() -> MeTTa:
    """Initialize the global MeTTa instance"""
    global _metta
    if _metta is None:
        _metta = _new_metta()
    return _metta

def get_metta() -> MeTTa:
    """Get the global MeTTa instance"""
    global _metta
    if _metta is None:
        _metta = _new_metta()
    return _metta

# def atoms_to_strings(results) -> List[str]:
#     """Convert MeTTa results to string list"""
#     out: List[str] = []
#     for r in results:
#         for a in r:
#             out.append(str(a))
#     return out



def atoms_to_strings(results) -> List[str]:
    """Convert MeTTa results to string list"""
    out: List[str] = []
    for r in results:
        if isinstance(r, list):
            for a in r:
                out.append(str(a))
        else:
            out.append(str(r))
    return out

def ensure_symbol(token: str) -> str:
    """Sanitize token for MeTTa symbol usage"""
    s = re.sub(r"[^A-Za-z0-9_\-]", "_", str(token).strip())
    if not s:
        raise ValueError("Empty symbol after sanitization")
    return s

def normalize_movie_id(mid: str) -> str:
    """Normalize movie ID to MeTTa format"""
    mid = str(mid).strip()
    return mid if mid.startswith("m_") else f"m_{mid}"

def run_metta_code(lines: List[str]) -> List[str]:
    """Run MeTTa code with thread safety"""
    m = get_metta()
    program = "\n".join(lines)
    with _METTA_LOCK:
        return atoms_to_strings(m.run(program))

def run_metta_code_direct(code: str):
    """Run MeTTa code directly with thread safety"""
    m = get_metta()
    with _METTA_LOCK:
        return m.run(code)

def quote_for_metta(value: Any) -> str:
    """Quote value for MeTTa usage"""
    s = str(value).replace("\r", " ").replace("\n", " ").replace("\t", " ")
    return json.dumps(s, ensure_ascii=False)

def unique(seq: List[str]) -> List[str]:
    """Remove duplicates while preserving order"""
    seen = set()
    out: List[str] = []
    for x in seq:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out

def metta_ids_to_imdb(ids: List[str]) -> List[str]:
    """Convert MeTTa movie IDs to IMDb IDs"""
    if not ids:
        return []
    
    lines = []
    for mid in ids:
        mid_sym = ensure_symbol(mid)
        lines.append(f"!(match &movies (imdb-id {mid_sym} $im) $im)")
    
    out = run_metta_code(lines)
    
    def strip_quotes(s: str) -> str:
        return s[1:-1] if len(s) >= 2 and s[0] == '"' and s[-1] == '"' else s
    
    return unique([strip_quotes(s) for s in out if s])
