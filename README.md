# Rolla Business Navigation

React / Express / tRPC / Drizzle application.

- `pnpm dev`: development server; honors `PORT` (default 3000).
- `pnpm build` / `pnpm start`: build and serve `dist/index.js` and `dist/public/`.
- `pnpm db:migrate`: apply checked-in migrations. `pnpm db:push`: generate and apply new schema changes.
- `pnpm check` / `pnpm test`: types and application tests.

The browser dashboard is public and uses local React state for the interview prototype. Add an application-owned authentication provider and persistence layer when the product moves beyond the prototype.
