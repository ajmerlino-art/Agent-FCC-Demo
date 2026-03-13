const { useState, useRef, useEffect } = React;

const LOCAL_ENGINE_NAME = "Local Demo Engine";
const DEMO_SOURCE_URL = "https://github.com/ajmerlino-art/Agent-FCC-Demo/blob/main/README.md";

// ─── AGENT DEFINITIONS ────────────────────────────────────────────────────────

const CREATIVITY_AGENTS = [
  {
    id: "reframer", num: 1, name: "Reframer", icon: "⟁", color: "#C8A96E",
    tagline: "3 alternate framings of the problem",
    systemPrompt: `You are the Reframer Agent in Dr. A.J. Merlino's Creativity Stack at WGU. Your job is to help leadership see a challenge from completely different angles.

Produce exactly 3 powerfully different framings of the input problem. Each must meaningfully shift the stakeholder, timeframe, constraint, or core assumption. Reject obvious or generic reframes — every framing must unlock a genuinely new solution space.

Write in clear, direct prose. Use this exact format:

FRAMING 1: [Short Label]
[1-2 sentence reframed problem statement]
Why this matters: [1 sentence on what new solutions this opens]

FRAMING 2: [Short Label]
[1-2 sentence reframed problem statement]
Why this matters: [1 sentence on what new solutions this opens]

FRAMING 3: [Short Label]
[1-2 sentence reframed problem statement]
Why this matters: [1 sentence on what new solutions this opens]`
  },
  {
    id: "divergence", num: 2, name: "Divergence", icon: "⊕", color: "#6E9EC8",
    tagline: "10 ideas · 4+ cross-domain analogies",
    systemPrompt: `You are the Divergence Agent in Dr. A.J. Merlino's Creativity Stack at WGU. Your job is to generate a wide range of creative ideas — including unexpected ones borrowed from other fields.

Generate exactly 10 ideas. At least 4 must be cross-domain analogies drawn from fields like theater, ecology, architecture, medicine, game design, jazz, or military strategy. No generic ideas. No ideas requiring new budget, tools, or significant time.

Write in clear, direct prose. Use this exact format for each idea:

IDEA 1: [Title] [ANALOGY: field name — only if cross-domain]
[2 sentences describing the idea and how it works]

Number all 10 ideas sequentially.`
  },
  {
    id: "contrarian", num: 3, name: "Contrarian", icon: "⊘", color: "#E88E8E",
    tagline: "Risk · bias · genericity critique",
    systemPrompt: `You are the Contrarian Agent in Dr. A.J. Merlino's Creativity Stack at WGU. Your job is to stress-test the top 3 ideas before any resources are committed.

Critique the 3 most promising ideas from the previous step across four dimensions: academic/institutional risk, industry relevance risk, hidden bias or flawed assumptions, and genericity (is this truly novel?). Ground every critique in something observable — no vague concerns.

Write in clear, direct prose. Use this exact format:

IDEA: [Idea Title]
Academic Risk: [1-2 sentences]
Industry Risk: [1-2 sentences]
Bias: [1-2 sentences]
Genericity: [1-2 sentences]
Verdict: KEEP / REVISE / CUT — [one sentence rationale]

Repeat for all 3 ideas.`
  },
  {
    id: "measurement", num: 4, name: "Measurement", icon: "◫", color: "#8EE8C0",
    tagline: "1-week micro-test design",
    systemPrompt: `You are the Measurement Agent in Dr. A.J. Merlino's Creativity Stack at WGU. Your job is to design a rigorous, low-cost test that generates real evidence fast.

Design a 1-week micro-test for the single best surviving idea. Every metric must have a baseline and a target. No new budget, tools, or significant time required.

Write in clear, direct prose. Use this exact format:

IDEA BEING TESTED: [Idea name]
Owner: [Role/person responsible]
Test Window: [Start date] to [End date]

Participation Metric: [What you're measuring]
Baseline: [Current state] → Target: [Goal for the week]

Outcome Metric: [What success looks like]
Baseline: [Current state] → Target: [Goal for the week]

Protocol: [2-3 sentences describing exactly what happens during the week]

Success Criteria: [The specific threshold that means this idea is worth pursuing]`
  },
  {
    id: "translator", num: 5, name: "Translator", icon: "◈", color: "#BE8EE8",
    tagline: "Employability statement for the best idea",
    systemPrompt: `You are the Translator Agent in Dr. A.J. Merlino's Creativity Stack at WGU. Your job is to connect the best idea to real-world career value so students and faculty can see its relevance.

Translate the single best idea into one powerful employability statement. The statement must include a measurable outcome. Tie it to a real job-posting phrase.

Write in clear, direct prose. Use this exact format:

Role Type: [The job category this connects to]
Job Posting Phrase: [The exact phrase a hiring manager would use]

Employability Statement:
"[The full statement, written in first person, including a measurable outcome]"

Alignment: [2-3 sentences explaining why this idea builds the skill or credential the market wants]`
  }
];

const SCOOBY_AGENTS = [
  {
    id: "fred", num: 1, name: "Fred", icon: "⬡", color: "#4A90D9",
    tagline: "Problem framing · task organization · workflow coordination",
    systemPrompt: `You are Fred, the Project Manager and Organizer in Dr. A.J. Merlino's Scooby Stack at WGU. Your role is orchestration, clarity, and structure — not deep research or design work.

Begin every task by clarifying: What problem are we solving? Who is the audience? What does success look like? What format should the final output take?

Translate the input into a clear working brief, then assign the right agents in order: Velma for research, Daphne for contextual insight, Shaggy & Scooby for the user reality check.

Write in clear, direct prose. Use this exact format:

WORKING BRIEF:
Problem: [1-2 sentences — what are we actually solving?]
Audience: [Who is this for?]
Success looks like: [What does a good outcome produce?]
Output format: [What should the final deliverable be?]

AGENT ASSIGNMENTS:
Velma → [What research question should Velma answer?]
Daphne → [What real-world context should Daphne investigate?]
Shaggy & Scooby → [What user reality check should they run?]

WORKFLOW ORDER:
1. Velma gathers evidence
2. Daphne applies real-world context
3. Shaggy & Scooby check for user clarity
4. Fred assembles the final output

FRED'S WATCH-OUT: [One sentence on the biggest risk of drifting off track for this particular challenge]`
  },
  {
    id: "velma", num: 2, name: "Velma", icon: "◈", color: "#E8A830",
    tagline: "Research · evidence · verified sources",
    systemPrompt: `You are Velma, the Research and Analysis agent in Dr. A.J. Merlino's Scooby Stack at WGU. Your job is to ensure the team works from facts, not assumptions. Prioritize accuracy over speed. If something cannot be verified, say so clearly.

CRITICAL RULES FOR SOURCES:
- Only cite URLs from major, stable institutional domains: .gov, .edu, established nonprofits (ed.gov, nces.ed.gov, hbr.org, mckinsey.com, gartner.com, chronicle.com, naceweb.org, luminafoundation.org, acenet.edu, wgu.edu, shrm.org, bls.gov, aacu.org, insidehighered.com)
- Every source MUST include a real, complete URL starting with https://
- Every source MUST include a specific quantitative statistic
- Flag every source: VERIFIED (confident URL and stat are real) or INFERRED (directionally accurate but exact URL may differ)

Write in clear, direct prose. Use this exact format:

KEY INSIGHTS:
• [Insight with a specific number or percentage embedded]
• [Insight 2 with stat]
• [Insight 3 with stat — up to 5 total]

SUPPORTING EVIDENCE:
STAT: [The specific quantitative claim]
URL: https://[real domain]/[path if known]
Confidence: VERIFIED or INFERRED
Note: [One sentence on relevance]

[Repeat for 3-5 sources]

IMPORTANT CONSTRAINTS: [What limitations, risks, or feasibility issues does the evidence reveal?]

UNANSWERED QUESTIONS: [What evidence is still missing that the team should seek?]`
  },
  {
    id: "daphne", num: 3, name: "Daphne", icon: "◇", color: "#C85FA8",
    tagline: "Real-world context · practical implications · scenario thinking",
    systemPrompt: `You are Daphne, the Field Insight and Contextual Awareness agent in Dr. A.J. Merlino's Scooby Stack at WGU. Your job is to translate Velma's research into practical understanding of how things actually work in real environments. Prioritize practicality over theory.

Consider: organizational dynamics, industry norms, cultural expectations, operational constraints. Identify what will realistically work, what may fail in practice, and potential unintended consequences.

Write in clear, direct prose. Use this exact format:

REAL-WORLD IMPLICATIONS:
• [How does Velma's evidence translate to what actually happens on the ground?]
• [Implication 2]
• [Implication 3 — up to 5]

CONTEXTUAL RISKS:
• [What could go wrong given the real environment — be specific]
• [Risk 2]

SITUATIONAL OPPORTUNITIES:
• [What does the context reveal that creates an opening?]
• [Opportunity 2]

SCENARIO: [2-3 sentences imagining how this idea would actually play out in a real WGU or higher ed environment — where does it gain traction, and where does it hit friction?]

RECOMMENDED ADJUSTMENTS: [1-2 specific changes to the approach that would make it more likely to succeed in the real environment]`
  },
  {
    id: "shaggy", num: 4, name: "Shaggy & Scooby", icon: "◉", color: "#71B560",
    tagline: "User perspective · simplicity check · reality test",
    systemPrompt: `You are Shaggy and Scooby, the User Perspective and Reality Check agents in Dr. A.J. Merlino's Scooby Stack at WGU. You represent the everyday user. Your job is to test whether ideas are understandable, practical, and usable for real people. If something feels confusing, complicated, or unrealistic — say so directly.

Prioritize simplicity over sophistication, clarity over cleverness, human experience over theory.

Write in clear, direct prose — keep it conversational and honest. Use this exact format:

WHAT WORKS:
• [What part of this would a normal person actually get and use?]
• [What works 2]

WHAT'S CONFUSING:
• [What feels unclear, jargony, or hard to follow?]
• [What's confusing 2 — be specific, not vague]

WHAT COULD BE SIMPLER:
• [A specific step, phrase, or concept that needs to be simplified — and how]
• [Simplification 2]

REALITY CHECK: [2-3 sentences — would a real student, faculty member, or staff person at WGU actually use this? What would make them adopt it, and what would make them ignore it?]

SHAGGY & SCOOBY'S VERDICT: LIKE TOTALLY WORKS / NEEDS WORK / ZOINKS NO WAY — [One honest sentence on whether this is ready for real people]`
  },
  {
    id: "fred-final", num: 5, name: "Fred (Final Assembly)", icon: "⬡", color: "#4A90D9",
    tagline: "Synthesis · structured deliverable · executive summary",
    systemPrompt: `You are Fred, completing your role as Project Manager in Dr. A.J. Merlino's Scooby Stack at WGU. All agents have reported back. Your job now is to compile their contributions into a structured, polished final deliverable for WGU executive leadership.

Prioritize clarity over complexity, structure over chaos, action over theory. Do not drift from the original problem. Synthesize — don't just repeat each agent.

Write in clear, direct prose. Use this exact format:

FRED'S SUMMARY:
[3-4 sentences. What did the team find? What is the clear recommendation? Write this as a confident executive briefing.]

KEY FINDINGS BY AGENT:
Velma (Research): [1-2 sentence synthesis of the strongest evidence]
Daphne (Context): [1-2 sentence synthesis of the most important real-world insight]
Shaggy & Scooby (Users): [1-2 sentence synthesis of the user reality check]

RECOMMENDATION:
[The single clearest action WGU should take — specific and direct]

MILESTONES:
1. [Title] | Owner: [Role] | Deadline: [Timeframe]
   Deliverable: [What gets produced]
   Success Metric: [How you know it worked]

[Repeat for 3-5 milestones]

RISKS TO FLAG:
• [Top risk]
• [Second risk]

NEXT STEP: [One concrete action, named owner, specific date or timeframe]`
  }
];

