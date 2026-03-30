# LifeOS Personality Engine — Design Reference

## Purpose
The personality engine is the core differentiator of LifeOS. It takes a user's psychometric profile and configures every aspect of the system — WIP limits, dashboard layout, notification style, coaching tone, financial insights, and workflow rules — to match how their brain actually works.

## Assessment Framework

### Input: Streamlined Quiz (5 minutes)
The full assessments (DISC Maxwell, MBTI 16Personalities, Big Five Aspects Scale, Indigo) take hours. The LifeOS quiz distills them into a 5-minute experience that captures the dimensions that matter for productivity and financial behavior.

### Key Dimensions to Capture

**From DISC (4 scales, 0-100):**
- D (Dominance): Drive, decisiveness, directness. High D = needs visible progress, results framing. Low D = needs gentler pacing.
- I (Influence): Social energy, optimism, enthusiasm. High I = needs celebration, sharing wins. Low I = needs privacy, quiet metrics.
- S (Steadiness): Patience, consistency, stability. High S = prefers routine, dislikes sudden change. Low S = adapts fast, gets bored with routine.
- C (Compliance): Accuracy, analysis, quality. High C = needs detailed data, precise tracking. Low C = needs simple summaries, hates granularity.

**From Big Five (5 scales, percentile):**
- Neuroticism: Stress reactivity, anxiety, emotional volatility. HIGH = needs brain dump, stress monitoring, gentle nudges, burnout detection. LOW = can handle blunt accountability.
- Conscientiousness: Organization, follow-through, discipline. HIGH = can handle complex systems, detailed logging. LOW = needs 30-second rule, extreme simplicity, auto-everything.
- Openness: Curiosity, creativity, abstract thinking. HIGH = enjoys exploring, needs idea capture. LOW = prefers concrete, step-by-step guidance.
- Agreeableness: Cooperation, empathy, conflict avoidance. HIGH = may over-commit to please others (needs boundary support). LOW = comfortable saying no.
- Extraversion: Social energy, activity level. HIGH = benefits from social accountability. LOW = prefers solo tracking.

**From MBTI (4 binary preferences):**
- I/E: Social features (share progress vs private tracking)
- N/S: Abstraction level (big-picture dashboards vs detailed lists)
- T/F: Coaching tone (logical consequence framing vs emotional support)
- J/P: Structure level (rigid schedules vs flexible energy-matching)

## Profile-to-Configuration Mapping

### WIP Limit Calculation
```
base_wip = 4
if conscientiousness > 70th: base_wip += 1
if conscientiousness > 85th: base_wip += 1
if conscientiousness < 30th: base_wip -= 1
if neuroticism > 80th: base_wip -= 1
wip_limit = clamp(base_wip, 2, 8)
```

### Feature Toggles by Profile

| Feature | Trigger | Default |
|---------|---------|---------|
| Brain Dump zone | Neuroticism > 70th | ON |
| Consequence framing | T (MBTI) + Conscientiousness < 50th | ON |
| Energy-based task picker | P (MBTI) OR Conscientiousness < 50th | ON |
| Burnout detection | Neuroticism > 80th | ON |
| Auto-archive completed | Conscientiousness < 40th | ON |
| Celebration prompts | I > 50 (DISC) OR Extraversion > 50th | ON |
| Rigid scheduling | J (MBTI) AND Conscientiousness > 70th | OFF |
| Social sharing | E (MBTI) AND I > 50 (DISC) | OFF |

### Coaching Tone Profiles

**The Commander** (High D, Low S): Direct, results-focused. "Ship the MVP scope doc today or park it."
**The Cheerleader** (High I, High Agreeableness): Encouraging, celebratory. "You crushed 3 check-ins this week!"
**The Analyst** (High C, High Openness): Data-driven. "Your stress-to-sleep correlation is -0.73 this month."
**The Coach** (Balanced, High Neuroticism): Calm, grounding. "Before you start a new project, check your WIP gauge."

Michael's profile: Commander + Coach + Analyst mix.

### Financial Insight Profiles

- High Neuroticism: Don't show daily portfolio fluctuations. Monthly reviews only. Frame debt as "months until freedom."
- Low Conscientiousness: Auto-categorize. Default to totals, not transaction detail. Quick catch-up mode.
- High D: Progress bars, completion %, competitive framing, escape velocity countdown.
- High I: Shareable milestone cards, celebration prompts, partner collaboration.

## Michael's Configuration (Reference Implementation)

```json
{
  "disc": { "d": 59, "i": 66, "s": 25, "c": 61 },
  "mbti": "INTP-T",
  "big5": {
    "neuroticism": 96, "conscientiousness": 23,
    "agreeableness": 50, "extraversion": 47, "openness": 49
  },
  "config": {
    "wip_limit": 4,
    "brain_dump_enabled": true,
    "consequence_framing": true,
    "energy_matching": true,
    "burnout_detection": true,
    "auto_archive": true,
    "coaching_tone": "commander_coach_analyst",
    "financial_check_frequency": "monthly",
    "show_daily_portfolio": false,
    "debt_framing": "months_to_freedom",
    "logging_mode": "quick_totals"
  }
}
```
