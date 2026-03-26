def rule_based_score(self, features):

    structured = features.get("structured", {})

    score = 5
    feedback = []

    # ✅ NAME
    if structured.get("name_present"):
        score += 1
    else:
        feedback.append("Introduction is incomplete (name missing).")

    # ✅ DEGREE
    if structured.get("degree_present"):
        score += 1
    else:
        feedback.append("Mention your degree.")

    # ✅ COLLEGE
    if structured.get("college_present"):
        score += 1
    else:
        feedback.append("Mention your college.")

    # ✅ SKILLS
    if structured.get("skills_present"):
        score += 1
    else:
        feedback.append("Add your skills.")

    # ✅ EXPERIENCE
    if structured.get("experience_present"):
        score += 1
    else:
        feedback.append("Add experience or projects.")

    # ✅ GOAL
    if structured.get("career_goal_present"):
        score += 1
    else:
        feedback.append("Mention your career goals.")

    return {
        "overall_score": min(score, 10),
        "confidence": "medium",
        "feedback": feedback
    }