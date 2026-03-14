import json
from app import detect_name, detect_education, detect_skills, semantic_params, model, util

sentences = [
    "my name is", 
    "my name is akash kumar", 
    "my name is akash. i study btech. i love machine learning. i want to become a data scientist."
]

for s in sentences:
    print(f"--- {s} ---")
    print(f"Name:", detect_name(s))
    print(f"Education:", detect_education(s))
    print(f"Skills:", detect_skills(s))
    for p, param_emb in semantic_params.items():
         semb = model.encode(s)
         sim = util.cos_sim(semb, param_emb).item()
         print(f"Semantic {p}: {sim}")
    print()
