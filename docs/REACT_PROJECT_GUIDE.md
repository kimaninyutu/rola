# Rolla React Project Guide

## 1. What was built

Rolla is a React 19 dashboard prototype based on the supplied Figma screens. The implementation focuses on contractor onboarding, bulk contractor import, agreement signing, onboarding review, wallet currency swapping, transaction confirmation, and the shared Rolla dashboard shell.

The application is implemented in React and TypeScript. It uses Vite for the browser build, Express for the application server, tRPC/React Query for the API layer, Tailwind-compatible tooling, Lucide icons, and a project-specific CSS system for the Figma measurements.

The current implementation is intentionally front-end focused. Most product flows are functional in the browser through React state, but many records, balances, exchange results, and onboarding rows are still demo data until a persistent backend is connected.

## 2. Technology stack

- **React 19** with TypeScript.
- **Vite 7** for development and production browser builds.
- **Express** for the application server and production static serving.
- **Wouter** for the small route layer (`/` and `/404`).
- **TanStack React Query** and **tRPC** for the existing platform API integration.
- **Lucide React** for interface icons.
- **country-state-city** for country, state/province, and phone-country data.
- **Vitest** for server/platform tests.
- **Drizzle ORM** and MySQL configuration remain available for future persistence.

Important scripts from `package.json`:

```bash
pnpm dev          # Express + Vite development server
pnpm dev:static   # Vite-only static development server
pnpm check        # TypeScript validation
pnpm build        # Browser build plus bundled production server
pnpm build:static # Browser build only
pnpm test         # Vitest test suite
pnpm start        # Run the production server after pnpm build
pnpm db:migrate   # Apply checked-in Drizzle migrations
pnpm db:push      # Generate and apply schema changes
```

## 3. Application entrypoint and shell

The browser starts in `client/src/main.tsx`.

`main.tsx` does four things:

1. Imports the global stylesheet from `client/src/index.css`.
2. Creates a React Query client.
3. Configures the tRPC client at `/api/trpc`, including credentials and the preview-session fallback header.
4. Mounts `<App />` into the root DOM element.

`client/src/App.tsx` provides the application-level wrappers:

- `ErrorBoundary` catches rendering failures.
- `ThemeProvider` supplies the light theme context.
- `TooltipProvider` supports shared tooltip primitives.
- `Toaster` supports toast notifications.
- Wouter routes `/` to `Home` and all unknown routes to `NotFound`.

The visible Rolla dashboard is rendered by `Home` in `client/src/pages/Home.tsx`. The dashboard shell has three main layers:

- `NavigationBar`: fixed-width business sidebar and navigation groups.
- `TopBar`: page title, exchange-rates control, help, notifications, settings, and profile avatar.
- `dashboard-content`: the active middle-screen content.

The shell is shared by Team, Onboarding, and Swap screens. This was important for matching the Figma designs: the sidebar and top bar stay stable while the middle content changes.

## 4. Main state-driven navigation

The project uses one top-level `screen` state in `Home` rather than a large URL route tree. The state includes:

```ts
"team"
"swap"
"onboarding-list"
"hire-type"
"engagement"
"bulk-import"
"bulk-agreement"
"onboarding"
"onboarding-contract"
"payment"
"agreement"
"review"
```

The top-level screen controls which middle-screen component is rendered. Navigation callbacks are passed down instead of using a global store.

Important flow transitions:

- Team empty state → `hire-type`
- Hire type → `engagement`
- Individual engagement → `onboarding`
- Business engagement → `onboarding` with `businessContractor = true`
- Business bulk import → `bulk-import`
- Personal Details → Contract Details → Payment → Agreement → Review
- Back from the first Personal/Business Details form → `engagement`
- Back from Contract Details → Personal/Business Details
- Sidebar Swap → `swap`
- Swap Continue → review modal/card → OTP → processing/success or failure state

The recent Back-navigation correction is in `Home.tsx`: the first onboarding form receives `onExit={() => setScreen("engagement")}`, so both Individual and Business flows return to the Individual/Business selection screen instead of restarting at the dashboard.

## 5. Dashboard and Team screens

### Team empty state

The default Team screen renders:

- Rolla logo and sidebar.
- “Add New Hire to Rolla” empty-state illustration.
- Explanatory copy.
- “Add New Hire” primary button.

The button opens the hire-type choice screen.

### Hire type selection