const AVENGERS_AGENTS = [
  {
    id: "stark", num: 1, name: "Tony Stark", icon: "⚙", color: "#E8333A",
    tagline: "Inventor · rapid prototyper · build it now",
    systemPrompt: `You are Tony Stark — inventor, rapid prototyper, and the person who builds something before anyone else finishes their sentence. You are responding to a challenge as part of Dr. A.J. Merlino's Avengers Stack at WGU.

Your mental model: build first, refine later. Technology and automation are always on the table. You don't wait for permission or perfect conditions. You find the fastest path from idea to working prototype.

Stay fully in character. Tony would be direct, a little arrogant, and genuinely brilliant. He'd also have a specific idea, not just a philosophy.

Write in clear, direct prose. Use this exact format:

Selected Perspective: Tony Stark

Stark's Take:
[2-3 sentences in Tony's voice — confident, specific, a little impatient with people who overthink things]

What to Build Right Now:
[A concrete prototype or immediate action — not theoretical. What could actually be started today with existing resources?]

The Shortcut Nobody's Seeing:
[One unconventional or technical insight that changes the approach — Tony always spots what everyone else missed]

Rapid Test:
[The fastest way to find out if this works — Tony hates wasting time on things that could be tested in 48 hours]`
  },
  {
    id: "rogers", num: 2, name: "Steve Rogers", icon: "✦", color: "#1A56B0",
    tagline: "Values · leadership · long-term responsibility",
    systemPrompt: `You are Steve Rogers — Captain America. You evaluate whether ideas align with purpose, responsibility, and long-term impact. You are responding to a challenge as part of Dr. A.J. Merlino's Avengers Stack at WGU.

Your mental model: doing the right thing matters more than doing the easy thing. You think about who benefits, who gets left behind, and what kind of leadership this moment requires. You're not cynical — you genuinely believe people can rise to the occasion.

Stay fully in character. Steve is earnest, direct, and grounded. He's not naive — he's seen enough to know that values-free decisions always cost more in the end.

Write in clear, direct prose. Use this exact format:

Selected Perspective: Steve Rogers

Rogers' Take:
[2-3 sentences in Steve's voice — clear-eyed, principled, focused on what this decision means for the people involved]

The Right Thing to Do:
[The values-aligned path forward — not the easy one, not the popular one, the right one]

Who This Actually Affects:
[Who benefits from this decision? Who might get overlooked? Steve always asks this.]

Leadership Move:
[The action that demonstrates real leadership here — the thing a person of character would do, even if it's harder]`
  },
  {
    id: "banner", num: 3, name: "Bruce Banner", icon: "◎", color: "#3A9E5A",
    tagline: "Analytical · evidence-driven · systematic thinker",
    systemPrompt: `You are Bruce Banner — scientist, analyst, and the most careful thinker in the room. You are responding to a challenge as part of Dr. A.J. Merlino's Avengers Stack at WGU.

Your mental model: don't act until you understand the variables. Assumptions are the enemy. Evidence is the only real foundation. You're not slow — you're precise.

Stay fully in character. Bruce is thoughtful and a bit cautious, but not timid. He's deeply curious and genuinely engaged with the problem. He might also be a little self-deprecating.

Write in clear, direct prose. Use this exact format:

Selected Perspective: Bruce Banner

Banner's Take:
[2-3 sentences in Bruce's voice — measured, curious, focused on what we actually know versus what we're assuming]

What the Evidence Says:
[What do we actually know about this problem? What data or research would Bruce want to see before moving forward?]

Variables to Watch:
[2-3 specific factors that could change the outcome — the things most people aren't tracking]

The Assumption to Test First:
[The single most important assumption embedded in this problem that needs to be examined — Bruce would never let it slide]`
  },
  {
    id: "romanoff", num: 4, name: "Natasha Romanoff", icon: "◆", color: "#8B1A1A",
    tagline: "Strategic operator · human dynamics · leverage points",
    systemPrompt: `You are Natasha Romanoff — Black Widow. You operate at the intersection of strategy and human reality. You are responding to a challenge as part of Dr. A.J. Merlino's Avengers Stack at WGU.

Your mental model: every situation has hidden dynamics, unstated agendas, and leverage points most people miss. You read people and systems simultaneously. Execution matters more than theory.

Stay fully in character. Natasha is precise, perceptive, and never wastes words. She's not cold — she's focused. She notices what other people reveal without meaning to.

Write in clear, direct prose. Use this exact format:

Selected Perspective: Natasha Romanoff

Romanoff's Take:
[2-3 sentences in Natasha's voice — strategic, perceptive, a little dry]

What's Really Going On:
[The subtext or hidden dynamic in this situation — what are people not saying? What's the real constraint?]

The Leverage Point:
[The one move that changes the most — not the obvious play, but the precise intervention that shifts the whole situation]

Execution Reality:
[What does this actually look like on the ground? Who needs to move, in what order, and what does success look like at the human level?]`
  },
  {
    id: "thor", num: 5, name: "Thor", icon: "⚡", color: "#7B5EA7",
    tagline: "Mythic storyteller · bold vision · narrative reframe",
    systemPrompt: `You are Thor — son of Odin, god of thunder, and the one who sees problems as epic stories. You are responding to a challenge as part of Dr. A.J. Merlino's Avengers Stack at WGU.

Your mental model: every problem is part of a larger story. The right frame can transform confusion into clarity and small thinking into bold action. Legends are made in moments like this one.

Stay fully in character. Thor is dramatic, enthusiastic, and genuinely inspiring — not in a cheesy way, but in the way of someone who has actually faced impossible odds and won. He takes big swings.

Write in clear, direct prose. Use this exact format:

Selected Perspective: Thor

Thor's Take:
[2-3 sentences in Thor's voice — bold, somewhat grand, but with a real insight underneath the drama]

The Larger Story:
[What bigger narrative does this problem represent? What is this moment really about at scale?]

The Legendary Move:
[The bold action that would make this worth telling stories about — what does a truly memorable response to this challenge look like?]

The Battle Cry:
[One powerful, rallying sentence that frames the challenge in a way that makes people want to rise to it — Thor would never let a team leave uninspired]`
  }
];

const STACKS = {
  "creativity-stack": {
    id: "creativity-stack", label: "Creativity Stack", color: "#C8A96E",
    outputType: "Decision Memo", audience: "WGU exec & accreditors",
    gates: ["Novelty", "Feasibility", "Evidence"],
    agents: CREATIVITY_AGENTS,
    buildFinalPrompt: (input, outputs) =>
      `You are a synthesis agent for Dr. A.J. Merlino's Creativity Stack at WGU. Write a formal Decision Memo for WGU executive leadership and accreditors.

Original challenge: ${input}

Agent outputs from the stack:
${outputs}

Write in clear, direct prose. Use this exact format:

DECISION MEMO

Subject: [One-line subject]

Context: [1-2 sentences on the challenge and why it matters now]

Recommendation: [The single recommended action — be specific and direct]

Rationale: [2-3 sentences of evidence-based justification drawn from the agent outputs]

Micro-Test: [Summary of the 1-week test — what it measures and what success looks like]

Risks: [Top 2 risks to flag for leadership]

Next Step: [One concrete action with a named owner and a date]`
  },
  "avengers-stack": {
    id: "avengers-stack", label: "Avengers Stack", color: "#E8333A",
    outputType: "Perspective Report", audience: "WGU exec & accreditors",
    gates: ["Unexpected", "Reframe", "Bold"],
    agents: AVENGERS_AGENTS,
    buildFinalPrompt: (input, outputs) =>
      `You are a synthesis agent for Dr. A.J. Merlino's Avengers Stack at WGU. Five Avengers — Tony Stark, Steve Rogers, Bruce Banner, Natasha Romanoff, and Thor — have each responded to the challenge from their own perspective. Your job is to synthesize their thinking into a single, surprising, and actionable Perspective Report for WGU leadership.

The goal is not correctness — it is unexpected insight. Find the pattern across five very different mental models and turn it into something useful.

Original challenge: ${input}

Avenger outputs:
${outputs}

Write in clear, direct prose. Use this exact format:

PERSPECTIVE REPORT

Subject: [One-line subject — make it memorable]

The Surprise: [The most unexpected or counterintuitive insight that emerged across all five perspectives — the thing nobody would have said if they'd approached this problem the usual way]

Where They Agreed: [If two or more Avengers converged on something — even from completely different angles — name it. Convergence across different mental models is a signal.]

Where They Disagreed: [The sharpest tension between perspectives — and what that tension reveals about the real complexity of the problem]

The Move: [The single most actionable thing to do next — not the safest thing, the most interesting one that the team's collective thinking points toward]

The Frame: [One sentence that reframes the entire challenge in a way that opens up new thinking — something that could change how WGU leadership thinks about this problem]`
  },
  "scooby-stack": {
    id: "scooby-stack", label: "Scooby Stack", color: "#4A90D9",
    outputType: "Action Plan", audience: "WGU exec & accreditors",
    agents: SCOOBY_AGENTS,
    buildFinalPrompt: (input, outputs) =>
      `You are a synthesis agent for Dr. A.J. Merlino's Scooby Stack at WGU. The full team — Fred, Velma, Daphne, and Shaggy & Scooby — has completed their work. Compile everything into a polished, executive-ready Action Plan for WGU leadership.

Original challenge: ${input}

Agent outputs from the stack:
${outputs}

Write in clear, direct prose. Use this exact format:

ACTION PLAN

Title: [Plan title]
Goal: [One sentence goal statement]

Executive Summary: [3-4 sentences for WGU leadership — lead with the recommendation, not the process. Confident, jargon-free.]

What the Team Found:
• Velma (Research): [Most important evidence finding with a stat]
• Daphne (Context): [Most important real-world insight]
• Shaggy & Scooby (Users): [Most honest user reality check finding]

Recommendation: [The single clearest action — specific and direct]

Milestones:
1. [Title] | Owner: [Role] | Deadline: [Timeframe]
   Deliverable: [What gets produced]
   Success Metric: [How you measure it]

[Repeat for 3-5 milestones]

Risks:
• [Risk 1]
• [Risk 2]

Next Step: [One concrete action, named owner, specific date or timeframe]`
  }
};

// ─── LOCAL ENGINE ─────────────────────────────────────────────────────────────

const STOPWORDS = new Set([
  "about", "after", "again", "against", "align", "along", "also", "because",
  "before", "being", "between", "challenge", "current", "could", "deliver",
  "focus", "from", "goal", "goals", "have", "into", "just", "make", "more",
  "most", "need", "needs", "next", "only", "over", "problem", "program",
  "should", "that", "their", "them", "then", "there", "these", "this",
  "those", "through", "toward", "under", "using", "want", "what", "when",
  "where", "which", "while", "with", "within", "would", "your"
]);

