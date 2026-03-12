const { useState, useRef, useEffect } = React;

const ANTHROPIC_API_KEY_STORAGE = "agent-fcc-demo:anthropic-api-key";
const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";
const ANTHROPIC_VERSION = "2023-06-01";

function loadStoredApiKey() {
  try {
    return window.localStorage.getItem(ANTHROPIC_API_KEY_STORAGE) || "";
  } catch {
    return "";
  }
}

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

// ─── API ──────────────────────────────────────────────────────────────────────

async function callClaude(systemPrompt, userMessage, apiKey, retries = 3) {
  const trimmedApiKey = apiKey?.trim();
  if (!trimmedApiKey) {
    return {
      text: null,
      error: "Anthropic API key missing. Add it in the Anthropic API panel before running a stack."
    };
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": trimmedApiKey,
          "anthropic-version": ANTHROPIC_VERSION
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 1800,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }]
        })
      });
      if (res.status === 502 || res.status === 503 || res.status === 429) {
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 1500 * attempt));
          continue;
        }
        return { text: null, error: `API error ${res.status} after ${retries} attempts. Please try again.` };
      }
      if (!res.ok) {
        const rawError = await res.text();
        let message = rawError;

        try {
          const parsed = JSON.parse(rawError);
          message = parsed.error?.message || parsed.error?.type || parsed.message || rawError;
        } catch {
          message = rawError;
        }

        if (res.status === 401 || res.status === 403) {
          message = `Check the API key and Anthropic workspace permissions. ${message}`.trim();
        }

        return { text: null, error: `API error ${res.status}: ${String(message).slice(0, 300)}` };
      }
      const data = await res.json();
      const text = data.content?.map(b => b.text || "").join("") || "";
      if (!text) return { text: null, error: "Empty response from API." };
      return { text, error: null };
    } catch (e) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1500 * attempt));
        continue;
      }
      const suffix = e.message === "Failed to fetch"
        ? " Serve the repo over http(s) and confirm outbound access to api.anthropic.com."
        : "";
      return { text: null, error: `Network error: ${e.message}.${suffix}` };
    }
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
  const [apiKey, setApiKey] = useState(loadStoredApiKey);
  const [rememberApiKey, setRememberApiKey] = useState(() => Boolean(loadStoredApiKey()));
  const [showApiKey, setShowApiKey] = useState(false);
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

  useEffect(() => {
    try {
      if (rememberApiKey && apiKey.trim()) {
        window.localStorage.setItem(ANTHROPIC_API_KEY_STORAGE, apiKey.trim());
      } else {
        window.localStorage.removeItem(ANTHROPIC_API_KEY_STORAGE);
      }
    } catch {
      // Ignore storage failures in locked-down browsers.
    }
  }, [apiKey, rememberApiKey]);

  const addLog = (msg, color = "#111827") =>
    setLog(p => [...p, { msg, color, ts: new Date().toLocaleTimeString() }]);

  const stack = STACKS[activeStack];
  const hasResults = Object.values(results[activeStack]).length > 0 || finalOutputs[activeStack];
  const hasApiKey = Boolean(apiKey.trim());
  const canRun = Boolean(input.trim()) && hasApiKey && !running;

  async function runFullStack() {
    if (!input.trim() || !hasApiKey) return;
    setRunning(true);
    const sid = activeStack;
    const st = STACKS[sid];
    setResults(p => ({ ...p, [sid]: {} }));
    setStatuses(p => ({ ...p, [sid]: {} }));
    setFinalOutputs(p => ({ ...p, [sid]: null }));
    setLog([]);
    addLog(`${st.label} initiated`, st.color);

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

      const res = await callClaude(agent.systemPrompt, userMsg, apiKey);
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

    const finalRes = await callClaude(
      "You are a synthesis agent for Dr. A.J. Merlino's Creative Impact Programs at WGU. Write in clear, direct prose for executive leadership and accreditors.",
      st.buildFinalPrompt(input, outputsText),
      apiKey
    );

    setFinalOutputs(p => ({ ...p, [sid]: finalRes }));
    setExpanded(`${sid}-final`);
    addLog(`${st.outputType} complete.`, st.color);
    setRunningAgent(null);
    setRunning(false);
  }

  async function runSingleAgent(stackId, agentId) {
    if (!input.trim() || !hasApiKey) return;
    const agent = STACKS[stackId].agents.find(a => a.id === agentId);
    if (!agent) return;
    setRunning(true);
    setRunningAgent(agentId);
    setStatuses(p => ({ ...p, [stackId]: { ...p[stackId], [agentId]: "active" } }));
    addLog(`Invoking ${agent.name}...`, agent.color);

    const res = await callClaude(agent.systemPrompt, `Challenge/Goal: ${input}`, apiKey);
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
    if (!reviseInput.trim() || !reviseTarget || revising || !hasApiKey) return;
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

      const res = await callClaude(sysPrompt, userMsg, apiKey);

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

      const res = await callClaude(sysPrompt, userMsg, apiKey);

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
        .settings-grid { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 8px; align-items: center; }
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
          .settings-grid { grid-template-columns: 1fr !important; }
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
              ANTHROPIC API
            </div>
            <div style={{
              background: "#FFFFFF",
              border: `1px solid ${hasApiKey ? "#BBF7D0" : "#FECACA"}`,
              borderRadius: 5,
              padding: "12px"
            }}>
              <div className="settings-grid">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="Enter your Anthropic API key"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    borderRadius: 4,
                    color: "#111827",
                    fontSize: 15,
                    fontFamily: "monospace"
                  }}
                />
                <button
                  onClick={() => setShowApiKey(p => !p)}
                  style={{
                    padding: "8px 12px",
                    background: "transparent",
                    border: "1px solid #CBD5E1",
                    borderRadius: 4,
                    color: "#1E293B",
                    fontSize: 14,
                    fontFamily: "monospace",
                    cursor: "pointer"
                  }}
                >
                  {showApiKey ? "HIDE" : "SHOW"}
                </button>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontSize: 14,
                  fontFamily: "monospace",
                  color: "#334155"
                }}>
                  <input
                    type="checkbox"
                    checked={rememberApiKey}
                    onChange={e => setRememberApiKey(e.target.checked)}
                  />
                  Remember
                </label>
              </div>
              <div style={{
                fontSize: 14,
                fontFamily: "monospace",
                color: hasApiKey ? "#166534" : "#991B1B",
                marginTop: 9
              }}>
                {hasApiKey
                  ? `READY · browser requests will use ${ANTHROPIC_MODEL}`
                  : "KEY REQUIRED · add an Anthropic API key before running a stack"}
              </div>
              <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.5, marginTop: 6 }}>
                This repo runs as a static app, so requests go directly from the browser. Use a limited internal key if you publish it.
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
                    disabled={revising || !reviseInput.trim() || !hasApiKey}
                    style={{
                      padding: "8px 14px", background: revising || !reviseInput.trim() || !hasApiKey ? "#181818" : "#BE8EE8",
                      border: "none", borderRadius: 4,
                      color: revising || !reviseInput.trim() || !hasApiKey ? "#111827" : "#F8F9FB",
                      fontSize: 15, fontFamily: "monospace", letterSpacing: 1, fontWeight: 700,
                      cursor: revising || !reviseInput.trim() || !hasApiKey ? "not-allowed" : "pointer",
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