`HireTypePage` presents the initial employment choice, including the existing design treatment and selected-card state. The selected choice is retained in local component state until Continue is clicked.

### Onboarding overview

`OnboardingListPage` renders the onboarding dashboard view with:

- Hire category tabs.
- Search and filter controls.
- Add New Hire action.
- A horizontally scrollable onboarding records table.
- Status and required-action cells.

The rows currently demonstrate the intended UI and interaction model. Connect these rows to a backend collection when real onboarding records are available.

## 6. Individual and Business contractor onboarding

The onboarding stepper is shared through:

```ts
const onboardingSteps = [
  "Personal Details",
  "Contract Details",
  "Payment",
  "Agreement",
  "Review",
];
```

`OnboardingStepper` and `OnboardingProgress` provide the desktop and compact progress treatments. The active step is passed into the component so the same five-step visual system is used across the flow.

### Individual Personal Details

`PersonalDetailsForm` includes:

- Full Name.
- Email Address.
- Phone number with country flag and dial-code picker.
- Nationality.
- Country of Residence.
- State/Province.
- Cancel and Continue actions.

Countries and states are based on `country-state-city` rather than a single hardcoded country. State/province choices update based on the selected residence country.

### Business Details

`BusinessDetailsForm` is the Business version of the first step. It keeps the same shell and actions but changes the fields to business-oriented details such as:

- Business Name.
- Email Address.
- Business Number.
- Phone/country information.

### Engagement choice cards

`EngagementPage` renders the Individual and Business cards. Each card supports:

- Click selection.
- Purple selected border.
- Immediate Continue action.
- Business-only bulk import action.
- Business illustration state switching.

The Business logo is an inline SVG in `BusinessIllustration`. It has two explicit states:

- Unselected: background `#EEEEF4`, columns `#D0D0D0`, roof/base `#7F7897`.
- Selected: Rolla purple `#3C329D` for the active building elements.

This avoids a CSS color filter and keeps the SVG colors faithful to the supplied Figma assets.

## 7. Contract Details

`ContractDetailsForm` is the second onboarding step. It collects:

- Job Title / Service Provided.
- Department.
- Manager.
- Scope of Work.
- Supporting document upload.
- Start Date.
- Engagement type.
- Relevant date/project fields.
- Notice Period.

The engagement selector has exactly three modes:

1. Fixed Term
2. Ongoing engagement
3. Project Based

The form conditionally displays fields based on the selected mode:

- Fixed Term includes End Date.
- Ongoing engagement includes project/deliverable and expected completion information.
- Project Based includes project/deliverable and expected completion information.

The date controls use native date inputs styled to match the Figma fields, so the user can select dates rather than only seeing static text.

## 8. Payment step

`PaymentPage` is the third onboarding step. It keeps the five-step breadcrumb above the content and renders a centered payment panel.

The first screen has two selectable contract type cards:

- Fixed rate.
- Pay as you go.

The panel remains compact until a type is chosen. Selecting a type expands the relevant form while keeping the two contract-type cards visible during scrolling.

### Fixed rate

`FixedRatePaymentDetails` supports:

- Pay Rate and currency.
- Pay Frequency.
- Invoice Cycle.
- Payment Due.
- First Payment Date.
- Cycle start and end summaries.
- First Payment Amount tabs.

The first-payment tabs are:

- Calculated Amount.
- Full Amount.
- Custom Amount.

Each tab has its own helper content. Full Amount is shown in a non-editable bordered box, while Custom Amount exposes an editable payment field.

### Pay as you go

`PayAsYouGoPaymentDetails` supports:

- Pay rate.
- Pay frequency.
- Invoice cycle.
- Payment due.
- First payment date.
- Date/cycle summary rows.
- “Who can submit work” permissions.
- Client and Contractor switches.

The action buttons remain at the bottom of the expanded form with responsive spacing.

## 9. Agreement step

`AgreementPage` handles both the standard Rolla agreement and imported agreements.

The initial agreement selection provides:

- Rolla Standard Agreement.
- Import Agreement.

The standard-agreement path supports:

- Contract name.
- Special clause.
- Additional document upload.
- Coverage options.
- Review and sign.

The import path supports file selection and imported-agreement details. File labels and selected-file names are held in component state so the interface updates immediately after selection.

### Signature capture

`ContractSignaturePanel` supports two signing modes:

- Draw: canvas-based pointer drawing.
- Type: typed signature/name rendering.

