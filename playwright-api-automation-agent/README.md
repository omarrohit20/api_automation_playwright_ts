# Playwright API Automation Agent

A standalone AI agent package for Playwright API automation in TypeScript projects. This package contains reusable prompt and instruction templates that can be published or shared independently from any repository.

## Contents

- `prompt.md` — AI prompt template for generating Playwright API tests and wrappers.
- `instructions.md` — agent behavior and repository conventions for API automation.

## Purpose

Use this package with Copilot, Cursor, Claude, or any IDE-based AI assistant to:
- generate reusable Playwright API wrapper classes
- create API test specs
- add request and response fixtures
- apply consistent assertion patterns

## How to use

1. Open `prompt.md` and copy the prompt text.
2. Paste it into your AI assistant chat or prompt field.
3. Optionally provide repository-specific details or API endpoint information.
4. Ask the assistant to add or update API automation code.

## Using this agent in a blank repository

If you are starting from an empty repo, use this package as the AI guidance source for scaffolding the API automation framework:

1. Copy the `playwright-api-automation-agent` folder into the blank repo or make it available to the AI assistant.
2. Tell the assistant this is a new Playwright TypeScript API automation project.
3. Ask the assistant to create the baseline folders and files:
   - `libs/utils/requests.ts`
   - `libs/utils/assertions.ts`
   - `libs/utils/common.ts`
   - `spec/api/`
   - `test_data/`
   - `config/hosts.json`
   - `playwright.config.ts`
   - `tsconfig.json`
   - `package.json`
4. Then ask the assistant to add a sample API wrapper, fixtures, and a test spec using the conventions from this agent.

Example prompt for a blank repo:

> I have a blank Playwright TypeScript repository. Use the standalone Playwright API automation agent conventions from `prompt.md` and `instructions.md` to scaffold the basic API framework and create a sample booking API wrapper, fixtures, and test spec.

## Best practices

- Keep tests independent and idempotent.
- Prefer fixture-driven request and response data.
- Use assertion helpers for response validation.
- Avoid hard-coded values when fixtures can be reused.

## Distribution

This folder is self-contained and can be shared as-is with other teams or published as a standalone agent guide.
