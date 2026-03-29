# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Deploy

This is an mdbook documentation project. To build locally:

```bash
# Install mdbook and mdbook-mermaid plugin
cargo install mdbook
cargo install mdbook-mermaid

# Build the book
mdbook build

# Serve locally for preview
mdbook serve
```

The book is deployed to GitHub Pages via CI when pushing to the `main` branch. The workflow in `.github/workflows/deploy.yml` builds the book and deploys to the `gh-pages` branch.

## Project Structure

- `src/` - All markdown source files for the book chapters
- `src/SUMMARY.md` - Table of contents that defines the book structure
- `book.toml` - mdbook configuration with mermaid diagram support and mathjax
- `theme/` - Custom CSS/JS for pagetoc navigation and mermaid rendering
- `assets/` - Images referenced by the markdown files

## Content Architecture

The book covers 3D character animation techniques organized into three main sections:

1. **Keyframe-based/Kinematic Approaches** - Forward/inverse kinematics, keyframe animation, motion capture, motion graphs, learning-based generation
2. **Physics-based/Dynamic Approaches** - Rigid body simulation, PD control, trajectory optimization, LQR, reinforcement learning, SIMBICON
3. **Application** - Locomotion and practical implementations

Content is written in Chinese with technical terms in English. Mermaid diagrams are used for visualizations, and mathjax supports mathematical notation.