The signature is not accepted until the user has supplied a signature and confirmed the authorization checkbox. The typed signature is displayed as typed content; a drawn signature is rendered from the canvas data.

### Bulk agreement variant

Bulk import uses a separate three-stage flow:

1. Import
2. Review
3. Agreement

`BulkStandardAgreementDetails` provides the bulk-specific standard agreement and the “Import Contractors” action. This is intentionally separate from the individual five-step agreement screen so the two designs do not get mixed together.

## 10. Review and onboarding invite

`ReviewPage` summarizes the collected contractor information before completion. It includes:

- Personal details.
- Contract details.
- Payment data.
- Agreement state.
- Signature/status information.
- Save Draft.
- Send Onboarding Invite.

The review screen also supports client signing-link behavior. `updateClientSigningUrl`, `getClientSigningUrl`, and `SignatureStatusPanel` manage the signing-link interaction for the prototype.

After sending an invite, the UI presents a success dialog showing the recipient and invitation summary. For bulk flows, the summary uses the imported contractor count and parsed payment/currency values where available.

## 11. Bulk CSV import

The bulk flow is implemented through these components:

- `BulkImportPage`
- `CsvFieldsPage`
- `ReviewRowsPage`
- `SavedLayoutPage`

### Import stage

The import page supports:

- File selection and drag/drop-style input.
- Filename display.
- File-size validation.
- CSV parsing.
- Read-progress presentation.
- Saved-layout entry point.

### Mapping stage

`CsvFieldsPage` maps each CSV column to a Rolla field. It supports:

- Searchable field picker.
- Suggested field mapping.
- Read-as type labels.
- Required-field progress.
- Format action for money/amount fields.
- Add a new field.
- Skip a column.
- Replace file.
- Review contractors action.

The mapping helpers are defined near the top of `Home.tsx`, including `suggestCsvField`, `readAsLabel`, field groups, and supported field lists.

### Add new field

The Add Field modal collects a field name and type. The newly added field is immediately inserted into the selected mapping row and marked as a custom field. The selected mapping state is local to the CSV page.

### Review rows

`ReviewRowsPage` separates valid and invalid rows. It provides:

- Good-row and bad-row counts.
- Row-level problem descriptions.
- Fix-row panel.
- Enter-missing-value option.
- Save-fix interaction.
- Fix-in-CSV guidance.
- Edit field choices.
- Continue with good rows only.

The page is intentionally data-driven from parsed CSV records and mappings rather than rendering a fixed number of visual rows.

### Saved layout

`SavedLayoutPage` presents the saved column layout and a blank CSV download action. In a production version, the layout should be persisted to the user profile instead of remaining front-end demo state.

## 12. Swap Currency flow

`SwapPage` implements the currency-swap experience. It includes:

- Wallet cards.
- Currency flags.
- Active badges.
- Available balances.
- Change Wallet actions.
- Amount to Send and Amount to Receive fields.
- Automatic mirrored amount updates.
- Continue action.

The wallet definitions are currently held in `swapWallets` with CAD, GBP, USD, and NGN examples. Replace this object with an API query when live balances are available.

### Wallet picker

`WalletChangeModal` is a controlled modal with:

- Accessible dialog semantics.
- Radio-style wallet options.
- Country flag images from FlagCDN.
- Active status badges.
- Cancel and Select Wallet actions.
- Escape-key dismissal.
- Backdrop dismissal.
- Separate source/target wallet selection through `walletTarget`.

### Swap review and transaction states

`SwapReviewPage` displays:

- Wallet Swap heading.
- Send amount and currency.
- Transfer fee.
- Amount to convert.
- Receive total and currency.
- Exchange rate.
- Recipient wallet/avatar/handle.
- Back and Send actions.

The Send action continues through:

1. OTP modal (`TransactionOtpModal`).
2. Processing modal (`ProcessingTransactionModal`).
3. Success modal (`SuccessfulTransactionModal`) or failure modal (`FailedTransactionModal`).

The current OTP and transaction results are prototype interactions. A real implementation should validate the OTP on the server and create an idempotent transaction record.

## 13. Styling and Figma parity

Most visual work is centralized in `client/src/index.css`. The stylesheet includes:

- Design tokens in `:root`.
- Sidebar and top-bar measurements.
- Typography and color treatments.
- Card borders, selected states, and hover states.
- Five-step onboarding breadcrumb styles.
- Form/input/date-picker styles.
- Payment panel and expanded-section layout.
- Agreement and signature layouts.
- CSV import tables and modals.
- Wallet cards, wallet picker, review cards, OTP, processing, and success states.
- Responsive media queries for tablet and mobile widths.

The design approach is deliberately class-based CSS instead of placing every measurement inline. For a new Figma screen:

1. Add a semantic component in `Home.tsx` or a new page file.
2. Give the component a specific class namespace.
3. Add desktop styles first using the Figma measurements.
4. Add a responsive override below the desktop rules.
5. Check that the page does not create horizontal overflow.
6. Reuse existing typography, button, border, and spacing tokens where possible.

The sidebar width is treated as a stable shell dimension. Middle content should not modify sidebar rules unless the Figma design explicitly changes the shell.

## 14. Assets

Active browser assets are in `client/public`:

- `rolla-logo.png`: Rolla wordmark.
- `team-empty-state.png`: default onboarding/team illustration.
- `team-empty-state-blue.png`: selected illustration state.

The Business engagement building is inline SVG in `Home.tsx` because the design supplied separate selected and unselected SVG states. This makes the two color states explicit and avoids depending on an external image file.

## 15. Data and production-readiness notes

The UI currently uses local React state for most interactions. This is appropriate for a Figma interview/prototype but should be replaced or extended for a production product:

- Store contractors and onboarding drafts in a database.
- Persist CSV layouts and imported contractor records.
- Upload agreements/documents to managed storage.
- Validate all uploaded CSV data on the server.
- Calculate exchange rates and balances server-side.
- Create transaction records with idempotency keys.
- Verify OTPs server-side.
- Move sensitive invitation/payment operations behind authenticated tRPC procedures.
- Replace example onboarding rows, wallet balances, and sample names with API data.
- Add authorization checks for business/team access.

The existing Express/tRPC/Drizzle foundation remains available for this work. `server/routers.ts`, `server/db.ts`, `drizzle/schema.ts`, and `shared/types.ts` are the main places to extend the backend contract.

## 16. How to add a new screen safely

Use this sequence:

1. Add a screen name to the `screen` union in `Home`.
2. Add a branch to the main render switch.
3. Create a focused component with typed callback props.
4. Pass navigation callbacks from `Home` instead of reaching into parent state directly.
5. Reuse the dashboard shell and the five-step breadcrumb where appropriate.
6. Add namespaced CSS in `index.css`.
7. Keep data in state only for transient UI; use tRPC for persisted records.
8. Add the Back path before styling the page.
9. Run `pnpm check`, `pnpm build:static`, and `pnpm test`.
10. Test desktop, tablet, and mobile widths, especially long forms and modals.

## 17. Verification checklist

Before handing off a change:

```bash
pnpm check
pnpm build:static
pnpm test
git diff --check
```

For a production-server verification:

```bash
pnpm build
pnpm start
```

Then verify:

- `/` loads the Rolla dashboard.
- Unknown routes reach the 404 screen.
- Sidebar navigation works.
- Back buttons return to the immediately previous product step.
- Modals close with Cancel, close controls, backdrop, and Escape where applicable.
- Mobile layouts do not create page-wide horizontal overflow.
- Uploaded file names and parsed values are displayed from state.
- Signature controls reject empty signatures.
- Swap review values reflect the selected wallet and amounts.

## 18. Final repository organization

The important active files are:

```text
client/src/main.tsx          React/browser entrypoint
client/src/App.tsx           Providers and Wouter routes
client/src/pages/Home.tsx    Rolla dashboard and product flows
client/src/pages/NotFound.tsx 404 route
client/src/index.css         Figma-focused global styling
client/src/components/ErrorBoundary.tsx
client/src/contexts/ThemeContext.tsx
client/src/components/ui/    Shared UI primitives
client/public/               Required browser assets
server/_core/index.ts        Express server entrypoint
server/routers.ts            tRPC router extension point
server/db.ts                 Drizzle database helper
shared/                      Shared server/client types and constants
drizzle/                     Database schema and migrations
vite.config.ts               Vite aliases, plugins, and platform support
package.json                 Scripts and dependencies
```

The repository was cleaned after the interview implementation: disconnected starter dashboard files, demo showcase code, generated logs, build output, and the completed TODO checklist were removed. The remaining source tree contains the active Rolla implementation plus the platform/runtime files required to run it.