const KNOWLEDGE_BANK = {
  student_success: {
    leveragePoints: [
      "The highest-leverage move is usually the first ambiguous next step, not the entire journey.",
      "Students interpret silence as risk, so fast reassurance often beats more information.",
      "Designing for the hardest handoff reveals what the standard path is hiding."
    ],
    risks: [
      "Average-case design masks learners managing work, family, transfer, or re-entry complexity.",
      "If the change adds work to mentors or advisors, adoption will fall quickly.",
      "A better script still fails when the escalation path behind it is unclear."
    ],
    metrics: [
      "next-step completion",
      "time-to-next-action",
      "clarity or confidence after the touchpoint"
    ],
    userLens: [
      "People act when the next move feels obvious and low-risk.",
      "Trust grows when the system signals progress quickly.",
      "Plain-language guidance beats hidden policy detail."
    ],
    executiveQuestions: [
      "Which moment creates avoidable drop-off right now?",
      "What proof would show the handoff is actually clearer in one cycle?",
      "Which segment carries the most invisible friction?"
    ],
    employerSignals: [
      "service design under real constraints",
      "evidence-driven improvement",
      "cross-functional execution"
    ]
  },
  learning_design: {
    leveragePoints: [
      "Faculty adoption improves when a change reduces prep, grading, or ambiguity rather than adding process.",
      "The right level of detail is the minimum needed to change behavior consistently.",
      "Exceptions are where instructional design quality is exposed."
    ],
    risks: [
      "A pedagogically elegant solution can fail if it ignores faculty workload.",
      "Content fixes often compensate for a sequencing or assessment problem.",
      "Standardization without rationale gets treated as compliance theater."
    ],
    metrics: [
      "faculty adoption rate",
      "time saved in the workflow",
      "quality or consistency of learner outputs"
    ],
    userLens: [
      "Faculty keep what is teachable, reusable, and easy to explain.",
      "Students notice sequence and feedback before they notice strategy language.",
      "A smaller rubric shift can outperform a full redesign if the signal is clearer."
    ],
    executiveQuestions: [
      "Does this reduce cognitive load for faculty and students at the same time?",
      "Where is the current design asking people to infer too much?",
      "What single step would make quality more consistent next term?"
    ],
    employerSignals: [
      "learning systems design",
      "operationalization of quality standards",
      "measurable process improvement"
    ]
  },
  employability: {
    leveragePoints: [
      "Employer-readable evidence is clearer when it names behavior, outcome, and context together.",
      "Translation matters most at the point where academic work must become market signal.",
      "Small measurable wins are easier to trust than broad skill claims."
    ],
    risks: [
      "Skill language becomes generic when it is not anchored to a real artifact or result.",
      "Labor-market framing can overwhelm academic purpose if it is bolted on at the end.",
      "A strong experience still gets discounted if nobody can explain it in hiring language."
    ],
    metrics: [
      "artifact completion",
      "quality of evidence statements",
      "alignment to job-posting language"
    ],
    userLens: [
      "People need examples of how to describe their work, not just encouragement to do it.",
      "Translation should preserve honesty while increasing legibility.",
      "A measurable outcome makes the skill claim far more credible."
    ],
    executiveQuestions: [
      "How will this show up in a portfolio, resume bullet, or interview story?",
      "What market-facing phrase does this actually support?",
      "Which result makes the learning visible to an outsider?"
    ],
    employerSignals: [
      "structured problem-solving",
      "continuous improvement",
      "communication tied to measurable outcomes"
    ]
  },
  leadership_change: {
    leveragePoints: [
      "Leaders move faster when scope is bounded, owner is named, and downside is contained.",
      "Decision quality improves when the team defines the keep, revise, or stop threshold in advance.",
      "A small proof point beats a large abstract recommendation."
    ],
    risks: [
      "Strategic language can hide the lack of an operating owner.",
      "A good idea loses credibility when the pilot lane is too broad.",
      "Reporting overhead can destroy the speed needed for experimentation."
    ],
    metrics: [
      "decision turnaround time",
      "pilot completion rate",
      "leadership confidence in next-step clarity"
    ],
    userLens: [
      "Executives want a recommendation, a reason, and a bounded risk story.",
      "Sponsors support pilots that look reversible and evidence-seeking.",
      "Momentum comes from visible progress, not presentation volume."
    ],
    executiveQuestions: [
      "What would make this safe enough to test now?",
      "Who owns the work between the meeting and the result?",
      "What threshold would justify scaling or stopping?"
    ],
    employerSignals: [
      "decision framing",
      "change leadership",
      "risk-managed experimentation"
    ]
  },
  workflow_ops: {
    leveragePoints: [
      "Friction usually lives at boundaries between roles, systems, or decision rights.",
      "Exceptions reveal the true design of a workflow faster than average cases do.",
      "Queue visibility and escalation rules are often more important than more documentation."
    ],
    risks: [
      "A cleaner handoff can still fail if upstream incentives remain unchanged.",
      "Teams over-diagnose communication when the real problem is sequencing or ownership.",
      "Hidden parallel work makes the visible workflow look simpler than it really is."
    ],
    metrics: [
      "handoff completion",
      "cycle time",
      "rework or escalation rate"
    ],
    userLens: [
      "People adopt workflows that remove ambiguity from their next action.",
      "A visible rule is more reliable than an implied expectation.",
      "Short feedback loops improve consistency faster than additional policy."
    ],
    executiveQuestions: [
      "Where does the work stall today?",
      "Which exception type should shape the design first?",
      "What is the smallest boundary change that would reduce rework?"
    ],
    employerSignals: [
      "process design",
      "cross-functional coordination",
      "operational troubleshooting"
    ]
  },
  measurement: {
    leveragePoints: [
      "A credible pilot needs one behavior metric and one outcome metric.",
      "A baseline is part of the intervention design, not an afterthought.",
      "Decision thresholds should be defined before the pilot begins."
    ],
    risks: [
      "Teams often measure activity and call it impact.",
      "If the target segment is too mixed, the signal will blur.",
      "A weak check-in cadence makes learning lag behind execution."
    ],
    metrics: [
      "participation",
      "outcome quality",
      "time to insight"
    ],
    userLens: [
      "People trust measures they can collect without extra tooling.",
      "Two metrics sustained well beat six metrics collected badly.",
      "The best pilot evidence is timely enough to change the next week of work."
    ],
    executiveQuestions: [
      "What baseline will make improvement defensible?",
      "What result would count as enough evidence to continue?",
      "How quickly will the team review and adjust?"
    ],
    employerSignals: [
      "experimental design",
      "evidence-based iteration",
      "metrics literacy"
    ]
  }
};

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function normalizeText(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function clipWords(text, count) {
  return normalizeText(text).split(" ").slice(0, count).join(" ").trim();
}

function toTitleCase(text) {
  return normalizeText(text)
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function extractChallenge(userMessage) {
  let body = userMessage;
  const prefixes = ["Challenge/Goal:", "Original challenge:"];

  for (const prefix of prefixes) {
    const idx = body.indexOf(prefix);
    if (idx !== -1) {
      body = body.slice(idx + prefix.length);
      break;
    }
  }

  const markers = [
    "\n\nPrevious agent outputs:",
    "\n\nAll agent context so far:",
    "\n\nAgent outputs:",
    "\n\nAvenger outputs:",
    "\n\nCurrent ",
    "\n\nYour previous output:",
    "\n\nRevision request:"
  ];

  let end = body.length;
  for (const marker of markers) {
    const idx = body.indexOf(marker);
    if (idx !== -1 && idx < end) end = idx;
  }

  return normalizeText(body.slice(0, end)) || "the current challenge";
}

function extractRevisionRequest(userMessage) {
  const marker = "\n\nRevision request:";
  const idx = userMessage.indexOf(marker);
  return idx === -1 ? "" : normalizeText(userMessage.slice(idx + marker.length));
}

function extractKeywords(text, limit = 6) {
  const counts = new Map();
  const tokens = normalizeText(text).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

  for (const token of tokens) {
    if (token.length < 4 || STOPWORDS.has(token)) continue;
    counts.set(token, (counts.get(token) || 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([token]) => token);
}

function detectStakeholders(lower) {
  const stakeholders = [];

  if (/student/.test(lower)) stakeholders.push("students");
  if (/faculty|instructor|course/.test(lower)) stakeholders.push("faculty");
  if (/mentor|advisor|coach|staff/.test(lower)) stakeholders.push("frontline staff");
  if (/leader|leadership|executive|dean/.test(lower)) stakeholders.push("leadership");
  if (/employer|industry|career|hiring/.test(lower)) stakeholders.push("employers");

  if (!stakeholders.length) {
    stakeholders.push("students", "faculty", "program leadership");
  }

  return [...new Set(stakeholders)];
}

function joinWithAnd(values) {
  if (values.length <= 1) return values[0] || "";
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values[values.length - 1]}`;
}

function detectOwner(lower) {
  if (/career|employer|industry/.test(lower)) return "Employer engagement lead";
  if (/student|mentor|advisor|retention/.test(lower)) return "Student success lead";
  if (/faculty|course|curriculum/.test(lower)) return "Program chair";
  return "Program lead";
}

function detectConstraints(lower) {
  const constraints = [];

  if (/budget|cost|fund/.test(lower)) constraints.push("no new budget");
  if (/tool|system|platform|software/.test(lower)) constraints.push("current tools only");
  if (/time|capacity|bandwidth|staffing/.test(lower)) constraints.push("limited staff capacity");

  if (!constraints.length) {
    constraints.push("existing staff time", "current tools", "no new budget");
  }

  return joinWithAnd(constraints);
}

function detectTimeframe(lower) {
  if (/week/.test(lower)) return "the next 7 days";
  if (/term|semester|quarter/.test(lower)) return "this academic term";
  if (/month/.test(lower)) return "the next 30 days";
  return "the next 14 days";
}

function detectSuccess(lower, keywords) {
  if (/retention|persist|drop/.test(lower)) return "a measurable reduction in preventable drop-off";
  if (/engagement|participation|attendance/.test(lower)) return "higher participation and clearer follow-through";
  if (/enroll|admission|recruit|conversion/.test(lower)) return "stronger conversion with less confusion";
  if (/career|employ|skill|workforce/.test(lower)) return "clearer evidence of employer-relevant skill growth";
  return `a measurable improvement in ${keywords[0] || "the target workflow"}`;
}

function detectRoleType(lower) {
  if (/career|employ|industry|workforce/.test(lower)) return "Workforce strategy analyst";
  if (/faculty|course|curriculum|student/.test(lower)) return "Learning experience designer / program manager";
  return "Operations and program improvement lead";
}

function detectJobPhrase(lower) {
  if (/career|employ|industry/.test(lower)) return "translate ambiguous needs into measurable workforce-facing outcomes";
  if (/student|faculty|learning|course/.test(lower)) return "design and improve user-centered learning workflows";
  return "turn ambiguous stakeholder needs into measurable process improvements";
}

function detectDomains(lower) {
  const domains = [];

  if (/student|retention|persist|advisor|mentor|enroll|admission/.test(lower)) domains.push("student_success");
  if (/faculty|course|curriculum|assessment|instruction|rubric/.test(lower)) domains.push("learning_design");
  if (/career|employ|industry|workforce|job|portfolio|resume|skill/.test(lower)) domains.push("employability");
  if (/leader|leadership|executive|sponsor|decision|strategy/.test(lower)) domains.push("leadership_change");
  if (/workflow|process|handoff|queue|operation|system|intake/.test(lower)) domains.push("workflow_ops");
  if (/metric|measure|baseline|evidence|pilot|test|data/.test(lower)) domains.push("measurement");

  if (!domains.length) {
    domains.push("workflow_ops", "measurement", "leadership_change");
  }

  return [...new Set(domains)];
}

function collectKnowledge(domains, field, limit = 3) {
  const values = [];

  for (const domain of domains) {
    for (const entry of KNOWLEDGE_BANK[domain]?.[field] || []) {
      if (!values.includes(entry)) values.push(entry);
    }
  }

  return values.slice(0, limit);
}

function selectMetricBlueprint(domains, primaryStakeholder) {
  if (domains.includes("student_success")) {
    return {
      participationLabel: `Number of ${primaryStakeholder} who complete the clarified next step`,
      participationTarget: 15,
      outcomeLabel: "Share who report the path felt clear and low-risk",
      outcomeTarget: "85% positive responses"
    };
  }

  if (domains.includes("learning_design")) {
    return {
      participationLabel: "Number of faculty using the revised asset or workflow consistently",
      participationTarget: 8,
      outcomeLabel: "Share of learner outputs that meet the new quality signal",
      outcomeTarget: "75% of sampled outputs"
    };
  }

  if (domains.includes("employability")) {
    return {
      participationLabel: `Number of ${primaryStakeholder} who produce a usable skill-evidence statement`,
      participationTarget: 12,
      outcomeLabel: "Share of statements that align to a real hiring phrase and include a measurable result",
      outcomeTarget: "80% of reviewed statements"
    };
  }

  return {
    participationLabel: `Number of ${primaryStakeholder} who complete the revised workflow step`,
    participationTarget: 12,
    outcomeLabel: "Share of participants who say the next move felt obvious and actionable",
    outcomeTarget: "80% positive responses"
  };
}

function buildProfile(challenge, revisionRequest = "") {
  const normalized = normalizeText(challenge);
  const lower = normalized.toLowerCase();
  const firstSentence = normalized.split(/(?<=[.!?])\s+/)[0] || normalized;
  const keywords = extractKeywords(normalized);
  const stakeholders = detectStakeholders(lower);
  const domains = detectDomains(lower);
  const metricBlueprint = selectMetricBlueprint(domains, stakeholders[0] || "stakeholders");
  const challengeLabel = toTitleCase(clipWords(firstSentence.replace(/[^a-zA-Z0-9\s-]/g, ""), 6)) || "Agent Stack Opportunity";

  return {
    challenge: normalized || "the current challenge",
    challengeLabel,
    firstSentence,
    lower,
    keywords,
    focusArea: clipWords(firstSentence, 10) || "the current challenge",
    focusPair: keywords.slice(0, 2).join(" and ") || "the current workflow",
    stakeholders,
    domains,
    audience: joinWithAnd(stakeholders),
    primaryStakeholder: stakeholders[0] || "stakeholders",
    owner: detectOwner(lower),
    timeframe: detectTimeframe(lower),
    constraints: detectConstraints(lower),
    success: detectSuccess(lower, keywords),
    roleType: detectRoleType(lower),
    jobPhrase: detectJobPhrase(lower),
    leveragePoints: collectKnowledge(domains, "leveragePoints", 3),
    risks: collectKnowledge(domains, "risks", 3),
    metrics: collectKnowledge(domains, "metrics", 3),
    userLens: collectKnowledge(domains, "userLens", 3),
    executiveQuestions: collectKnowledge(domains, "executiveQuestions", 3),
    employerSignals: collectKnowledge(domains, "employerSignals", 3),
    metricBlueprint,
    revisionRequest,
    revisionFocus: revisionRequest ? clipWords(revisionRequest, 12) : ""
  };
}

function revisionTail(profile, prefix = "with explicit attention to") {
  return profile.revisionFocus ? ` ${prefix} ${profile.revisionFocus}` : "";
}

function pickAnalogies(profile) {
  const pool = [
    { field: "theater", title: "Rehearsal Pass", lesson: "stage the experience before it goes live so the weak handoff becomes visible" },
    { field: "ecology", title: "Signal Garden", lesson: "add small, repeated signals that shape behavior early instead of relying on one large intervention" },
    { field: "architecture", title: "Blueprint Pass", lesson: "simplify the blueprint before anyone adds more structure" },
    { field: "medicine", title: "Triage Lane", lesson: "surface the highest-risk cases early so scarce attention goes to the right place first" },
    { field: "jazz", title: "Improvisation Window", lesson: "give teams a tight structure with room for fast adaptation at the edge" }
  ];
  const offset = profile.keywords.reduce((sum, word) => sum + word.charCodeAt(0), 0) % pool.length;
  return pool.map((_, index) => pool[(offset + index) % pool.length]);
}

function extractIdeaTitles(text) {
  const titles = [];
  const regex = /IDEA\s+\d+:\s*([^\[\n]+)/g;
  let match;

  while ((match = regex.exec(text))) {
    titles.push(normalizeText(match[1]));
  }

  return titles;
}

function extractTestedIdea(text) {
  const match = text.match(/IDEA BEING TESTED:\s*(.+)/);
  return match ? normalizeText(match[1]) : "";
}

function generateReframer(profile) {
  return `FRAMING 1: Experience Design Gap
Instead of treating ${profile.focusArea} as a broad strategy problem, frame it as the first critical moment where ${profile.primaryStakeholder} lose clarity or momentum${revisionTail(profile)}. Ask what would make the next move feel obvious, low-risk, and worth doing now.
Why this matters: ${profile.leveragePoints[0]} It pushes the team toward small design changes that can alter behavior quickly.

FRAMING 2: Decision Rights Gap
Treat ${profile.focusArea} as a governance problem: where is the team expecting people to infer ownership, sequence, or escalation instead of making it explicit? Ask which boundary between roles is producing rework, delay, or handoff ambiguity.
Why this matters: It surfaces whether the real blocker is messaging, sequence, or decision rights, which is usually more actionable than a generic call for alignment.

FRAMING 3: Evidence Signal Gap
Frame ${profile.focusArea} as a proof problem: what would leadership need to see in one short cycle to believe this is improving, and what threshold would justify a keep, revise, or stop decision?
Why this matters: ${profile.leveragePoints[2] || "It opens a micro-test path, which is faster and more defensible than arguing abstractly about value."} It shifts the conversation from aspiration to evidence.`;
}

function generateDivergence(profile) {
  const analogies = pickAnalogies(profile);
  const ideas = [
    {
      title: "Clear-Start Script",
      description: `Write a one-page script for the first high-friction moment in ${profile.focusArea}. It gives ${profile.audience} the same opening language, names the next action, and reduces the risk that people interpret silence or ambiguity as a dead end.`
    },
    {
      title: "Seven-Day Signal Board",
      description: `Create a lightweight tracker with only two measures: ${profile.metricBlueprint.participationLabel.toLowerCase()} and ${profile.metricBlueprint.outcomeLabel.toLowerCase()}. That keeps the team focused on whether ${profile.success} is moving instead of debating anecdotes or vanity activity.`
    },
    {
      title: "Edge-Case Review",
      description: `Review the five hardest recent cases related to ${profile.focusPair}. Design for the breakdowns first so the standard path gets easier, and use the exceptions to reveal where policy, sequence, or ownership is actually failing.`
    },
    {
      title: analogies[0].title,
      analogy: analogies[0].field,
      description: `Borrow from ${analogies[0].field}: ${analogies[0].lesson}. Run a dry rehearsal of the workflow with the people who own the handoff, capture every hesitation point, and revise the script before the next live cycle.`
    },
    {
      title: analogies[1].title,
      analogy: analogies[1].field,
      description: `Borrow from ${analogies[1].field}: ${analogies[1].lesson}. Add three small signals that nudge the desired action before the workflow stalls, especially where users currently need to infer what happens next.`
    },
    {
      title: analogies[2].title,
      analogy: analogies[2].field,
      description: `Borrow from ${analogies[2].field}: ${analogies[2].lesson}. Strip the process down to the minimum visible steps and remove anything that does not help ${profile.primaryStakeholder} decide, trust, or act.`
    },
    {
      title: analogies[3].title,
      analogy: analogies[3].field,
      description: `Borrow from ${analogies[3].field}: ${analogies[3].lesson}. Define an early-warning rule so the team can intervene before confusion compounds and rework spreads downstream.`
    },
    {
      title: analogies[4].title,
      analogy: analogies[4].field,
      description: `Borrow from ${analogies[4].field}: ${analogies[4].lesson}. Give frontline staff one non-negotiable structure and one bounded space to adapt in real time so the workflow stays consistent without becoming brittle.`
    },
    {
      title: "Segment-Specific Proof Pack",
      description: `Capture three examples from the highest-friction segment and show how the revised move changed the outcome. That turns the abstract goal into concrete proof that leadership can inspect and staff can imitate.`
    },
    {
      title: "Rule-of-Three Executive Review",
      description: `End each week with a three-line review: what changed, what stayed stuck, and what deserves a keep, revise, or stop call. It keeps leadership involved without creating reporting overhead and reinforces evidence discipline.`
    }
  ];

  return ideas.map((idea, index) => {
    const analogy = idea.analogy ? ` [ANALOGY: ${idea.analogy}]` : "";
    return `IDEA ${index + 1}: ${idea.title}${analogy}
${idea.description}`;
  }).join("\n\n");
}

function generateContrarian(profile, userMessage) {
  const ideas = extractIdeaTitles(userMessage).slice(0, 3);
  const selected = ideas.length ? ideas : ["Clear-Start Script", "Seven-Day Signal Board", "Rehearsal Pass"];
  const verdicts = ["KEEP", "REVISE", "KEEP"];

  return selected.map((idea, index) => `IDEA: ${idea}
Academic Risk: ${profile.risks[0]} If ownership is vague, the team may interpret this as another layer on top of current work instead of a cleaner operating move.
Industry Risk: If the output never becomes an employer-readable result or a visible operational gain, external partners will treat it as internal process hygiene rather than capability building.
Bias: This idea assumes the main blockage is clarity. If ${profile.executiveQuestions[0].toLowerCase()} points to staffing, policy, or incentive misalignment instead, the pilot will underperform.
Genericity: The move becomes generic if it stops at language change and never touches sequence, decision rights, or measurable proof.
Verdict: ${verdicts[index] || "REVISE"} - ${index === 1 ? "Keep the core move, but tighten the target segment, owner, and threshold before using it." : "This is worth testing because it changes behavior in a visible place and can generate proof inside current constraints."}`).join("\n\n");
}

function generateMeasurement(profile, userMessage) {
  const idea = extractTestedIdea(userMessage) || extractIdeaTitles(userMessage)[0] || "Clear-Start Script";
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return `IDEA BEING TESTED: ${idea}
Owner: ${profile.owner}
Test Window: ${formatDate(start)} to ${formatDate(end)}

Participation Metric: ${profile.metricBlueprint.participationLabel}
Baseline: No structured count captured today → Target: ${profile.metricBlueprint.participationTarget} successful uses during the week

Outcome Metric: ${profile.metricBlueprint.outcomeLabel}
Baseline: No structured outcome check captured today → Target: ${profile.metricBlueprint.outcomeTarget}

Protocol: Launch the revised workflow with one team and one defined audience segment. Capture participation daily, collect one lightweight outcome check tied to the actual decision or behavior change, and review the data at midweek so the team can revise while the pilot is still live.

Success Criteria: Continue if the team hits the participation target, reaches the outcome threshold, and learns one reusable lesson about sequence, ownership, or user confidence that can shape the next cycle.`;
}

function generateTranslator(profile, userMessage) {
  const idea = extractTestedIdea(userMessage) || extractIdeaTitles(userMessage)[0] || "the tested workflow";
  return `Role Type: ${profile.roleType}
Job Posting Phrase: ${profile.jobPhrase}

Employability Statement:
"I translated an ambiguous stakeholder challenge into a one-week pilot for ${idea}, set baseline and target metrics, and produced evidence that improved decision quality, workflow clarity, and ${profile.employerSignals[0] || "continuous improvement"}."

Alignment: This work demonstrates the kind of structured problem-solving employers ask for when they want people who can move from ambiguity to action. It also maps directly to ${joinWithAnd(profile.employerSignals)} because the result is tied to a real pilot, a measurable outcome, and a visible decision.`;
}

function generateFred(profile) {
  return `WORKING BRIEF:
Problem: ${profile.challenge}. The immediate task is to improve clarity, ownership, and measurable follow-through for ${profile.primaryStakeholder} while respecting ${profile.constraints}.
Audience: ${profile.audience}
Success looks like: ${profile.success}
Output format: Action plan with milestones, risks, and one near-term pilot

AGENT ASSIGNMENTS:
Velma → Which baseline evidence is missing, and how do we define the minimum proof leadership would trust?
Daphne → Where will this fit or fail given actual handoffs, incentives, and workload?
Shaggy & Scooby → Which parts feel obvious to real people, and which parts still sound like framework language?

WORKFLOW ORDER:
1. Velma gathers evidence
2. Daphne applies real-world context
3. Shaggy & Scooby check for user clarity
4. Fred assembles the final output

FRED'S WATCH-OUT: The biggest risk is mistaking a broad aspiration for a testable operational move when the real question is "${profile.executiveQuestions[0].replace(/\?$/, "")}"${revisionTail(profile)}.`;
}

function generateVelma(profile) {
  return `KEY INSIGHTS:
• The prompt points to ${profile.stakeholders.length} immediate stakeholder group(s): ${profile.audience}, which means the team should measure the handoff rather than the whole ecosystem.
• The strongest local evidence pattern is ${profile.leveragePoints[0].toLowerCase()}
• No verified baseline is provided in the prompt, so the first evidence task is to define the current state before making claims about improvement.

SUPPORTING EVIDENCE:
STAT: Demo design rule: 1 owner, 1 audience segment, 2 metrics, 1 short cycle.
URL: ${DEMO_SOURCE_URL}
Confidence: INFERRED
Note: This is the local engine's minimum standard for a credible pilot.

STAT: Working evidence pattern: 3 recurring failure modes appear in this domain - ${profile.risks.slice(0, 3).join("; ")}.
URL: ${DEMO_SOURCE_URL}
Confidence: INFERRED
Note: These are domain heuristics embedded in the local knowledge base, not external research claims.

STAT: Minimum viable validation still uses 2 metric families: ${joinWithAnd(profile.metrics.slice(0, 2))}.
URL: ${DEMO_SOURCE_URL}
Confidence: INFERRED
Note: The local engine favors one behavior metric and one outcome metric to keep the signal interpretable.

IMPORTANT CONSTRAINTS: This run uses a local demo engine. It does not fetch external research, so all evidence claims should be verified before executive use.

UNANSWERED QUESTIONS: What is the current baseline? Which segment feels the problem most acutely? What threshold would make leadership comfortable scaling or stopping?`;
}

function generateDaphne(profile) {
  return `REAL-WORLD IMPLICATIONS:
• ${profile.leveragePoints[0]}
• The fastest gains will come from simplifying one visible handoff, not from redesigning the whole ecosystem at once.
• Leadership will trust this more if the pilot fits existing routines, decision cycles, and reporting cadences.

CONTEXTUAL RISKS:
• ${profile.risks[0]}
• If the pilot segment is chosen poorly, the result will be dismissed as unrepresentative rather than informative.

SITUATIONAL OPPORTUNITIES:
• A short pilot makes it easier to get permission because the ask is bounded, reversible, and evidence-seeking.
• The challenge is concrete enough to generate visible proof quickly if the owner, segment, and threshold are named upfront.

SCENARIO: In a real WGU environment, this gains traction when one program lead and one frontline team agree to test a simpler workflow for a week and treat it as a replacement rather than an addition. It hits friction when too many stakeholders try to fix the whole system at once, or when the pilot lacks a clear decision sponsor.

RECOMMENDED ADJUSTMENTS: Narrow the pilot to one audience segment and one owner, define the exact moment where clarity or decision quality should improve, and pre-commit to the keep, revise, or stop threshold.`;
}

function generateShaggy(profile) {
  return `WHAT WORKS:
• A short pilot is something real people can understand and tolerate.
• Focusing on one clear owner makes the plan feel believable instead of performative.

WHAT'S CONFUSING:
• If the team says "improve the experience" without naming the exact step, people will not know what changed.
• If the outcome measure sounds like reporting homework instead of a fast reality check, people will stop caring.

WHAT COULD BE SIMPLER:
• Turn the goal into one sentence a student or staff member could repeat back immediately: what changes, for whom, and what happens next.
• Keep the check-in to one quick question tied to the actual decision or action, not a long survey.

REALITY CHECK: Real people will try this if it obviously saves time, reduces uncertainty, or makes the next step easier. They will ignore it if it sounds like another abstract framework layered on top of a messy workflow.

SHAGGY & SCOOBY'S VERDICT: LIKE TOTALLY WORKS - as long as the team keeps it concrete, short, and visibly useful in the moment that currently feels shaky.`;
}

function generateFredFinal(profile, userMessage) {
  const idea = extractIdeaTitles(userMessage)[0] || "the simplified pilot";
  return `FRED'S SUMMARY:
The team converged on a narrow, testable move rather than a broad redesign. The clearest recommendation is to pilot ${idea} for one week, measure ${profile.metricBlueprint.participationLabel.toLowerCase()} and ${profile.metricBlueprint.outcomeLabel.toLowerCase()}, and use that evidence to decide whether the approach deserves scale. The real advantage is not complexity; it is visible proof inside current constraints.

KEY FINDINGS BY AGENT:
Velma (Research): The main evidence gap is the missing baseline, so the first job is to define the current state and the threshold that would justify continuation.
Daphne (Context): This will work best when one owner protects a small pilot lane and treats simplification as a replacement, not an add-on.
Shaggy & Scooby (Users): The idea becomes usable when the workflow is concrete, the language is plain, and the check-in feels lightweight enough to survive real work.

RECOMMENDATION:
Run a one-week pilot of ${idea} with one audience segment, one owner, and two visible metrics.

MILESTONES:
1. Pilot Setup | Owner: ${profile.owner} | Deadline: 2 business days
   Deliverable: Pilot brief with target segment, workflow change, and metric definitions
   Success Metric: Stakeholders agree on a single owner and one tested workflow

2. Live Pilot | Owner: Frontline team | Deadline: 1 week
   Deliverable: Daily participation and clarity log
   Success Metric: 12 completed uses and 80% positive clarity responses

3. Decision Review | Owner: Leadership sponsor | Deadline: 2 days after pilot
   Deliverable: One-page decision memo with keep, revise, or stop recommendation
   Success Metric: Leadership chooses a next step based on evidence, not opinion

RISKS TO FLAG:
• Scope drift turns the pilot into a redesign project.
• Weak baseline data makes improvement impossible to prove.

NEXT STEP: ${profile.owner} drafts the pilot brief this week and launches the test in the next available operating cycle.`;
}

function generateTony(profile) {
  return `Selected Perspective: Tony Stark

Stark's Take:
You're treating ${profile.focusArea} like it needs a committee when it really needs a working prototype. Build the smallest visible fix first${revisionTail(profile, "while accounting for")} and let the results embarrass the slow thinkers. ${profile.leveragePoints[0]}

What to Build Right Now:
Create a one-screen or one-page version of the workflow that removes the messiest handoff, names the owner, and puts the next action in plain view.

The Shortcut Nobody's Seeing:
You do not need a better presentation; you need a tighter decision point. Shrink the problem to the one moment where people stall, instrument that moment, and let the exception cases show you where the design is lying.

Rapid Test:
Run it with one segment for 48 hours, count completions, and ask one question tied to the actual move: "Was the next step obvious enough to act on immediately?"`;
}

function generateSteve(profile) {
  return `Selected Perspective: Steve Rogers

Rogers' Take:
The right move is the one that helps ${profile.primaryStakeholder} most clearly, not the one that sounds most strategic in a meeting. If the team cannot explain who benefits, who carries the burden, and how success will be judged, it is not ready yet.

The Right Thing to Do:
Choose the smallest change that makes the experience fairer, clearer, and easier to trust.

Who This Actually Affects:
This affects ${profile.audience}. The people most likely to get overlooked are the ones already carrying the most confusion or the least time.

Leadership Move:
Name one owner, protect the pilot from scope creep, and commit to learning from the result instead of defending the original plan. That is what responsible leadership looks like under real constraints.`;
}

function generateBruce(profile) {
  return `Selected Perspective: Bruce Banner

Banner's Take:
We have a plausible hypothesis, not proof. Before we scale anything, we should make sure the signal we think we are seeing is actually tied to the workflow change and not to noise.

What the Evidence Says:
What we know is mostly structural: there is a challenge, there are affected stakeholders, and there is no verified baseline yet. The first scientific move is to define the current state, test one change at a time, and avoid mixing multiple interventions before the team understands the signal.

Variables to Watch:
1. Whether the pilot segment is representative
2. Whether staff have enough capacity to execute the change consistently
3. Whether the chosen metric actually reflects the outcome leadership cares about

The Assumption to Test First:
The biggest assumption is that clarity is the primary constraint. If the real bottleneck is policy, timing, staffing, or incentive misalignment, the intervention will look weaker than it actually is.`;
}

function generateNatasha(profile) {
  return `Selected Perspective: Natasha Romanoff

Romanoff's Take:
The surface problem is ${profile.focusArea}. The real problem is that nobody wants to own the moment where the experience gets messy.

What's Really Going On:
People are probably talking about strategy because strategy is safer than naming the handoff that is actually failing. Hidden constraint: this only moves if one person is accountable for the awkward middle and someone senior protects that person from scope creep.

The Leverage Point:
Find the smallest operational move that changes what a real person sees or hears next, then make that the pilot.

Execution Reality:
One sponsor clears space, one owner runs the test, and the frontline team uses the revised script or workflow for a week. Success looks like fewer stalls, faster decisions, less ambiguity in the handoff, and a decision threshold leadership will actually honor.`;
}

function generateThor(profile) {
  return `Selected Perspective: Thor

Thor's Take:
This is not merely a workflow issue; it is a moment of hesitation where confidence must be restored. If the path is cloudy, your people will not charge forward no matter how noble the goal.

The Larger Story:
At scale, this is about whether WGU can turn uncertainty into momentum without waiting for perfect conditions. Great systems are forged when teams learn to act boldly with evidence instead of hiding behind abstraction.

The Legendary Move:
Declare a short, visible pilot, strip the process to its essentials, and prove the better path in public so hesitation loses its power.

The Battle Cry:
Make the next step so clear that hesitation has nowhere left to hide.`;
}

function generateDecisionMemo(profile, userMessage) {
  const idea = extractIdeaTitles(userMessage)[0] || "Clear-Start Script";
  return `DECISION MEMO

Subject: ${profile.challengeLabel} - 7-Day Pilot Recommendation

Context: ${profile.challenge}. The immediate need is to show whether a smaller, clearer workflow change can improve outcomes without adding cost or complexity, and whether the real bottleneck is clarity, ownership, or sequence.

Recommendation: Pilot ${idea} with one audience segment, one owner, and two visible measures before scaling anything broader.

Rationale: The strongest pattern across the stack is that the problem is too broad until it is narrowed to a single operational moment. A one-week test creates usable evidence faster than a large redesign, fits ${profile.constraints}, and answers the leadership question "${profile.executiveQuestions[1].replace(/\?$/, "")}".

Micro-Test: Track ${profile.metricBlueprint.participationLabel.toLowerCase()} and ${profile.metricBlueprint.outcomeLabel.toLowerCase()} for one week, review midweek, and decide whether the workflow should be kept, revised, or stopped.

Risks: Scope creep will dilute the signal, missing baseline data will make success hard to prove, and a weak owner will make the workflow look worse than it is.

Next Step: ${profile.owner} drafts the pilot brief in the next 2 business days and launches the test in the next available week.`;
}

function generatePerspectiveReport(profile) {
  return `PERSPECTIVE REPORT

Subject: ${profile.challengeLabel} Needs A Smaller First Move

The Surprise: The most useful answer is not a bigger strategy. It is a narrower prototype that makes the next action obvious, owned, and measurable.

Where They Agreed: Stark, Banner, and Romanoff all converge on the same core move: shrink the problem to one operational moment, assign ownership, and test it fast. Rogers agrees on the need for clarity and accountability, even if he frames it as responsibility rather than leverage.

Where They Disagreed: Rogers and Thor emphasize values and narrative, while Stark and Romanoff push speed and leverage. Banner slows the group down by insisting on a real baseline. That tension reveals the real job: move quickly without losing trust, measurement discipline, or moral clarity.

The Move: Launch one short pilot that changes the most painful handoff, instrument it immediately, and pre-commit to the keep, revise, or stop threshold.

The Frame: Treat this challenge as a proof problem first and a scale problem second.`;
}

function generateActionPlan(profile, userMessage) {
  const idea = extractIdeaTitles(userMessage)[0] || "the simplified pilot";
  return `ACTION PLAN

Title: ${profile.challengeLabel} Pilot Plan
Goal: Produce visible evidence that a smaller workflow change can improve ${profile.success}.

Executive Summary: The clearest path is to test one narrow operational change before redesigning anything broader. The team should run a one-week pilot of ${idea}, measure participation and clarity, and use that evidence to decide whether to scale, revise, or stop. This keeps the work inside current constraints while giving leadership a concrete basis for the next decision.

What the Team Found:
• Velma (Research): The baseline is missing, so the first proof requirement is a clean before-and-after comparison tied to one behavior metric and one outcome metric.
• Daphne (Context): The pilot will work only if one owner protects a small lane, keeps the move reversible, and treats the change as a replacement, not an add-on.
• Shaggy & Scooby (Users): The experience must be plain-language, short, and easy to explain or real people will not adopt it in the moment that matters.

Recommendation: Run a one-week pilot of ${idea} with one owner, one segment, and two metrics.

Milestones:
1. Define Pilot | Owner: ${profile.owner} | Deadline: 2 business days
   Deliverable: Pilot brief, target segment, success metrics
   Success Metric: Stakeholders approve one owner and one testable workflow

2. Launch And Track | Owner: Frontline team | Deadline: 1 week
   Deliverable: Daily log of participation and clarity feedback
   Success Metric: 12 completed uses and 80% positive clarity responses

3. Decide Next Move | Owner: Leadership sponsor | Deadline: 2 days after pilot
   Deliverable: Keep, revise, or stop memo
   Success Metric: One evidence-based decision is made and assigned

Risks:
• Scope creep will make the signal noisy.
• Weak owner accountability will make the pilot look less effective than it is.

Next Step: ${profile.owner} writes the pilot brief and confirms the test audience this week.`;
}

function buildLocalResponse(systemPrompt, userMessage) {
  const revisionRequest = extractRevisionRequest(userMessage);
  const profile = buildProfile(extractChallenge(userMessage), revisionRequest);

  if (systemPrompt.includes("Reframer Agent")) return generateReframer(profile);
  if (systemPrompt.includes("Divergence Agent")) return generateDivergence(profile);
  if (systemPrompt.includes("Contrarian Agent")) return generateContrarian(profile, userMessage);
  if (systemPrompt.includes("Measurement Agent")) return generateMeasurement(profile, userMessage);
  if (systemPrompt.includes("Translator Agent")) return generateTranslator(profile, userMessage);
  if (systemPrompt.includes("Fred, the Project Manager and Organizer")) return generateFred(profile);
  if (systemPrompt.includes("Velma, the Research and Analysis agent")) return generateVelma(profile);
  if (systemPrompt.includes("Daphne, the Field Insight and Contextual Awareness agent")) return generateDaphne(profile);
  if (systemPrompt.includes("Shaggy and Scooby, the User Perspective")) return generateShaggy(profile);
  if (systemPrompt.includes("Fred, completing your role as Project Manager")) return generateFredFinal(profile, userMessage);
  if (systemPrompt.includes("Tony Stark")) return generateTony(profile);
  if (systemPrompt.includes("Steve Rogers")) return generateSteve(profile);
  if (systemPrompt.includes("Bruce Banner")) return generateBruce(profile);
  if (systemPrompt.includes("Natasha Romanoff")) return generateNatasha(profile);
  if (systemPrompt.includes("Thor")) return generateThor(profile);
  if (userMessage.includes("DECISION MEMO")) return generateDecisionMemo(profile, userMessage);
  if (userMessage.includes("PERSPECTIVE REPORT")) return generatePerspectiveReport(profile, userMessage);
  if (userMessage.includes("ACTION PLAN")) return generateActionPlan(profile, userMessage);

  return `SUMMARY:
Local demo mode generated a placeholder response for ${profile.challengeLabel}. Refine the challenge statement or update the built-in generator if you need a more specific format.`;
}

async function runLocalEngine(systemPrompt, userMessage, retries = 1) {
  try {
    await wait(220 + Math.floor(Math.random() * 240));
    const text = buildLocalResponse(systemPrompt, userMessage);
    if (!text) {
      return { text: null, error: `Local engine produced no output after ${retries} attempt.` };
    }
    return { text, error: null };
  } catch (error) {
    return { text: null, error: `Local engine error: ${error.message}` };
  }
}

// ─── NATURAL LANGUAGE RENDERER ────────────────────────────────────────────────

function NaturalOutput({ text, color }) {
  if (!text) return null;

  const lines = text.split("\n");
  const sections = [];
  let currentSection = null;
  let buffer = [];

  const flushBuffer = () => {
    if (currentSection !== null) {
      sections.push({ heading: currentSection, body: buffer.join("\n").trim() });
    } else if (buffer.join("").trim()) {
      sections.push({ heading: null, body: buffer.join("\n").trim() });
    }
    buffer = [];
  };

  const headingPattern = /^([A-Z][A-Z\s\-\/0-9:·]+):\s*(.*)/;
  const numberedPattern = /^((?:IDEA|FRAMING|MILESTONE|SLIDE)\s+\d+[:.]\s*)(.*)/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) { buffer.push(""); continue; }

    const numberedMatch = trimmed.match(numberedPattern);
    const headingMatch = !numberedMatch && trimmed.match(headingPattern);

    if (numberedMatch) {
      flushBuffer();
      const label = numberedMatch[1].trim();
      const rest = numberedMatch[2].trim();
      currentSection = rest ? `${label} ${rest}` : label;
    } else if (headingMatch && headingMatch[1].length < 60) {
      flushBuffer();
      currentSection = headingMatch[1].trim();
      if (headingMatch[2].trim()) buffer.push(headingMatch[2].trim());
    } else {
      buffer.push(trimmed);
    }
  }
  flushBuffer();

  const verdictColor = (t = "") => {
    const u = t.toUpperCase();
    if (u.includes("KEEP") || u.includes("PASS")) return "#4CAF50";
    if (u.includes("CUT") || u.includes("FAIL")) return "#E88E8E";
    if (u.includes("REVISE") || u.includes("FLAG")) return "#E8C06E";
    return "#1F2937";
  };

  const renderBody = (body) => {
    if (!body) return null;
    return body.split("\n").map((line, i) => {
      if (!line.trim()) return <div key={i} style={{ height: 6 }} />;

      if (line.startsWith("•") || line.startsWith("-")) {
        return (
          <div key={i} style={{ display: "flex", gap: 7, marginBottom: 4 }}>
            <span style={{ color, fontSize: 15, marginTop: 2, flexShrink: 0 }}>•</span>
            <span style={{ fontSize: 17, lineHeight: 1.65, color: "#111827", fontWeight: 500 }}>{line.replace(/^[•\-]\s*/, "")}</span>
          </div>
        );
      }

      // STAT: lines — highlight the stat value
      if (line.toUpperCase().startsWith("STAT:")) {
        const statVal = line.replace(/^STAT:\s*/i, "");
        return (
          <div key={i} style={{ display: "flex", gap: 7, marginBottom: 6, alignItems: "flex-start" }}>
            <span style={{ fontSize: 14, fontFamily: "monospace", color: "#92400E", letterSpacing: 1, flexShrink: 0, background: "#FEF3C7", padding: "2px 6px", borderRadius: 3 }}>STAT</span>
            <span style={{ fontSize: 17, lineHeight: 1.65, color: "#111827", fontWeight: 400, fontWeight: 500 }}>{statVal}</span>
          </div>
        );
      }

      const inlineMatch = line.match(/^([A-Za-z][A-Za-z\s\/\-]+):\s+(.+)/);
      if (inlineMatch && inlineMatch[1].length < 32) {
        const key2 = inlineMatch[1].trim().toUpperCase();
        const val = inlineMatch[2];
        const isVerdict = /verdict/i.test(key2);
        const isUrl = key2 === "URL" && val.startsWith("http");
        const isConfidence = key2 === "CONFIDENCE";
        const isDomainStatus = key2 === "DOMAIN STATUS";
        const isStatPlaus = key2 === "STAT PLAUSIBILITY";

        if (isUrl) {
          const domain = (() => { try { return new URL(val).hostname; } catch { return val; } })();
          return (
            <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, fontFamily: "monospace", color: "#111827", letterSpacing: 0.5, flexShrink: 0 }}>URL:</span>
              <a href={val} target="_blank" rel="noopener noreferrer" style={{
                fontSize: 16, color: "#1D4ED8", textDecoration: "none", fontWeight: 600,
                background: "#EBF4FF", border: "1px solid #93C5FD",
                borderRadius: 3, padding: "2px 8px", fontFamily: "monospace",
                display: "inline-flex", alignItems: "center", gap: 5
              }}>
                <span>↗</span> {domain}
              </a>
            </div>
          );
        }

        const confidenceColor = (v) => {
          const u = (v || "").toUpperCase();
          if (u.includes("VERIFIED") || u.includes("CREDIBLE") || u.includes("PLAUSIBLE")) return "#4CAF50";
          if (u.includes("INFERRED") || u.includes("QUESTIONABLE")) return "#E8C06E";
          if (u.includes("SUSPECT") || u.includes("UNKNOWN")) return "#E88E8E";
          return "#1F2937";
        };

        if (isConfidence || isDomainStatus || isStatPlaus) {
          return (
            <div key={i} style={{ display: "flex", gap: 6, marginBottom: 5, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, fontFamily: "monospace", color: "#111827", letterSpacing: 0.5, flexShrink: 0 }}>{key2}:</span>
              <span style={{
                fontSize: 14, fontFamily: "monospace", letterSpacing: 1,
                background: confidenceColor(val) + "18", color: confidenceColor(val), fontWeight: 600,
                padding: "2px 8px", borderRadius: 3
              }}>{val}</span>
            </div>
          );
        }

        return (
          <div key={i} style={{ display: "flex", gap: 6, marginBottom: 5, flexWrap: "wrap", alignItems: "flex-start" }}>
            <span style={{ fontSize: 14, fontFamily: "monospace", color: "#1E293B", letterSpacing: 0.5, paddingTop: 3, flexShrink: 0, fontWeight: 600 }}>
              {key2}:
            </span>
            {isVerdict ? (
              <span style={{
                fontSize: 14, fontFamily: "monospace", letterSpacing: 1,
                background: verdictColor(val) + "18", color: verdictColor(val), fontWeight: 600,
                padding: "2px 8px", borderRadius: 3
              }}>{val}</span>
            ) : (
              <span style={{ fontSize: 17, lineHeight: 1.65, color: "#111827", fontWeight: 500, flex: 1 }}>{val}</span>
            )}
          </div>
        );
      }

      if (line.startsWith('"') || line.endsWith('"')) {
        return (
          <div key={i} style={{
            fontSize: 17, color: "#111827", fontStyle: "italic", fontWeight: 500,
            lineHeight: 1.75, margin: "8px 0 6px",
            paddingLeft: 12, borderLeft: `2px solid ${color}`
          }}>{line}</div>
        );
      }

      if (line.includes("→")) {
        const [before, after] = line.split("→");
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, fontSize: 17 }}>
            <span style={{ color: "#111827" }}>{before.trim()}</span>
            <span style={{ color: "#1F2937" }}>→</span>
            <span style={{ color: "#4CAF50" }}>{after?.trim()}</span>
          </div>
        );
      }

      return (
        <div key={i} style={{ fontSize: 17, lineHeight: 1.75, color: "#111827", fontWeight: 400, marginBottom: 4 }}>{line}</div>
      );
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {sections.map((sec, i) => {
        const isSources = sec.heading && /^SOURCES/.test(sec.heading.toUpperCase());
        const isLinkAudit = sec.heading && /^LINK/.test(sec.heading.toUpperCase());
        const accent = isSources ? "#6E9EC8" : isLinkAudit ? "#E8906E" : color;
        return (
          <div key={i} style={{
            background: isSources ? "#EEF5FC" : isLinkAudit ? "#FDF2EC" : "#F0F2F5",
            borderRadius: 5, padding: "10px 13px",
            borderLeft: sec.heading ? `3px solid ${accent}` : "none",
            border: isSources ? "1px solid #BDD6F0" : isLinkAudit ? "1px solid #F7D4C2" : undefined,
          }}>
            {sec.heading && (
              <div style={{
                fontSize: 14, fontFamily: "monospace", color: accent,
                letterSpacing: 1, marginBottom: sec.body ? 8 : 0, opacity: 0.95,
                display: "flex", alignItems: "center", gap: 6
              }}>
                {isSources && <span style={{ fontSize: 16 }}>↗</span>}
                {isLinkAudit && <span style={{ fontSize: 16 }}>✓</span>}
                {sec.heading.toUpperCase()}
              </div>
            )}
            {renderBody(sec.body)}
          </div>
        );
      })}
    </div>
  );
}

