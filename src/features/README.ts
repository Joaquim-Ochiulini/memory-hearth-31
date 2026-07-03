/**
 * features/ — self-contained product areas.
 *
 * Each feature owns its UI, hooks, and data-access.
 * Suggested layout:
 *   features/memories/
 *     components/  hooks/  services/  types.ts  index.ts
 *
 * Features may depend on components/, hooks/, services/, utils/, types/.
 * Features must NOT depend on other features directly — cross-feature
 * behavior lives in services/ or a dedicated shared module.
 */
export {};
