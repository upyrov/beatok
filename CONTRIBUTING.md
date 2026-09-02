# Contributing to Beatok

First off, thank you for considering contributing to Beatok!

## Prerequisites

**[Bun](https://bun.sh/)** is the official package manager and runtime for this project.

## Local Development

1. Fork and clone the repository.
2. Install dependencies:
   ```bash
   bun install
   ```
3. Start the development server:
   ```bash
   bun run dev
   ```

## Coding Guidelines

We have specific rules in place to maintain consistency and performance. Before opening a Pull Request, please ensure you adhere to the following:

### Formatting and Types

- **Formatting**: After making changes, always format your code. We use Biome. Run:
  ```bash
  bunx @biomejs/biome format --write .
  ```
- **Typechecking**: We strictly type our application. Run typechecks before committing:
  ```bash
  bun typecheck
  ```

## Pull Request Process

1. Create a descriptive branch name (e.g., `feat/add-new-player` or `fix/audio-sync`).
2. Make your changes and test them locally.
3. Run formatting and `bun typecheck`.
4. Push your branch and open a Pull Request.

## Reporting Bugs and Features

Please use the provided issue templates to report bugs or request features. Include as much context as possible!