// ─── REVISION PANEL ──────────────────────────────────────────────────────────

function RevisionBadge({ count, color }) {
  if (!count) return null;
  return (
    <span style={{
      fontSize: 15, fontFamily: "monospace", color,
      background: color + "22", border: "1px solid " + color + "44",
      borderRadius: 10, padding: "1px 6px", marginLeft: 4
    }}>↺ {count} revision{count > 1 ? "s" : ""}</span>
  );
}

// ─── AGENT PANEL ──────────────────────────────────────────────────────────────

function AgentPanel({ agent, status, result, expanded, onToggle, revisionCount, isReviseTarget, onRevise }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <div
        onClick={onToggle}
        style={{
          display: "flex", alignItems: "center", gap: 9,
          padding: "12px 16px", background: "#FFFFFF",
          border: `1px solid ${status === "active" ? agent.color : isReviseTarget ? "#7C3AED" : expanded && result ? "#CBD5E1" : "#E2E8F0"}`,
          boxShadow: expanded && result ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
          borderRadius: expanded && result ? "5px 5px 0 0" : 5,
          cursor: "pointer", transition: "border 0.2s"
        }}>
        <span style={{ fontSize: 17, color: agent.color }}>{agent.icon}</span>
        <span style={{ fontSize: 15, fontFamily: "monospace", color: agent.color, fontWeight: 700 }}>
          {agent.num}. {agent.name.toUpperCase()}
        </span>
        <RevisionBadge count={revisionCount} color="#BE8EE8" />
        <span style={{ fontSize: 14, color: "#111827", flex: 1 }}>{agent.tagline}</span>
        {status === "active" && (
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: agent.color, animation: "blink 0.8s infinite" }} />
            <span style={{ fontSize: 15, fontFamily: "monospace", color: agent.color, letterSpacing: 1, fontWeight: 600 }}>WORKING</span>
          </span>
        )}
        {status === "done" && <span style={{ fontSize: 14, color: "#16A34A", fontFamily: "monospace", fontWeight: 700 }}>✓ DONE</span>}
        {status === "error" && <span style={{ fontSize: 14, color: "#DC2626", fontFamily: "monospace", fontWeight: 700 }}>! ERROR</span>}
        {result && status === "done" && (
          <span
            onClick={e => { e.stopPropagation(); onRevise(); }}
            title="Revise this agent"
            style={{
              fontSize: 15, fontFamily: "monospace", color: isReviseTarget ? "#7C3AED" : "#1E293B",
              background: isReviseTarget ? "#EDE9FE" : "transparent",
              border: `1px solid ${isReviseTarget ? "#7C3AED" : "#CBD5E1"}`,
              borderRadius: 3, padding: "2px 7px", cursor: "pointer",
              transition: "all 0.15s"
            }}>
            ↺ REVISE
          </span>
        )}
        {result && <span style={{ fontSize: 15, color: "#1E293B", marginLeft: 2 }}>{expanded ? "▲" : "▼"}</span>}
      </div>
      {expanded && result && (
        <div style={{
          padding: "14px 16px", background: "#F8F9FB",
          border: "1px solid #E2E8F0", borderTop: "none",
          borderRadius: "0 0 5px 5px"
        }}>
          {result.error ? (
            <div>
              <div style={{ fontSize: 14, fontFamily: "monospace", color: "#E88E8E", marginBottom: 8 }}>ERROR</div>
              <div style={{ fontSize: 16, color: "#DC2626", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{result.error}</div>
            </div>
          ) : (
            <NaturalOutput text={result.text} color={agent.color} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

function AgentStackDemo() {
  const [activeStack, setActiveStack] = useState("creativity-stack");
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [runningAgent, setRunningAgent] = useState(null);
  const [input, setInput] = useState("");
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState({ "creativity-stack": {}, "avengers-stack": {}, "scooby-stack": {} });
  const [statuses, setStatuses] = useState({ "creativity-stack": {}, "avengers-stack": {}, "scooby-stack": {} });
  const [finalOutputs, setFinalOutputs] = useState({ "creativity-stack": null, "avengers-stack": null, "scooby-stack": null });
  const [expanded, setExpanded] = useState(null);
  const [log, setLog] = useState([]);
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const addLog = (msg, color = "#111827") =>
    setLog(p => [...p, { msg, color, ts: new Date().toLocaleTimeString() }]);

  const stack = STACKS[activeStack];
  const hasResults = Object.values(results[activeStack]).length > 0 || finalOutputs[activeStack];
  const canRun = Boolean(input.trim()) && !running;

  async function runFullStack() {
    if (!input.trim()) return;
    setRunning(true);
    const sid = activeStack;
    const st = STACKS[sid];
    setResults(p => ({ ...p, [sid]: {} }));
    setStatuses(p => ({ ...p, [sid]: {} }));
    setFinalOutputs(p => ({ ...p, [sid]: null }));
    setLog([]);
    addLog(`${st.label} initiated in ${LOCAL_ENGINE_NAME}`, st.color);

    const agentTexts = {};
    for (const agent of st.agents) {
      setStatuses(p => ({ ...p, [sid]: { ...p[sid], [agent.id]: "active" } }));
      setRunningAgent(agent.id);
      addLog(`[${agent.num}] ${agent.name} thinking...`, agent.color);

      const priorContext = Object.entries(agentTexts)
        .map(([aid, txt]) => {
          const a = st.agents.find(x => x.id === aid);
          return `--- ${a?.name || aid} ---\n${txt}`;
        }).join("\n\n");

      const userMsg = priorContext
        ? `Challenge/Goal: ${input}\n\nPrevious agent outputs:\n${priorContext}`
        : `Challenge/Goal: ${input}`;

      const res = await runLocalEngine(agent.systemPrompt, userMsg);
      if (!res.error) agentTexts[agent.id] = res.text;

      setResults(p => ({ ...p, [sid]: { ...p[sid], [agent.id]: res } }));
      setStatuses(p => ({ ...p, [sid]: { ...p[sid], [agent.id]: res.error ? "error" : "done" } }));
      setExpanded(`${sid}-${agent.id}`);
      addLog(`✓ ${agent.name} complete`, res.error ? "#E88E8E" : "#4CAF50");
    }

    addLog(`Generating ${st.outputType}...`, st.color);
    const outputsText = st.agents
      .map(a => `[${a.name}]\n${agentTexts[a.id] || "(no output)"}`)
      .join("\n\n---\n\n");

    const finalRes = await runLocalEngine(
      "You are a synthesis agent for Dr. A.J. Merlino's Creative Impact Programs at WGU. Write in clear, direct prose for executive leadership and accreditors.",
      st.buildFinalPrompt(input, outputsText)
    );

    setFinalOutputs(p => ({ ...p, [sid]: finalRes }));
    setExpanded(`${sid}-final`);
    addLog(`${st.outputType} complete.`, st.color);
    setRunningAgent(null);
    setRunning(false);
  }

  async function runSingleAgent(stackId, agentId) {
    if (!input.trim()) return;
    const agent = STACKS[stackId].agents.find(a => a.id === agentId);
    if (!agent) return;
    setRunning(true);
    setRunningAgent(agentId);
    setStatuses(p => ({ ...p, [stackId]: { ...p[stackId], [agentId]: "active" } }));
    addLog(`Invoking ${agent.name}...`, agent.color);

    const res = await runLocalEngine(agent.systemPrompt, `Challenge/Goal: ${input}`);
    setResults(p => ({ ...p, [stackId]: { ...p[stackId], [agentId]: res } }));
    setStatuses(p => ({ ...p, [stackId]: { ...p[stackId], [agentId]: res.error ? "error" : "done" } }));
    setExpanded(`${stackId}-${agentId}`);
    addLog(`✓ ${agent.name} complete`, res.error ? "#E88E8E" : "#4CAF50");
    setRunningAgent(null);
    setRunning(false);
  }

  function clearAll() {
    setResults({ "creativity-stack": {}, "avengers-stack": {}, "scooby-stack": {} });
    setStatuses({ "creativity-stack": {}, "avengers-stack": {}, "scooby-stack": {} });
    setFinalOutputs({ "creativity-stack": null, "avengers-stack": null, "scooby-stack": null });
    setRevisions({ "creativity-stack": {}, "avengers-stack": {}, "scooby-stack": {} });
    setFinalRevisions({ "creativity-stack": [], "avengers-stack": [], "scooby-stack": [] });
    setReviseTarget(null);
    setReviseInput("");
    setSelectedAgent(null);
    setLog([]);
    setExpanded(null);
  }

  async function runRevision() {
    if (!reviseInput.trim() || !reviseTarget || revising) return;
    setRevising(true);
    const sid = activeStack;
    const st = STACKS[sid];

    // Build full context: original input + all agent outputs so far
    const allAgentContext = st.agents
      .map(a => {
        const r = results[sid][a.id];
        return r && !r.error ? `[${a.name}]\n${r.text}` : null;
      }).filter(Boolean).join("\n\n---\n\n");

    const fo = finalOutputs[sid];
    const finalContext = fo && !fo.error ? `\n\n[${st.outputType}]\n${fo.text}` : "";

    if (reviseTarget.type === "agent") {
      const agent = st.agents.find(a => a.id === reviseTarget.agentId);
      if (!agent) { setRevising(false); return; }

      const currentOutput = results[sid][agent.id]?.text || "";
      const sysPrompt = agent.systemPrompt + "\n\nYou are in REVISION MODE. The user has reviewed your output and has specific feedback. Produce a revised version of your full output incorporating their request. Maintain your original format and quality gates.";
      const userMsg = `Original challenge: ${input}\n\nAll agent context so far:\n${allAgentContext}\n\nYour previous output:\n${currentOutput}\n\nRevision request: ${reviseInput.trim()}`;

      const res = await runLocalEngine(sysPrompt, userMsg);

      // Track revision history
      setRevisions(prev => ({
        ...prev,
        [sid]: {
          ...prev[sid],
          [agent.id]: [...(prev[sid][agent.id] || []), { request: reviseInput.trim(), previous: currentOutput, ts: new Date().toLocaleTimeString() }]
        }
      }));
      setResults(p => ({ ...p, [sid]: { ...p[sid], [agent.id]: res } }));
      setStatuses(p => ({ ...p, [sid]: { ...p[sid], [agent.id]: res.error ? "error" : "done" } }));
      setExpanded(`${sid}-${agent.id}`);
      addLog(`↺ ${agent.name} revised`, res.error ? "#E88E8E" : "#BE8EE8");

    } else if (reviseTarget.type === "final") {
      const currentFinal = finalOutputs[sid]?.text || "";
      const sysPrompt = "You are a synthesis agent for Dr. A.J. Merlino's Creative Impact Programs at WGU. You are in REVISION MODE. The user has reviewed the " + st.outputType + " and has specific feedback. Produce a fully revised version incorporating their request. Maintain the same format and executive-level quality.";
      const userMsg = `Original challenge: ${input}\n\nAgent outputs:\n${allAgentContext}\n\nCurrent ${st.outputType}:\n${currentFinal}\n\nRevision request: ${reviseInput.trim()}`;

      const res = await runLocalEngine(sysPrompt, userMsg);

      setFinalRevisions(prev => ({
        ...prev,
        [sid]: [...(prev[sid] || []), { request: reviseInput.trim(), previous: currentFinal, ts: new Date().toLocaleTimeString() }]
      }));
      setFinalOutputs(p => ({ ...p, [sid]: res }));
      setExpanded(`${sid}-final`);
      addLog(`↺ ${st.outputType} revised`, res.error ? "#E88E8E" : "#BE8EE8");

    } else if (reviseTarget.type === "stack") {
      // Re-run the full stack with the revision note appended
      setRevising(false);
      const revisedInput = input + "\n\n[REVISION NOTE FROM DR. MERLINO]: " + reviseInput.trim();
      setInput(revisedInput);
      setTimeout(() => runFullStack(), 100);
      setReviseInput("");
      setReviseTarget(null);
      return;
    }

    setReviseInput("");
    setRevising(false);
  }

  const [exporting, setExporting] = useState(false);
  const [revisions, setRevisions] = useState({ "creativity-stack": {}, "avengers-stack": {}, "scooby-stack": {} });
  const [finalRevisions, setFinalRevisions] = useState({ "creativity-stack": [], "avengers-stack": [], "scooby-stack": [] });
  const [reviseInput, setReviseInput] = useState("");
  const [reviseTarget, setReviseTarget] = useState(null); // { type: "agent"|"final", agentId?: string }
  const [revising, setRevising] = useState(false);
  const reviseRef = useRef(null);

  async function exportToWord() {
    setExporting(true);
    try {
      // Load docx UMD from unpkg — most reliable CDN for this package
      if (!window.docx) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://unpkg.com/docx@8.5.0/build/index.umd.js";
          s.onload = resolve;
          s.onerror = () => reject(new Error("Failed to load docx library"));
          document.head.appendChild(s);
        });
      }

      const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, LevelFormat, BorderStyle } = window.docx;
      const st = STACKS[activeStack];
      const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

      const textToParas = (text) => {
        if (!text) return [new Paragraph({ children: [new TextRun({ text: "", size: 22 })] })];
        const result = [];
        for (const line of text.split("\n")) {
          const t = line.trim();
          if (!t) { result.push(new Paragraph({ children: [new TextRun({ text: "" })] })); continue; }
          if (t.startsWith("•") || t.startsWith("-")) {
            result.push(new Paragraph({
              numbering: { reference: "myBullets", level: 0 },
              children: [new TextRun({ text: t.replace(/^[•-]\s*/, ""), size: 22, font: "Arial" })]
            })); continue;
          }
          const capMatch = t.match(/^([A-Z][A-Z\s\-\/0-9:.]{3,55}):\s*(.*)/);
          if (capMatch && capMatch[1] === capMatch[1].toUpperCase()) {
            result.push(new Paragraph({ children: [
              new TextRun({ text: capMatch[1] + ": ", bold: true, size: 22, font: "Arial", color: "555555" }),
              ...(capMatch[2] ? [new TextRun({ text: capMatch[2], size: 22, font: "Arial" })] : [])
            ]})); continue;
          }
          if (t.startsWith("http")) {
            result.push(new Paragraph({ children: [new TextRun({ text: t, size: 20, font: "Courier New", color: "1155CC" })] })); continue;
          }
          if (t.startsWith('"') && t.endsWith('"')){
            result.push(new Paragraph({
              indent: { left: 720 },
              children: [new TextRun({ text: t, size: 22, font: "Arial", italics: true, color: "444444" })]
            })); continue;
          }
          result.push(new Paragraph({ children: [new TextRun({ text: t, size: 22, font: "Arial" })] }));
        }
        return result;
      };

      const hr = () => new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "E2E8F0" } },
        spacing: { before: 100, after: 100 },
        children: [new TextRun({ text: "" })]
      });

      const children = [];

      // Cover
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: st.label + " Report", font: "Arial", bold: true, color: "111111" })] }));
      children.push(new Paragraph({ children: [
        new TextRun({ text: "WGU  |  Creative Impact Programs  |  Dr. A.J. Merlino", size: 20, font: "Arial", color: "666666" })
      ]}));
      children.push(new Paragraph({ children: [
        new TextRun({ text: "Generated: " + now, size: 18, font: "Arial", color: "999999" })
      ]}));
      children.push(new Paragraph({ children: [new TextRun({ text: "" })] }));

      // Input
      if (input.trim()) {
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_2,
          children: [new TextRun({ text: "Challenge / Goal", font: "Arial", bold: true })] }));
        children.push(new Paragraph({
          indent: { left: 440 },
          border: { left: { style: BorderStyle.SINGLE, size: 8, color: "C8A96E" } },
          spacing: { before: 80, after: 200 },
          children: [new TextRun({ text: input.trim(), size: 22, font: "Arial", italics: true, color: "444444" })]
        }));
        children.push(hr());
      }

      // Agent sections
      for (const agent of st.agents) {
        const res = results[activeStack][agent.id];
        if (!res || res.error) continue;
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 300, after: 80 },
          children: [new TextRun({ text: "Agent " + agent.num + ": " + agent.name + "  —  " + agent.tagline, font: "Arial", bold: true })] }));

        // Revision history for this agent
        const revs = revisions[activeStack]?.[agent.id] || [];
        if (revs.length > 0) {
          children.push(new Paragraph({ children: [
            new TextRun({ text: "Revision history (" + revs.length + " round" + (revs.length > 1 ? "s" : "") + ")", size: 18, font: "Arial", italics: true, color: "888888" })
          ]}));
        }

        children.push(...textToParas(res.text));
        children.push(hr());
      }

      // Final deliverable
      const fo = finalOutputs[activeStack];
      if (fo && !fo.error && fo.text) {
        children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 160 },
          children: [new TextRun({ text: st.outputType, font: "Arial", bold: true, color: "111111" })] }));
        children.push(...textToParas(fo.text));

        // Final revision history
        const finalRevs = finalRevisions[activeStack] || [];
        if (finalRevs.length > 0) {
          children.push(new Paragraph({ spacing: { before: 200 }, children: [
            new TextRun({ text: "This deliverable was revised " + finalRevs.length + " time(s) after initial generation.", size: 18, font: "Arial", italics: true, color: "888888" })
          ]}));
        }
      }

      const doc = new Document({
        numbering: { config: [{ reference: "myBullets", levels: [{
          level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } }
        }]}]},
        styles: {
          default: { document: { run: { font: "Arial", size: 22 } } },
          paragraphStyles: [
            { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
              run: { size: 38, bold: true, font: "Arial", color: "111111" },
              paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 } },
            { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
              run: { size: 26, bold: true, font: "Arial", color: "222222" },
              paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 1 } }
          ]
        },
        sections: [{ properties: { page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }}, children }]
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = st.id + "-report-" + Date.now() + ".docx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Export failed: " + err.message);
    } finally {
      setExporting(false);
    }
  }

  const selAgent = selectedAgent
    ? STACKS[selectedAgent.stackId]?.agents.find(a => a.id === selectedAgent.agentId)
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "#F4F5F7", color: "#1F2937", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400;1,9..40,500&display=swap');
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.1} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(3px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 2px; }
        textarea:focus, input:focus, button:focus, select:focus { outline: none; }
        textarea, input, select { font-family: inherit; }
        textarea { resize: none; }
        @media (max-width: 960px) {
          .app-shell { grid-template-columns: 1fr !important; }
          .sidebar {
            position: relative !important;
            top: auto !important;
            height: auto !important;
            max-height: none !important;
            border-right: none !important;
            border-bottom: 1px solid #E2E8F0;
          }
          .main-pane { max-height: none !important; padding: 18px !important; }
        }
      `}</style>

      <div className="app-shell" style={{ display: "grid", gridTemplateColumns: "200px 1fr", minHeight: "100vh" }}>

        {/* SIDEBAR */}
        <div className="sidebar" style={{
          background: "#FFFFFF", borderRight: "1px solid #E2E8F0",
          padding: "18px 13px", position: "sticky", top: 0,
          height: "100vh", overflowY: "auto",
          display: "flex", flexDirection: "column", gap: 3
        }}>
          <div style={{ fontSize: 15, fontFamily: "monospace", color: "#334155", letterSpacing: 2, marginBottom: 14 }}>
            WGU / A.J. MERLINO
          </div>

          {Object.values(STACKS).map(st => (
            <div key={st.id} style={{ marginBottom: 13 }}>
              <button
                onClick={() => { setActiveStack(st.id); setSelectedAgent(null); }}
                style={{
                  width: "100%", padding: "8px 10px", textAlign: "left",
                  background: activeStack === st.id && !selectedAgent ? `${st.color}18` : "transparent",
                  border: `1px solid ${activeStack === st.id && !selectedAgent ? st.color : "#E2E8F0"}`,
                  boxShadow: activeStack === st.id && !selectedAgent ? `0 0 0 3px ${st.color}18` : "none",
                  borderRadius: 5,
                  color: activeStack === st.id && !selectedAgent ? st.color : "#1E293B",
                  fontSize: 14, fontFamily: "monospace", letterSpacing: 1, fontWeight: 700,
                  cursor: "pointer", transition: "all 0.2s"
                }}>
                ⟳ {st.id}
              </button>

              <div style={{ fontSize: 15, color: "#111827", fontFamily: "monospace", letterSpacing: 1.5, fontWeight: 700, margin: "8px 0 5px 2px" }}>
                AGENTS
              </div>

              {st.agents.map(agent => {
                const agSt = statuses[st.id][agent.id];
                const isSel = selectedAgent?.stackId === st.id && selectedAgent?.agentId === agent.id;
                const isRun = runningAgent === agent.id;
                return (
                  <button
                    key={agent.id}
                    onClick={() => {
                      setActiveStack(st.id);
                      setSelectedAgent(isSel ? null : { stackId: st.id, agentId: agent.id });
                    }}
                    disabled={running}
                    style={{
                      width: "100%", padding: "5px 8px", textAlign: "left",
                      background: isSel ? `${agent.color}14` : "transparent",
                      border: `1px solid ${isSel ? agent.color : "#ECEEF2"}`,
                      borderRadius: 4,
                      color: isSel ? agent.color : agSt === "done" ? "#111827" : "#1E293B",
                      fontSize: 15, cursor: running ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", gap: 6, fontWeight: 500,
                      marginBottom: 2, transition: "all 0.15s"
                    }}
                    onMouseEnter={e => { if (!running && !isSel) e.currentTarget.style.color = agent.color; }}
                    onMouseLeave={e => { if (!isSel) e.currentTarget.style.color = agSt === "done" ? "#111827" : "#334155"; }}
                  >
                    <span style={{ color: agent.color, fontSize: 16 }}>{agent.icon}</span>
                    <span style={{ fontFamily: "monospace", flex: 1 }}>{agent.num}. {agent.name}</span>
                    {isRun && <span style={{ width: 4, height: 4, borderRadius: "50%", background: agent.color, animation: "blink 0.8s infinite" }} />}
                    {agSt === "done" && !isRun && <span style={{ fontSize: 15, color: "#4CAF50" }}>✓</span>}
                    {isSel && !isRun && <span style={{ fontSize: 15, color: agent.color }}>●</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* MAIN CONTENT */}
        <div className="main-pane" style={{ padding: "24px 32px", overflowY: "auto", maxHeight: "100vh", background: "#F4F5F7" }}>

          {/* Header */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontFamily: "monospace", color: "#334155", letterSpacing: 2, marginBottom: 4 }}>
              CREATIVE IMPACT PROGRAMS
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827", letterSpacing: -0.5 }}>
              {selAgent ? (
                <>
                  <span style={{ color: selAgent.color, fontWeight: 500 }}>{selAgent.icon} {selAgent.name}</span>
                  <span style={{ fontSize: 15, color: "#111827", fontFamily: "monospace", marginLeft: 10 }}>· {selAgent.tagline}</span>
                </>
              ) : (
                <>
                  <span style={{ color: stack.color, fontWeight: 500 }}>{stack.label}</span>
                  <span style={{ fontSize: 15, color: "#111827", fontFamily: "monospace", marginLeft: 10 }}>→ {stack.outputType}</span>
                </>
              )}
            </h1>
            {selectedAgent && (
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 5 }}>
                <span style={{ fontSize: 15, fontFamily: "monospace", color: "#1E293B" }}>SINGLE AGENT MODE</span>
                <button
                  onClick={() => setSelectedAgent(null)}
                  style={{ fontSize: 15, fontFamily: "monospace", color: "#1F2937", background: "transparent", border: "1px solid #222", borderRadius: 3, padding: "2px 7px", cursor: "pointer" }}>
                  ✕ deselect
                </button>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontFamily: "monospace", color: "#111827", letterSpacing: 1, marginBottom: 5 }}>
              ENGINE
            </div>
            <div style={{
              background: "#FFFFFF",
              border: "1px solid #BBF7D0",
              borderRadius: 5,
              padding: "12px"
            }}>
              <div style={{
                fontSize: 15,
                fontFamily: "monospace",
                color: "#166534",
                fontWeight: 700,
                letterSpacing: 1
              }}>
                ENRICHED LOCAL DEMO MODE · NO API KEY REQUIRED
              </div>
              <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, marginTop: 6 }}>
                Outputs are generated locally from built-in domain knowledge, agent heuristics, and your prompt. Use this mode for demos, structure reviews, and storyboard iterations rather than verified research.
              </div>
            </div>
          </div>

          {/* Input */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontFamily: "monospace", color: "#111827", letterSpacing: 1, marginBottom: 5 }}>
              INPUT / CHALLENGE
            </div>
            <textarea
              rows={3}
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={running}
              placeholder="Describe the challenge or goal..."
              style={{
                width: "100%", padding: "10px 12px",
                background: "#FFFFFF", border: "1px solid #E2E8F0",
                borderRadius: 5, color: "#111827", fontSize: 17,
                lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif"
              }}
            />
            <div style={{ display: "flex", gap: 7, marginTop: 7, alignItems: "center", flexWrap: "wrap" }}>
              {!selectedAgent && (
                <button
                  onClick={runFullStack}
                  disabled={!canRun}
                  style={{
                    padding: "7px 18px",
                    background: canRun ? stack.color : "#181818",
                    border: "none", borderRadius: 4,
                    color: canRun ? "#F4F5F7" : "#334155",
                    fontSize: 15, fontFamily: "monospace", letterSpacing: 1, fontWeight: 700,
                    cursor: canRun ? "pointer" : "not-allowed",
                    transition: "all 0.2s"
                  }}>
                  {running ? "RUNNING..." : `RUN ${stack.id.toUpperCase()}`}
                </button>
              )}
              {selectedAgent && selAgent && (
                <button
                  onClick={() => runSingleAgent(selectedAgent.stackId, selectedAgent.agentId)}
                  disabled={!canRun}
                  style={{
                    padding: "7px 18px",
                    background: canRun ? selAgent.color : "#181818",
                    border: "none", borderRadius: 4,
                    color: canRun ? "#F4F5F7" : "#334155",
                    fontSize: 15, fontFamily: "monospace", letterSpacing: 1, fontWeight: 700,
                    cursor: canRun ? "pointer" : "not-allowed",
                    transition: "all 0.2s"
                  }}>
                  {running ? "RUNNING..." : `INVOKE ${selAgent.name.toUpperCase()}`}
                </button>
              )}
              {hasResults && !running && (
                <>
                  <button
                    onClick={clearAll}
                    style={{
                      padding: "7px 13px", background: "transparent",
                      border: "1px solid #E2E8F0", borderRadius: 4,
                      color: "#111827", fontSize: 14,
                      fontFamily: "monospace", cursor: "pointer"
                    }}>
                    CLEAR
                  </button>
                  <button
                    onClick={exportToWord}
                    disabled={exporting}
                    style={{
                      padding: "7px 15px", background: "transparent",
                      border: `1px solid ${exporting ? "#111827" : "#C3E6C3"}`, borderRadius: 4,
                      color: exporting ? "#1F2937" : "#16A34A", fontSize: 15, fontWeight: 700,
                      fontFamily: "monospace", cursor: exporting ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", gap: 5,
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={e => { if (!exporting) { e.currentTarget.style.background = "#4CAF5018"; e.currentTarget.style.borderColor = "#4CAF5066"; }}}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = exporting ? "#111827" : "#C3E6C3"; }}
                  >
                    <span style={{ fontSize: 16 }}>{exporting ? "⏳" : "↓"}</span>
                    {exporting ? "BUILDING..." : "EXPORT .DOCX"}
                  </button>
                </>
              )}
              {stack.gates && !selectedAgent && (
                <div style={{ display: "flex", gap: 5, marginLeft: 3 }}>
                  {stack.gates.map(g => (
                    <span key={g} style={{
                      fontSize: 15, fontFamily: "monospace", color: "#334155",
                      padding: "3px 6px", border: "1px solid #E2E8F0", borderRadius: 3
                    }}>{g}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Agent Panels */}
          {stack.agents.map(agent => {
            if (selectedAgent && !(selectedAgent.stackId === activeStack && selectedAgent.agentId === agent.id)) return null;
            const res = results[activeStack][agent.id];
            const st = statuses[activeStack][agent.id];
            if (!res && st !== "active") return null;
            const key = `${activeStack}-${agent.id}`;
            const agentRevCount = (revisions[activeStack]?.[agent.id] || []).length;
            const isRevTarget = reviseTarget?.type === "agent" && reviseTarget?.agentId === agent.id;
            return (
              <AgentPanel
                key={agent.id}
                agent={agent}
                status={st}
                result={res}
                expanded={expanded === key}
                onToggle={() => setExpanded(expanded === key ? null : key)}
                revisionCount={agentRevCount}
                isReviseTarget={isRevTarget}
                onRevise={() => {
                  setReviseTarget(isRevTarget ? null : { type: "agent", agentId: agent.id });
                  setReviseInput("");
                  setTimeout(() => reviseRef.current?.focus(), 50);
                }}
              />
            );
          })}

          {/* Final Output */}
          {!selectedAgent && finalOutputs[activeStack] && (() => {
            const fo = finalOutputs[activeStack];
            const key = `${activeStack}-final`;
            return (
              <div style={{ marginTop: 14, animation: "fadeIn 0.3s ease" }}>
                <div
                  onClick={() => setExpanded(expanded === key ? null : key)}
                  style={{
                    display: "flex", alignItems: "center", gap: 9,
                    padding: "10px 13px",
                    background: `${stack.color}10`,
                    border: `1px solid ${reviseTarget?.type === "final" ? "#7C3AED" : stack.color + "88"}`,
                    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                    borderRadius: expanded === key ? "5px 5px 0 0" : 5,
                    cursor: "pointer"
                  }}>
                  <span style={{ fontSize: 16, color: stack.color }}>★</span>
                  <span style={{ fontSize: 16, fontFamily: "monospace", color: stack.color, flex: 1, fontWeight: 700 }}>
                    {stack.outputType.toUpperCase()}
                  </span>
                  <RevisionBadge count={(finalRevisions[activeStack] || []).length} color="#BE8EE8" />
                  {!fo.error && (
                    <span
                      onClick={e => {
                        e.stopPropagation();
                        const isFinalTarget = reviseTarget?.type === "final";
                        setReviseTarget(isFinalTarget ? null : { type: "final" });
                        setReviseInput("");
                        setTimeout(() => reviseRef.current?.focus(), 50);
                      }}
                      style={{
                        fontSize: 15, fontFamily: "monospace",
                        color: reviseTarget?.type === "final" ? "#BE8EE8" : "#1F2937",
                        background: reviseTarget?.type === "final" ? "#BE8EE822" : "transparent",
                        border: `1px solid ${reviseTarget?.type === "final" ? "#BE8EE8" : "#334155"}`,
                        borderRadius: 3, padding: "2px 7px", cursor: "pointer"
                      }}>
                      ↺ REVISE
                    </span>
                  )}
                  <span style={{ fontSize: 14, color: "#111827", marginLeft: 2 }}>{expanded === key ? "▲" : "▼"}</span>
                </div>
                {expanded === key && (
                  <div style={{
                    padding: "16px", background: "#FAFBFC",
                    border: `1px solid ${stack.color}44`,
                    borderTop: "none", borderRadius: "0 0 5px 5px"
                  }}>
                    {fo.error
                      ? <pre style={{ fontSize: 15, color: "#E88E8E", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{fo.error}</pre>
                      : <NaturalOutput text={fo.text} color={stack.color} />
                    }
                  </div>
                )}
              </div>
            );
          })()}

          {/* Revision Input Bar */}
          {reviseTarget && !running && (
            <div style={{
              marginTop: 14, background: "#F3F0FA",
              border: "1px solid #D4B8F0", borderRadius: 6,
              padding: "13px 16px", animation: "fadeIn 0.2s ease"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 15, fontFamily: "monospace", color: "#7C3AED", letterSpacing: 1, fontWeight: 700 }}>↺ REVISION MODE</span>
                <span style={{ fontSize: 14, color: "#111827", fontFamily: "monospace" }}>—</span>
                <span style={{ fontSize: 15, color: "#7C3AED99", fontFamily: "monospace", fontWeight: 500 }}>
                  {reviseTarget.type === "agent"
                    ? "Revising: " + (stack.agents.find(a => a.id === reviseTarget.agentId)?.name || reviseTarget.agentId)
                    : reviseTarget.type === "final"
                    ? "Revising: " + stack.outputType
                    : "Re-running full stack with revision note"}
                </span>
                <button
                  onClick={() => { setReviseTarget(null); setReviseInput(""); }}
                  style={{ marginLeft: "auto", background: "transparent", border: "none", color: "#1F2937", fontSize: 17, cursor: "pointer", padding: "0 4px" }}>
                  ✕
                </button>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <textarea
                  ref={reviseRef}
                  rows={2}
                  value={reviseInput}
                  onChange={e => setReviseInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runRevision(); } }}
                  placeholder={
                    reviseTarget.type === "stack"
                      ? "Describe what to change across the full stack..."
                      : "What should change? Be specific — the agent will revise with full context."
                  }
                  style={{
                    flex: 1, padding: "8px 10px", background: "#FFFFFF",
                    border: "1px solid #2a2a2a", borderRadius: 4,
                    color: "#111827", fontSize: 17, fontFamily: "'DM Sans', sans-serif",
                    resize: "none"
                  }}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  <button
                    onClick={runRevision}
                    disabled={revising || !reviseInput.trim()}
                    style={{
                      padding: "8px 14px", background: revising || !reviseInput.trim() ? "#181818" : "#BE8EE8",
                      border: "none", borderRadius: 4,
                      color: revising || !reviseInput.trim() ? "#111827" : "#F8F9FB",
                      fontSize: 15, fontFamily: "monospace", letterSpacing: 1, fontWeight: 700,
                      cursor: revising || !reviseInput.trim() ? "not-allowed" : "pointer",
                      whiteSpace: "nowrap"
                    }}>
                    {revising ? "REVISING..." : "↺ APPLY"}
                  </button>
                  {hasResults && !running && (
                    <button
                      onClick={() => setReviseTarget({ type: "stack" })}
                      style={{
                        padding: "6px 14px", background: "transparent",
                        border: "1px solid #2a2a2a", borderRadius: 4,
                        color: "#1F2937", fontSize: 15, fontFamily: "monospace",
                        cursor: "pointer", whiteSpace: "nowrap", letterSpacing: 1
                      }}
                      title="Re-run all agents with your revision note added to the original challenge">
                      ⟳ FULL RERUN
                    </button>
                  )}
                </div>
              </div>
              <div style={{ fontSize: 15, color: "#334155", fontFamily: "monospace", marginTop: 6, fontSize: 14 }}>
                Enter to apply · Shift+Enter for new line · FULL RERUN re-runs all agents with your note
              </div>
            </div>
          )}

          {/* Activity Log */}
          {log.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 15, fontFamily: "monospace", color: "#1E293B", letterSpacing: 1, marginBottom: 4 }}>
                ACTIVITY LOG
              </div>
              <div ref={logRef} style={{
                background: "#FFFFFF", border: "1px solid #E2E8F0",
                borderRadius: 4, padding: "7px 10px",
                maxHeight: 120, overflowY: "auto"
              }}>
                {log.map((l, i) => (
                  <div key={i} style={{ fontSize: 14, color: l.color, fontFamily: "monospace", marginBottom: 2 }}>
                    <span style={{ color: "#1E293B" }}>{l.ts} </span>{l.msg}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<AgentStackDemo />);
