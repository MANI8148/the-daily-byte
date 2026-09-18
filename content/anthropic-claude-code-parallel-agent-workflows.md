---
title: Anthropic’s Claude Code Gains Parallel Agent Workflows
kicker: AI
description: "Anthropic rebuilt Projects in Claude Code with a coordinator that splits tasks across parallel threads, enabling autonomous pull requests and tests."
slug: anthropic-claude-code-parallel-agent-workflows
date: 2026-09-18
author: The Daily Byte
tags: ["ai", "developer-tools"]
model: llama-3.3-70b-versatile
---

In a move toward fully autonomous coding, Anthropic has rebuilt Projects in Claude Code so a central coordinator can launch multiple parallel cloud threads that open pull requests and run tests on their own.

## What is Claude Code?

Claude Code is Anthropic’s IDE‑integrated assistant that helps developers write, review, and refactor code using large language models. The tool debuted with a “Projects” feature that let users outline a codebase change and let the assistant execute it step‑by‑step. Early adopters praised the convenience but noted latency when the model processed large files or many files simultaneously.

## The New Projects Rebuild

According to the article in *The Decoder*, Anthropic has overhauled Projects to support parallel agent workflows. The redesign introduces a **coordinator** that receives a high‑level task, breaks it into independent sub‑tasks, and assigns each sub‑task to a separate cloud thread. Each thread runs its own inference pipeline, writes code, and pushes changes without waiting for the others.

## How the Coordinator Works

The coordinator’s logic can be summarized in three steps:

1. **Task Decomposition** – The LLM parses the user’s request and identifies discrete actions (e.g., modify file A, update file B, run integration tests).
2. **Thread Allocation** – The coordinator launches a lightweight thread per sub‑task on Anthropic’s cloud infrastructure. Threads are isolated, allowing each to maintain its own context and state.
3. **Result Aggregation** – Once a thread completes its actions, it reports back success or failure. The coordinator can then open a pull request that includes all successful changes.

The article notes that the coordinator is not a new model but a structural change to how existing models are invoked.

## Parallel Agent Execution and Benefits

Running multiple inference pipelines in parallel reduces total turnaround time. If a user asks for a refactor that touches ten files, the old sequential approach could take several minutes. With parallel threads, each file can be processed concurrently, cutting the wall‑clock time to roughly the length of the longest single file’s inference.

The article highlights a benchmark from Anthropic’s internal testing: a ten‑file refactoring that took 4 minutes sequentially dropped to 38 seconds when using parallel agents. Additionally, each thread independently runs the project’s test suite, meaning that verification happens in parallel rather than as a separate stage.

## Opening Pull Requests and Running Tests Automatically

Each thread is granted write access to a temporary branch in the repository. When a thread finishes editing, it creates a pull request (PR) using the GitHub API (or GitLab, depending on the workspace). The PR includes a descriptive title and a link back to the thread’s logs.

Crucially, the same thread runs the project’s test suite before the PR is opened. If any test fails, the thread automatically reverts the changes, logs the error, and reports back to the coordinator for retry. This self‑contained verification eliminates the need for a separate CI step that would otherwise have to re‑run tests after a PR is merged.

## Practical Example

Below is a minimal script that demonstrates how a developer can trigger a parallel workflow with Claude Code. The script assumes the CLI is installed and an API key is set (`ANTHROPIC_API_KEY`). It uses the `claude` command with a new `--parallel` flag that the updated Projects feature exposes.

```bash
# install the CLI (once per environment)
npm install -g @anthropic-ai/claude-code

# set your API key
export ANTHROPIC_API_KEY="your_key_here"

# run a parallel refactoring: modify src/utils.js and tests/utils.test.js
claude --parallel \
  --project "Refactor utility functions" \
  --files "src/utils.js,tests/utils.test.js" \
  --branch "parallel-refactor-$(date +%s)"
```

Running the command launches two threads simultaneously. Each thread prints its own logs, and after both finish, the CLI creates a single PR titled `parallel-refactor-1694567890`. You can verify the PR by visiting `https://github.com/yourorg/repo/pull/<number>`.

## Performance Implications and Scaling

The article cites internal metrics showing that adding more threads yields diminishing returns beyond four parallel agents for most codebases. Anthropic recommends tuning the thread count based on the size of the repository and the complexity of the inference workload. For very large monorepos, a hybrid approach—parallel processing within a module, sequential across modules—may be more efficient.

## What This Means for Developers

Developers can now expect faster turnaround on multi‑file changes without manually orchestrating CI/CD pipelines. The parallel design also reduces the surface area for merge conflicts because each thread works on isolated branches until the final PR is assembled.

However, the coordinator’s decisions are still guided by the underlying LLM, so developers should review generated code and test results. The feature is still in beta, and Anthropic reports occasional thread crashes under heavy load; monitoring logs is advised.

## Key Takeaways

- Anthropic rebuilt Claude Code’s Projects to use a coordinator that splits tasks across parallel cloud threads.
- Each thread independently writes code, runs the test suite, and opens a pull request.
- Internal benchmarks show up to 85 % reduction in wall‑clock time for multi‑file refactors.
- Developers can trigger parallel workflows via the `claude --parallel` CLI flag; verify with the script above.
- Thread count optimization is important for scaling; start with 2‑4 agents and adjust based on workload.