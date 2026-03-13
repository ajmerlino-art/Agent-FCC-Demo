# Agent FCC Demo

This repo contains a static version of the attached dashboard that runs without a Node build step and without an Anthropic API key.

## What is included

- `index.html`: static entrypoint that bootstraps React in the browser
- `app.jsx`: the dashboard adapted from the attached `AgentStackDemo (1).jsx`
- `prompts/`: the 15 markdown prompt briefs you provided for the Creativity, Scooby, and Avengers stacks

## Run locally

Serve the repo over HTTP. On a machine with Ruby installed:

```bash
ruby -run -e httpd . -p 4173
```

Then open `http://127.0.0.1:4173`.

You can also publish the repo with GitHub Pages because the app is static.

## Using the dashboard

1. Open the page.
2. Enter your challenge.
3. Run a full stack or a single agent.
4. Use revision mode if you want to steer the output after the first pass.

## Local mode behavior

This version uses a built-in local demo engine with an embedded knowledge base instead of calling Anthropic. That means:

- no API key is required
- no model backend is required
- the app still works on GitHub Pages or any simple static host

The tradeoff is that outputs are generated from local domain heuristics rather than verified external research. They are more knowledgeable than the earlier placeholder version and are useful for demos, workflow design, and structure reviews, but they are still not verified research.

## Why this version differs from the attached JSX

The original JSX assumed a React build environment and a live Anthropic integration. This repo version:

- runs from a plain static `index.html`
- replaces the external model call with a built-in local generator
- removes the API key requirement entirely
- keeps the dashboard layout, revisions flow, and `.docx` export
