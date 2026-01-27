# Project Rules

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict mode)
- **Styling**: Tailwind CSS (No CSS modules, no ad-hoc styles unless necessary)
- **UI Library**: Shadcn UI (for accessible primitives)
- **State Management**: Zustand (if needed) or React Context
- **Backend**: Supabase (PostgreSQL, Edge Functions)

## Security
- **API Keys**: Never commit API keys. Always use `process.env`.
- **Environment**: Check for `process.env` variables before using them.
- **Logging**: Wrap all API interactions in a try/catch block.

## Coding Standards
- **Components**: Functional components with strict type definitions.
- **Imports**: Use absolute imports (`@/components/...`).
- **3D**: Always prefer `@react-three/drei` helpers over writing raw Three.js boilerplate.
- **Comments**: Focus on "Why", not "What". Document exported functions with JSDoc.

## Workflow
- **Testing**: No feature is complete without verification.
- **Clean Code**: Remove unused imports and variables.
