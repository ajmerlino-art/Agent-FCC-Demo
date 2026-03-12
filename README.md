# Agent FCC Demo

This repo now contains a static version of the attached dashboard so it can run without a Node build step.

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
2. Paste an Anthropic API key into the `ANTHROPIC API` field.
3. Enter your challenge.
4. Run a full stack or a single agent.

## Important note about API keys

This version runs directly from the browser, so Anthropic requests are client-side. That makes the app easy to host as a static site, but it also means the browser handles the API key. Use a limited internal key if you publish the site.

## Why this version differs from the attached JSX

The original JSX assumed a React build environment and its Anthropic request was missing the required auth headers. This repo version:

- runs from a plain static `index.html`
- adds the required `x-api-key` and `anthropic-version` headers
- adds an in-app API key field with optional browser storage
- keeps the dashboard layout, revisions flow, and `.docx` export
