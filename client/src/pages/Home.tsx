import {
  ArrowLeft,
  ArrowDownUp,
  ArrowLeftRight,
  Bell,
  CalendarDays,
  Check,
  CircleHelp,
  ChevronDown,
  CircleDollarSign,
  Copy,
  CreditCard,
  Eye,
  FileText,
  Grid2X2,
  HandCoins,
  Clock3,
  LayoutDashboard,
  LogOut,
  Mail,
  MoreHorizontal,
  Repeat2,
  Search,
  Send,
  Settings,
  SlidersHorizontal,
  Upload,
  UserRoundPlus,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Country, State } from "country-state-city";
import { Fragment, useEffect, useRef, useState } from "react";

interface NavigationItem {
  label: string;
  icon: LucideIcon;
  tone?: "default" | "danger";
}

interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

const navigationGroups: NavigationGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Finance",
    items: [
      { label: "Accounts", icon: WalletCards },
      { label: "Payments", icon: Send },
      { label: "Swap", icon: Repeat2 },
      { label: "Invoice", icon: FileText },
      { label: "Transactions", icon: ArrowDownUp },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Team", icon: UsersRound },
      { label: "Onboarding", icon: UserRoundPlus },
      { label: "Payroll", icon: HandCoins },
      { label: "Contractors", icon: CreditCard },
    ],
  },
  {
    label: "Preference",
    items: [
      { label: "Settings", icon: Settings },
      { label: "Support", icon: CircleHelp },
      { label: "Log Out", icon: LogOut, tone: "danger" },
    ],
  },
];

function RollaMark() {
  return (
    <img className="rolla-logo" src="/rolla-logo.png" alt="Rolla" />
  );
}

function EmptyStateIllustration() {
  return <img className="empty-state-illustration" src="/team-empty-state.png" alt="Illustration of a new team member" />;
}

const onboardingSteps = ["Personal Details", "Contract Details", "Payment", "Agreement", "Review"];

function OnboardingStepper({ activeStep }: { activeStep: number }) {
  return (
    <div className="onboarding-stepper" role="list" aria-label="Contractor onboarding progress">
      {onboardingSteps.map((step, index) => (
        <div className="onboarding-step-wrap" key={step} role="listitem">
          <div
            className={`onboarding-step${index === activeStep ? " is-active" : ""}${index < activeStep ? " is-complete" : ""}`}
            aria-current={index === activeStep ? "step" : undefined}
          >
            <span>{index < activeStep ? <Check aria-hidden="true" strokeWidth={2.4} /> : index + 1}</span>
            <strong>{step}</strong>
          </div>
          {index < onboardingSteps.length - 1 ? <span className="onboarding-step-divider" /> : null}
        </div>
      ))}
    </div>
  );
}

function OnboardingProgress({ activeStep }: { activeStep: number }) {
  return (
    <div className="onboarding-stepper-wrap">
      <OnboardingStepper activeStep={activeStep} />
    </div>
  );
}

function BulkImportProgress({ activeStep = 0 }: { activeStep?: number } = {}) {
  const steps = ["Import", "Review", "Agreement"];
  return (
    <div className="bulk-import-stepper" role="list" aria-label="Bulk contractor import progress">
      {steps.map((step, index) => (
        <div className="bulk-import-step-wrap" key={step} role="listitem">
          <div className={`bulk-import-step${index === activeStep ? " is-active" : ""}${index < activeStep ? " is-complete" : ""}`} aria-current={index === activeStep ? "step" : undefined}>
            <span>{index < activeStep ? <Check aria-hidden="true" strokeWidth={2.4} /> : index + 1}</span><strong>{step}</strong>
          </div>
          {index < steps.length - 1 ? <span className="bulk-import-step-divider" /> : null}
        </div>
      ))}
    </div>
  );
}

const savedLayoutColumns = ["Name", "email", "country", "rate", "currency", "pay basis", "project code"];

interface CsvFieldRow {
  name: string;
  sample: string;
}

const csvFieldOptions = ["Choose a field", "Full name", "Email address", "Phone number", "Work country", "Pay amount", "Currency", "Pay basis", "Start date", "Project code"] as const;
type CsvField = typeof csvFieldOptions[number] | (string & {});

const csvFieldGroups: { label: string; fields: CsvField[] }[] = [
  { label: "Personal details", fields: ["Full name", "Email address", "Phone number", "Work country"] },
  { label: "Pay details", fields: ["Pay amount", "Currency", "Pay basis"] },
  { label: "Work details", fields: ["Start date", "Project code"] },
  { label: "Bank details", fields: ["Account holder name", "Bank name", "Bank country", "Account number", "IBAN", "SWIFT / BIC", "Routing number (United States)"] },
];

function suggestCsvField(column: string): CsvField {
  const normalized = column.toLowerCase().replace(/[^a-z]/g, "");
  if (normalized.includes("name")) return "Full name";
  if (normalized.includes("email")) return "Email address";
  if (normalized.includes("phone")) return "Phone number";
  if (normalized.includes("country")) return "Work country";
  if (normalized.includes("paymentmethod")) return "Choose a field";
  if (normalized.includes("amount") || normalized.includes("rate") || normalized.includes("pay")) return "Pay amount";
  if (normalized.includes("currency")) return "Currency";
  if (normalized.includes("frequency") || normalized.includes("basis")) return "Pay basis";
  if (normalized.includes("start") || normalized.includes("date")) return "Start date";
  if (normalized.includes("project")) return "Project code";
  return "Choose a field";
}

function readAsLabel(field: CsvField) {
  if (field === "Choose a field") return "Not selected";
  if (field === "Full name") return "Name";
  if (field === "Email address") return "Email";
  if (field === "Phone number") return "Phone";
  if (field === "Work country") return "Country";
  if (field === "Pay amount") return "Money";
  if (field === "Currency") return "Currency";
  if (field === "Pay basis") return "Choice";
  if (field === "Start date") return "Date";
  return "Code";
}

function ReviewRowsPage({ rows, records, mappings, onBack, onEditFields, onReplace, onContinue }: { rows: CsvFieldRow[]; records: string[][]; mappings: CsvField[]; onBack: () => void; onEditFields: () => void; onReplace: () => void; onContinue: (summary: { count: number; recipient: string; amount: string; currency: string }) => void }) {
  const [fixPanelOpen, setFixPanelOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [fixedRowIndexes, setFixedRowIndexes] = useState<number[]>([]);
  const [excludedRowIndexes, setExcludedRowIndexes] = useState<number[]>([]);
  const [currencyCorrections, setCurrencyCorrections] = useState<Record<number, string>>({});
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [layoutModalOpen, setLayoutModalOpen] = useState(false);
  const [layoutName, setLayoutName] = useState("Monthly contractor intake");
  const [layoutSaved, setLayoutSaved] = useState(false);
  const sourceRecords = records;
  const columnIndex = (field: CsvField) => mappings.findIndex((mapping) => mapping === field);
  const valueFor = (record: string[], field: CsvField) => {
    const recordIndex = sourceRecords.indexOf(record);
    if (field === "Currency" && currencyCorrections[recordIndex]) return currencyCorrections[recordIndex];
    const index = columnIndex(field);
    return index >= 0 ? record[index] || "—" : "—";
  };
  const requiredReviewFields: CsvField[] = ["Full name", "Email address", "Work country", "Pay amount", "Currency", "Pay basis"];
  const missingFieldsFor = (record: string[]) => requiredReviewFields.filter((field) => valueFor(record, field) === "—");
  const firstBadRowIndex = sourceRecords.findIndex((record, index) => !fixedRowIndexes.includes(index) && missingFieldsFor(record).length > 0);
  const goodRows = sourceRecords.filter((record, index) => fixedRowIndexes.includes(index) || missingFieldsFor(record).length === 0);
  const badRows = sourceRecords.filter((record, index) => !fixedRowIndexes.includes(index) && !excludedRowIndexes.includes(index) && missingFieldsFor(record).length > 0);
  const allReady = badRows.length === 0 && goodRows.length === sourceRecords.length;
  const displayFields: CsvField[] = ["Full name", "Email address", "Phone number", "Work country", "Pay amount", "Currency", "Pay basis", "Start date", "Project code"].filter((field) => mappings.includes(field));
  const skippedColumnNames = rows.filter((_, index) => mappings[index] === "Choose a field").map((row) => row.name);
  const skippedColumnText = skippedColumnNames.length ? skippedColumnNames.map((name) => `“${name}”`).join(", ") : "";
  const recordGridStyle = { gridTemplateColumns: `repeat(${displayFields.length}, minmax(104px, 1fr)) 92px` };
  const displayLabel = (field: CsvField) => field === "Full name" ? "Full name" : field;
  const renderTable = (tableRows: string[][], type: "good" | "bad") => (
    <div className={`csv-review-table csv-review-table-${type}`} role="table">
      <div className="csv-review-table-header" role="row">{displayFields.map((field) => <span key={field}>{displayLabel(field)}</span>)}<span>{type === "bad" ? "Problem" : "Status"}</span></div>
      {tableRows.map((record, index) => <div className="csv-review-table-row" role="row" key={`${type}-${index}`}>{displayFields.map((field) => <span key={field}>{valueFor(record, field)}</span>)}<strong>{type === "bad" ? `${missingFieldsFor(record).join(", ")} missing` : "Ready"}</strong></div>)}
      {type === "good" && mappings.some((field) => field === "Project code") ? <div className="csv-review-new-field-note"><span>New field</span><p>Project code will be saved on each contractor record.</p></div> : null}
    </div>
  );
  const renderContractorRecords = () => (
    <div className="csv-review-records-table" role="table">
      <div className="csv-review-records-header" role="row" style={recordGridStyle}>{displayFields.map((field) => <span key={field}>{displayLabel(field)}</span>)}<span>Status</span></div>
      {sourceRecords.map((record, index) => {
        const missing = missingFieldsFor(record);
        const fixed = fixedRowIndexes.includes(index);
        const excluded = excludedRowIndexes.includes(index);
        const needsAttention = missing.length > 0 && !fixed && !excluded;
        return (
          <div className={`csv-review-records-row${needsAttention ? " is-needs-attention" : ""}`} role="row" key={`record-${index}`} style={recordGridStyle}>
            {displayFields.map((field) => <span key={field}>{valueFor(record, field)}</span>)}
            <strong className={needsAttention ? "is-problem" : "is-ready"}>{needsAttention ? `Fix ${missing[0]?.toLowerCase() ?? "details"}` : excluded ? "Excluded" : "Ready"}</strong>
          </div>
        );
      })}
      {mappings.some((field) => field === "Project code") ? <div className="csv-review-new-field-note"><span>New field</span><p>Project code will be saved on each contractor record.</p></div> : null}
    </div>
  );

  return (
    <div className="bulk-import-page csv-review-page">
      <button className="bulk-import-back" type="button" aria-label="Back to field choices" onClick={onBack}><ArrowLeft aria-hidden="true" strokeWidth={1.9} /></button>
      <BulkImportProgress activeStep={1} />
      <header className="bulk-import-heading csv-review-heading"><h1>Review contractors</h1><p>Check the details from your CSV before continuing to Agreement.</p></header>
      {badRows.length ? <div className="csv-review-attention-banner"><div><strong>{badRows.length === 1 ? "One contractor needs attention" : `${badRows.length} contractors need attention`}</strong><span>Choose the missing details before continuing.</span></div><button type="button" onClick={() => { setFixPanelOpen(true); document.getElementById("csv-review-fix-section")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>Review row</button></div> : allReady ? <div className="csv-review-ready-banner"><div><strong>All {sourceRecords.length} contractors are ready</strong><span>{mappings.filter((field) => field !== "Choose a field").length} selected fields are shown below.{skippedColumnText ? ` ${skippedColumnText} ${skippedColumnNames.length === 1 ? "was" : "were"} skipped.` : " Check the details before continuing."}</span></div></div> : null}
      <section className="csv-review-records-card"><div className="csv-review-records-heading"><div><h2>Contractor records</h2><p>{"contractors.csv"} · {sourceRecords.length} rows · {mappings.filter((field) => field !== "Choose a field").length} fields selected{skippedColumnNames.length ? ` · ${skippedColumnNames.length} skipped` : ""}</p></div>{allReady ? layoutSaved ? <span className="csv-review-layout-saved">Layout saved</span> : <button className="csv-review-layout-button" type="button" onClick={() => setLayoutModalOpen(true)}>Save my layout</button> : null}</div>{renderContractorRecords()}{allReady && skippedColumnText ? <div className="csv-review-skipped-note">{skippedColumnText} {skippedColumnNames.length === 1 ? "was" : "were"} skipped. Its values will not be imported.</div> : null}</section>
      {allReady && layoutModalOpen ? <div className="csv-review-correction-backdrop" role="presentation"><div className="csv-review-layout-modal" role="dialog" aria-modal="true" aria-labelledby="save-layout-title">
        <h2 id="save-layout-title">Save my layout</h2>
        <p className="csv-review-layout-subtitle">Keep a blank copy of these column headings in your profile.</p>
        <label className="csv-review-currency-label" htmlFor="layout-name">Layout name</label>
        <input id="layout-name" className="csv-review-layout-input" value={layoutName} onChange={(event) => setLayoutName(event.target.value)} />
        <p className="csv-review-layout-help">Includes your headings and column order. Contractor records are left out.</p>
        <div className="csv-review-layout-actions"><button className="csv-review-exclude-button" type="button" onClick={() => setLayoutModalOpen(false)}>Cancel</button><button className="csv-review-save-button" type="button" onClick={() => { setLayoutSaved(true); setLayoutModalOpen(false); }}>Save layout</button></div>
      </div></div> : null}
      {badRows.length ? <section id="csv-review-fix-section" className="csv-review-fix-section" aria-label="Currency correction">{fixPanelOpen ? <div className="csv-review-correction-backdrop" role="presentation"><div className="csv-review-correction-modal" role="dialog" aria-modal="true" aria-labelledby="currency-correction-title">
        <h2 id="currency-correction-title">Choose contract currency</h2>
        <p className="csv-review-correction-meta">{firstBadRowIndex >= 0 ? valueFor(sourceRecords[firstBadRowIndex], "Full name") : "Contractor"} · Row {firstBadRowIndex + 2} in contractors.csv</p>
        <div className="csv-review-original-value"><span>Original CSV value</span><strong>{firstBadRowIndex >= 0 ? `${valueFor(sourceRecords[firstBadRowIndex], "Pay amount")} ${valueFor(sourceRecords[firstBadRowIndex], "Pay basis") === "—" ? "" : `per ${valueFor(sourceRecords[firstBadRowIndex], "Pay basis").toLowerCase()}`}` : "—"}</strong><p>The file includes an amount but no currency.</p></div>
        <label className="csv-review-currency-label" htmlFor="contract-currency">Contract currency</label>
        <select id="contract-currency" className="csv-review-currency-select" value={selectedCurrency} onChange={(event) => setSelectedCurrency(event.target.value)}>
          <option value="USD">USD · US dollar</option><option value="EUR">EUR · Euro</option><option value="GBP">GBP · Pound sterling</option><option value="ZAR">ZAR · South African rand</option><option value="KES">KES · Kenyan shilling</option><option value="TZS">TZS · Tanzanian shilling</option>
        </select>
        <p className="csv-review-updated-rate"><span>Updated rate</span> · {firstBadRowIndex >= 0 ? `${selectedCurrency} ${valueFor(sourceRecords[firstBadRowIndex], "Pay amount")} ${valueFor(sourceRecords[firstBadRowIndex], "Pay basis") === "—" ? "" : `per ${valueFor(sourceRecords[firstBadRowIndex], "Pay basis").toLowerCase()}`}` : "—"}</p>
        <div className="csv-review-correction-actions"><button className="csv-review-exclude-button" type="button" onClick={() => { if (firstBadRowIndex >= 0) setExcludedRowIndexes((current) => current.includes(firstBadRowIndex) ? current : [...current, firstBadRowIndex]); setFixPanelOpen(false); setActionMessage("The contractor was excluded from this import."); }}>Exclude row</button><button className="csv-review-save-button" type="button" onClick={() => { if (firstBadRowIndex >= 0) { setCurrencyCorrections((current) => ({ ...current, [firstBadRowIndex]: selectedCurrency })); setFixedRowIndexes((current) => current.includes(firstBadRowIndex) ? current : [...current, firstBadRowIndex]); } setFixPanelOpen(false); setActionMessage(""); }}>Save correction</button></div>
        <button className="csv-review-back-link" type="button" onClick={() => setFixPanelOpen(false)}>Back to review</button>
      </div></div> : null}</section> : null}
      <div className="csv-review-actions"><button className="csv-review-edit-button" type="button" onClick={onEditFields}>Edit field choices</button><span>{badRows.length ? `${badRows.length} detail${badRows.length === 1 ? "" : "s"} to resolve` : `${goodRows.length} contractors included`}</span><button className="csv-review-continue-button" type="button" disabled={!goodRows.length} onClick={() => onContinue({ count: goodRows.length, recipient: valueFor(goodRows[0], "Full name"), amount: valueFor(goodRows[0], "Pay amount"), currency: valueFor(goodRows[0], "Currency") })}>Continue to Agreement</button>{badRows.length ? <button className="csv-review-fix-button" type="button" onClick={() => { setFixPanelOpen(true); document.getElementById("csv-review-fix-section")?.scrollIntoView({ behavior: "smooth", block: "center" }); }}>Fix {badRows.length} row{badRows.length === 1 ? "" : "s"}</button> : null}</div>
      {actionMessage ? <p className="csv-review-action-message" role="status">{actionMessage}</p> : null}
    </div>
  );
}

function CsvFieldsPage({ fileName, rows, records, onBack, onReplace, onContinue }: { fileName: string; rows: CsvFieldRow[]; records: string[][]; onBack: () => void; onReplace: () => void; onContinue: (summary: { count: number; recipient: string; amount: string; currency: string }) => void }) {
  const [mappings, setMappings] = useState<CsvField[]>(() => rows.map((row) => suggestCsvField(row.name)));
  const [openMappingIndex, setOpenMappingIndex] = useState<number | null>(null);
  const [fieldSearch, setFieldSearch] = useState("");
  const [addFieldIndex, setAddFieldIndex] = useState<number | null>(null);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("Text");
  const [customFieldRows, setCustomFieldRows] = useState<number[]>([]);
  const [amountFormatOpen, setAmountFormatOpen] = useState(false);
  const [amountFormat, setAmountFormat] = useState("1,234.56 · Comma decimal");
  const [showReview, setShowReview] = useState(false);
  const selectedCount = mappings.filter((field) => field !== "Choose a field").length;
  const firstPayAmountIndex = mappings.findIndex((field) => field === "Pay amount");
  const availableFieldGroups = customFieldRows.length
    ? [...csvFieldGroups, { label: "My fields", fields: customFieldRows.map((index) => mappings[index]).filter((field) => field && field !== "Choose a field") }]
    : csvFieldGroups;
  const requiredFields: CsvField[] = ["Full name", "Email address", "Work country", "Pay amount", "Currency", "Pay basis"];
  const canReview = selectedCount === rows.length;
  if (showReview) return <ReviewRowsPage rows={rows} records={records} mappings={mappings} onBack={() => setShowReview(false)} onEditFields={() => setShowReview(false)} onReplace={onReplace} onContinue={onContinue} />;

  return (
    <div className="bulk-import-page csv-fields-page">
      <button className="bulk-import-back" type="button" aria-label="Back to import" onClick={onBack}>
        <ArrowLeft aria-hidden="true" strokeWidth={1.9} />
      </button>
      <BulkImportProgress />
      <header className="bulk-import-heading csv-fields-heading">
        <h1>Choose your CSV fields</h1>
        <p>Choose what each column means. Your selections will appear in Review.</p>
      </header>
      <section className="csv-fields-card" aria-labelledby="csv-fields-file-title">
        <div className="csv-fields-file-header">
          <div>
            <h2 id="csv-fields-file-title">{fileName}</h2>
            <p>{Math.max(1, rows.length - 1)} contractors · {rows.length} columns · Common fields are suggested. You can change them.</p>
          </div>
          <button type="button" onClick={onReplace}>Replace file</button>
        </div>
        <div className="csv-fields-table" role="table" aria-label="CSV field mappings">
          <div className="csv-fields-table-header" role="row">
            <span>Your CSV column</span><span>Sample value from CSV</span><span>Use as Rolla field</span><span>Read as</span>
          </div>
          {rows.map((row, index) => {
            const mapping = mappings[index];
            return (
              <div className="csv-fields-table-row" role="row" key={`${row.name}-${index}`}>
                <strong>{row.name}</strong>
                <span>{row.sample || "—"}</span>
                <div className="csv-fields-picker">
                  <button
                    className="csv-fields-picker-trigger"
                    type="button"
                    aria-label={`Map ${row.name}`}
                    aria-expanded={openMappingIndex === index}
                    onClick={() => { setOpenMappingIndex(openMappingIndex === index ? null : index); setFieldSearch(""); }}
                  >
                    <span>{mapping}</span><ChevronDown aria-hidden="true" />
                  </button>
                  {openMappingIndex === index ? (
                    <div className="csv-fields-picker-menu" role="listbox" aria-label={`Rolla fields for ${row.name}`}>
                      <label className="csv-fields-picker-search">
                        <Search aria-hidden="true" />
                        <input autoFocus value={fieldSearch} onChange={(event) => setFieldSearch(event.target.value)} placeholder="Search fields" />
                      </label>
                      <div className="csv-fields-picker-options">
                        {availableFieldGroups.map((group) => {
                          const visibleFields = group.fields.filter((field) => field.toLowerCase().includes(fieldSearch.toLowerCase()));
                          if (!visibleFields.length) return null;
                          return <div className="csv-fields-picker-group" key={group.label}><strong>{group.label}</strong>{visibleFields.map((field) => <button key={field} type="button" role="option" aria-selected={mapping === field} onClick={() => { setMappings((current) => current.map((value, itemIndex) => itemIndex === index ? field : value)); setOpenMappingIndex(null); }}>{field}{mappings.includes(field) && mapping !== field ? <small>Already selected</small> : null}</button>)}</div>;
                        })}
                      </div>
                      <div className="csv-fields-picker-actions">
                        <button className="csv-fields-picker-add" type="button" onClick={() => { setNewFieldName(rows[index].name === "Project" ? "Project code" : rows[index].name); setNewFieldType("Text"); setAddFieldIndex(index); setOpenMappingIndex(null); }}>Add a new field</button>
                        <button className="csv-fields-picker-skip" type="button" onClick={() => { setMappings((current) => current.map((value, itemIndex) => itemIndex === index ? "Choose a field" : value)); setOpenMappingIndex(null); }}>Skip this column</button>
                      </div>
                    </div>
                  ) : null}
                </div>
                <span className={mapping === "Choose a field" ? "csv-fields-unselected" : "csv-fields-tag"}>{readAsLabel(mapping)}</span>
                {customFieldRows.includes(index) ? <span className="csv-fields-new-field-tag">New field</span> : mapping === "Pay amount" && index === firstPayAmountIndex ? <button className="csv-fields-format-button" type="button" onClick={() => setAmountFormatOpen(true)}>Format</button> : null}
              </div>
            );
          })}
        </div>
        <div className="csv-fields-footer">
          <span>Required fields selected · {requiredFields.filter((field) => mappings.includes(field)).join(", ") || "None"}</span>
          <div><button className="csv-fields-back-button" type="button" onClick={onBack}>Back</button><span>{selectedCount} of {rows.length} fields selected</span><button className="csv-fields-review-button" type="button" disabled={!canReview} onClick={() => setShowReview(true)}>Review contractors</button></div>
        </div>
      </section>
      {addFieldIndex !== null ? (
        <div className="csv-fields-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setAddFieldIndex(null); }}>
          <section className="csv-fields-add-modal" role="dialog" aria-modal="true" aria-labelledby="csv-fields-add-title">
            <h2 id="csv-fields-add-title">Add a new field</h2>
            <p className="csv-fields-add-modal-description">Keep the values from “{rows[addFieldIndex].name}” on your contractor record.</p>
            <label>Field name<input value={newFieldName} onChange={(event) => setNewFieldName(event.target.value)} autoFocus /></label>
            <label>Read this field as<select value={newFieldType} onChange={(event) => setNewFieldType(event.target.value)}><option>Text</option><option>Number</option><option>Money</option><option>Date</option><option>Email</option><option>Phone number</option><option>Yes / No</option></select></label>
            <div className="csv-fields-add-sample"><span>Sample value</span><strong>{rows[addFieldIndex].sample || "—"}</strong></div>
            <p className="csv-fields-add-note">This field stores extra information. It does not change pay calculations.</p>
            <div className="csv-fields-add-actions"><button type="button" onClick={() => setAddFieldIndex(null)}>Cancel</button><button type="button" disabled={!newFieldName.trim()} onClick={() => { const fieldName = newFieldName.trim() as CsvField; setMappings((current) => current.map((value, index) => index === addFieldIndex ? fieldName : value)); setCustomFieldRows((current) => current.includes(addFieldIndex) ? current : [...current, addFieldIndex]); setAddFieldIndex(null); }}>Add field</button></div>
          </section>
        </div>
      ) : null}
      {amountFormatOpen ? (
        <div className="csv-fields-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setAmountFormatOpen(false); }}>
          <section className="csv-fields-format-modal" role="dialog" aria-modal="true" aria-labelledby="csv-fields-format-title">
            <h2 id="csv-fields-format-title">Read the amount correctly</h2>
            <p className="csv-fields-format-description">Choose the number format used in the “Amount” column.</p>
            <label className="csv-fields-format-label">Number format<select value={amountFormat} onChange={(event) => setAmountFormat(event.target.value)}><option>1,234.56 · Comma decimal</option><option>1.234,56 · Point decimal</option><option>1 234,56 · Space decimal</option></select></label>
            <div className="csv-fields-format-preview"><div><span>From your CSV</span><strong>{rows[firstPayAmountIndex]?.sample || "2,500.00"}</strong></div><div><span>In Review</span><strong>{amountFormat.startsWith("1.234") ? "EUR 2.500,00" : amountFormat.startsWith("1 234") ? "EUR 2 500,00" : "EUR 2,500.00"}</strong></div></div>
            <p className="csv-fields-format-note">Applies only to this column. Values that do not fit this format will be flagged in Review.</p>
            <div className="csv-fields-format-actions"><button type="button" onClick={() => setAmountFormatOpen(false)}>Cancel</button><button type="button" onClick={() => setAmountFormatOpen(false)}>Use this format</button></div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function SavedLayoutPage({ onBack }: { onBack: () => void }) {
  const downloadBlankCsv = () => {
    const csv = `${savedLayoutColumns.join(",")}\n`;
    const blobUrl = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = "monthly-contractor-intake.csv";
    link.click();
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className="bulk-import-page saved-layout-page">
      <button className="bulk-import-back" type="button" aria-label="Back to import" onClick={onBack}>
        <ArrowLeft aria-hidden="true" strokeWidth={1.9} />
      </button>
      <BulkImportProgress />
      <header className="bulk-import-heading saved-layout-heading">
        <h1>My saved layout</h1>
        <p>Use your private layout for your next contractor import.</p>
      </header>
      <section className="saved-layout-card" aria-labelledby="saved-layout-title">
        <div className="saved-layout-card-heading">
          <h2 id="saved-layout-title">Monthly contractor intake</h2>
          <span>Private</span>
        </div>
        <p className="saved-layout-description">Blank CSV with your original headings and column order.</p>
        <div className="saved-layout-columns">
          <strong>Included columns</strong>
          <p>{savedLayoutColumns.join(", ")}</p>
        </div>
        <div className="saved-layout-actions">
          <button className="saved-layout-back-button" type="button" onClick={onBack}>Back to import</button>
          <button className="saved-layout-download-button" type="button" onClick={downloadBlankCsv}>Download blank CSV</button>
        </div>
      </section>
    </div>
  );
}

function BulkImportPage({ onBack, onContinue }: { onBack: () => void; onContinue: (summary: { count: number; recipient: string; amount: string; currency: string }) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [reading, setReading] = useState(false);
  const [fileRead, setFileRead] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [showLayout, setShowLayout] = useState(false);
  const [csvRows, setCsvRows] = useState<CsvFieldRow[]>([]);
  const [csvRecords, setCsvRecords] = useState<string[][]>([]);

  const acceptFile = (file?: File) => {
    if (!file) return;
    setReading(false);
    setFileRead(false);
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setFileName("");
      setError("Please choose a CSV file.");
      setCsvRows([]);
      setCsvRecords([]);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileName("");
      setError("The CSV file must be 5 MB or smaller.");
      setCsvRows([]);
      setCsvRecords([]);
      return;
    }
    setError("");
    setFileName(file.name);
    setReading(true);
    window.setTimeout(async () => {
      try {
        const text = await file.text();
        const rows = text.split(/\r?\n/).map((row) => row.trim());
        const headerRowIndex = rows.findIndex(Boolean);
        const firstHeadings = rows[headerRowIndex]?.split(",").map((cell) => cell.trim().replace(/^"|"$/g, "")) ?? [];
        const secondTableIndex = rows.findIndex((row, index) => index > headerRowIndex && Boolean(row) && (() => {
          const cells = row.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""));
          return cells.length === firstHeadings.length && cells.length > 1 && cells.every((cell) => /[a-z]/i.test(cell) && !/[\d@]/.test(cell));
        })());
        const secondHeadings = secondTableIndex > -1 ? rows[secondTableIndex].split(",").map((cell) => cell.trim().replace(/^"|"$/g, "")) : [];
        const hasSecondTable = secondHeadings.length > 0 && secondHeadings.some((heading) => !firstHeadings.some((first) => first.toLowerCase() === heading.toLowerCase()));
        if (!text.trim() || !firstHeadings.length) {
          setError("We couldn’t read this file");
          setFileRead(false);
        } else if (hasSecondTable) {
          setError(`We couldn’t read this file|Export each table as a separate CSV and try again.|Row ${secondTableIndex + 1} starts a second table with different headings.`);
          setFileRead(false);
        } else {
          const sampleCells = rows[headerRowIndex + 1]?.split(",").map((cell) => cell.trim().replace(/^"|"$/g, "")) ?? [];
          setCsvRows(firstHeadings.map((heading, index) => ({ name: heading || `Column ${index + 1}`, sample: sampleCells[index] ?? "" })));
          setCsvRecords(rows.slice(headerRowIndex + 1).filter(Boolean).map((row) => row.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""))).filter((record) => record.some(Boolean)));
          setFileRead(true);
        }
      } catch {
        setError("We couldn’t read this file");
        setFileRead(false);
      } finally {
        setReading(false);
      }
    }, 1200);
  };

  if (showLayout) return <SavedLayoutPage onBack={() => setShowLayout(false)} />;
  if (fileRead) return <CsvFieldsPage fileName={fileName} rows={csvRows} records={csvRecords} onBack={() => setFileRead(false)} onReplace={() => { setFileRead(false); setFileName(""); setCsvRows([]); setCsvRecords([]); fileInputRef.current?.click(); }} onContinue={onContinue} />;

  return (
    <div className="bulk-import-page">
      <button className="bulk-import-back" type="button" aria-label="Back to contractor type" onClick={onBack}>
        <ArrowLeft aria-hidden="true" strokeWidth={1.9} />
      </button>
      <BulkImportProgress />
      <header className="bulk-import-heading">
        <h1>Import contractors</h1>
        <p>Add your contractor list using a CSV from Excel or Google Sheets.</p>
      </header>
      <section className="bulk-import-file-card" aria-labelledby="bulk-import-file-title">
        <div className="bulk-import-card-heading">
          <h2 id="bulk-import-file-title">Contractor file</h2>
          <span>CSV · Up to 5 MB</span>
        </div>
        <div
          className={`bulk-import-dropzone${dragging ? " is-dragging" : ""}${fileName ? " has-file" : ""}${error ? " has-error" : ""}${reading ? " is-reading" : ""}`}
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => { event.preventDefault(); setDragging(false); acceptFile(event.dataTransfer.files[0]); }}
        >
          {reading ? (
            <div className="bulk-import-reading-state" role="status" aria-live="polite">
              <strong>Reading {fileName}</strong>
              <p>Reading your column headings and sample values.</p>
              <div className="bulk-import-reading-track" aria-label="Reading CSV file"><span /></div>
              <p className="bulk-import-reading-next">Next, choose the fields you want to include.</p>
            </div>
          ) : error ? (
            <div className="bulk-import-invalid-state" role="alert">
              <strong>{error.split("|")[0]}</strong>
              <p>{error.split("|")[1] || "Export each table as a separate CSV and try again."}</p>
              {error.split("|")[2] ? <span>{error.split("|")[2]}</span> : null}
              <button className="bulk-import-choose-button" type="button" onClick={() => fileInputRef.current?.click()}>Choose another CSV</button>
            </div>
          ) : fileRead ? (
            <div className="bulk-import-read-success" role="status">
              <span className="bulk-import-upload-icon"><Check aria-hidden="true" /></span>
              <strong>{fileName}</strong>
              <p>File read successfully.</p>
              <button className="bulk-import-choose-button" type="button" onClick={() => fileInputRef.current?.click()}>Choose another CSV</button>
            </div>
          ) : (
            <>
              <span className="bulk-import-upload-icon"><Upload aria-hidden="true" /></span>
              <strong>Drop your CSV here</strong>
              <p>Use your own column names, order and language.</p>
              <button className="bulk-import-choose-button" type="button" onClick={() => fileInputRef.current?.click()}>Choose CSV</button>
            </>
          )}
          <input ref={fileInputRef} className="bulk-import-file-input" type="file" accept=".csv,text/csv" onChange={(event) => acceptFile(event.target.files?.[0])} />
        </div>
        {!reading && !error && !fileRead ? <p className="bulk-import-hint"><CircleHelp aria-hidden="true" />Choose how your CSV columns are read before reviewing them.</p> : null}
      </section>
      <section className={`bulk-import-layout-card${showLayout ? " is-expanded" : ""}`}>
        <div className="bulk-import-layout-copy">
          <strong>My saved layout</strong>
          <span>Monthly contractor intake <i aria-hidden="true">·</i> Blank CSV</span>
        </div>
        <button type="button" className="bulk-import-layout-button" onClick={() => setShowLayout(true)}>View layout</button>
      </section>
    </div>
  );
}

function FormField({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`onboarding-field ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function TextInput({ value, placeholder, type = "text", onChange }: { value?: string; placeholder?: string; type?: string; onChange?: React.ChangeEventHandler<HTMLInputElement> }) {
  return <input className="onboarding-input" type={type} defaultValue={onChange ? undefined : value} value={onChange ? value : undefined} onChange={onChange} placeholder={placeholder} />;
}

function DateInput({ value = "" }: { value?: string }) {
  const [dateValue, setDateValue] = useState(value);
  const displayValue = dateValue ? new Intl.DateTimeFormat("en-GB").format(new Date(`${dateValue}T00:00:00`)) : "";

  return (
    <div className="date-input">
      <input className="onboarding-input date-display-input" value={displayValue} placeholder="DD/MM/YYYY" readOnly aria-label="Date" />
      <input className="date-picker-input" type="date" value={dateValue} onChange={(event) => setDateValue(event.target.value)} aria-label="Choose date" />
      <CalendarDays aria-hidden="true" />
    </div>
  );
}

function SelectInput({ value, children, onChange, includeCurrent = true, leading }: { value: string; children?: React.ReactNode; onChange?: React.ChangeEventHandler<HTMLSelectElement>; includeCurrent?: boolean; leading?: React.ReactNode }) {
  return (
    <span className="onboarding-select-wrap">
      {leading ? <span className="onboarding-select-leading" aria-hidden="true">{leading}</span> : null}
      <select className={`onboarding-input onboarding-select${leading ? " has-leading" : ""}`} defaultValue={onChange ? undefined : value} value={onChange ? value : undefined} onChange={onChange}>
        {includeCurrent ? <option>{value}</option> : null}
        {children}
      </select>
      <ChevronDown aria-hidden="true" />
    </span>
  );
}

const countryOptions = Country.getAllCountries().map((country) => ({
  code: country.isoCode.toLowerCase(),
  name: country.name,
  dialCode: `+${country.phonecode}`,
}));

function CountryFlag({ code, className = "" }: { code: string; className?: string }) {
  return <img className={`country-flag-image ${className}`} src={`https://flagcdn.com/w20/${code}.png`} alt="" aria-hidden="true" />;
}

function CountrySelect({ initialCode = "ca", selectedCode: controlledCode, onChange }: { initialCode?: string; selectedCode?: string; onChange?: (code: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [internalCode, setInternalCode] = useState(initialCode);
  const selectedCode = controlledCode ?? internalCode;
  const selectedCountry = countryOptions.find((country) => country.code === selectedCode) ?? countryOptions[0];

  return (
    <span className="country-select-wrap">
      <button className="country-select-trigger" type="button" aria-haspopup="listbox" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}>
        <span>{selectedCountry.name}</span>
        <ChevronDown aria-hidden="true" />
      </button>
      {isOpen ? (
        <span className="country-select-menu" role="listbox" aria-label="Country">
          {countryOptions.map((country) => (
            <button
              className={`country-select-option${country.code === selectedCountry.code ? " is-selected" : ""}`}
              type="button"
              role="option"
              aria-selected={country.code === selectedCountry.code}
              key={country.code}
              onClick={() => {
                setInternalCode(country.code);
                onChange?.(country.code);
                setIsOpen(false);
              }}
            >
              <span>{country.name}</span>
              <small>{country.dialCode}</small>
            </button>
          ))}
        </span>
      ) : null}
    </span>
  );
}

function PhoneCountryPicker({ onChange }: { onChange?: (country: { code: string; name: string; dialCode: string }) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState("ca");
  const selectedCountry = countryOptions.find((country) => country.code === selectedCode) ?? countryOptions[0];

  return (
    <span className="phone-country-picker">
      <button className="phone-country" type="button" aria-haspopup="listbox" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}>
        <CountryFlag code={selectedCountry.code} />
        <ChevronDown aria-hidden="true" />
      </button>
      {isOpen ? (
        <span className="phone-country-menu" role="listbox" aria-label="Phone country">
          {countryOptions.map((country) => (
            <button
              className={`country-select-option${country.code === selectedCountry.code ? " is-selected" : ""}`}
              type="button"
              role="option"
              aria-selected={country.code === selectedCountry.code}
              key={country.code}
              onClick={() => {
                setSelectedCode(country.code);
                onChange?.(country);
                setIsOpen(false);
              }}
            >
              <CountryFlag code={country.code} />
              <span>{country.name}</span>
              <small>{country.dialCode}</small>
            </button>
          ))}
        </span>
      ) : null}
      <span className="phone-prefix">{selectedCountry.dialCode}</span>
    </span>
  );
}

function PersonalDetailsForm({ onBack, onContinue }: { onBack: () => void; onContinue: (values: string[]) => void }) {
  const [residenceCountryCode, setResidenceCountryCode] = useState("ca");
  const [phoneCountry, setPhoneCountry] = useState(countryOptions.find((country) => country.code === "ca") ?? countryOptions[0]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nationality, setNationality] = useState("Canada");
  const [stateProvince, setStateProvince] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const residenceRegions = State.getStatesOfCountry(residenceCountryCode.toUpperCase()).map((state) => state.name);
  const stateOptions = residenceRegions.length > 0 ? residenceRegions : ["State/Province"];
  const residenceCountry = countryOptions.find((country) => country.code === residenceCountryCode)?.name ?? "";
  const handleContinue = () => {
    if (!fullName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || !phoneNumber.trim() || !nationality || !residenceCountry || !stateProvince) {
      setValidationMessage("Complete all required personal details before continuing.");
      return;
    }
    setValidationMessage("");
    onContinue([fullName.trim(), email.trim(), phoneNumber.trim(), nationality, residenceCountry, stateProvince, phoneCountry.name]);
  };

  return (
    <div className="onboarding-page">
      <button className="onboarding-back" type="button" aria-label="Back to Team" onClick={onBack}>
        <ArrowLeft aria-hidden="true" strokeWidth={1.9} />
      </button>
      <OnboardingProgress activeStep={0} />
      <div className="onboarding-heading">
        <h1>Contractor Details</h1>
        <p>Add basic information to create their profile</p>
      </div>
      <div className="onboarding-form personal-form">
        <FormField label="Full Name"><TextInput value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="John Doe" /></FormField>
        <FormField label="Email Address"><TextInput value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="Johndoe@gmail.com" /></FormField>
        <FormField label="Phone Number">
          <div className="phone-input"><PhoneCountryPicker onChange={setPhoneCountry} /><TextInput value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="7010203040" /></div>
        </FormField>
        <FormField label="Nationality"><CountrySelect initialCode="ca" onChange={(code) => setNationality(countryOptions.find((country) => country.code === code)?.name ?? "")} /></FormField>
        <FormField label="Country of Residence"><CountrySelect selectedCode={residenceCountryCode} onChange={(code) => { setResidenceCountryCode(code); setStateProvince(""); }} /></FormField>
        <FormField label="State/Province">
          <SelectInput key={residenceCountryCode} value={stateProvince} includeCurrent={false} onChange={(event) => setStateProvince(event.target.value)}>
            <option value="">Select state/province</option>
            {stateOptions.map((region) => <option key={region}>{region}</option>)}
          </SelectInput>
        </FormField>
      </div>
      {validationMessage ? <p className="onboarding-validation-error" role="alert">{validationMessage}</p> : null}
      <div className="onboarding-actions">
        <button className="onboarding-secondary" type="button" onClick={onBack}>Cancel</button>
        <button className="onboarding-primary" type="button" onClick={handleContinue}>Continue</button>
      </div>
    </div>
  );
}

function BusinessDetailsForm({ onBack, onContinue }: { onBack: () => void; onContinue: (values: string[]) => void }) {
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [businessNumber, setBusinessNumber] = useState("");
  const [phoneCountry, setPhoneCountry] = useState(countryOptions.find((country) => country.code === "ca") ?? countryOptions[0]);
  const [validationMessage, setValidationMessage] = useState("");
  const isValid = businessName.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) && businessNumber.trim().length > 0;
  const handleContinue = () => {
    if (!isValid) {
      setValidationMessage("Enter a business name, a valid email address, and a business number to continue.");
      return;
    }
    setValidationMessage("");
    onContinue([businessName.trim(), email.trim(), businessNumber.trim(), phoneCountry.name]);
  };
  return (
    <div className="onboarding-page business-onboarding-page">
      <button className="onboarding-back" type="button" aria-label="Back to contractor type" onClick={onBack}>
        <ArrowLeft aria-hidden="true" strokeWidth={1.9} />
      </button>
      <OnboardingProgress activeStep={0} />
      <div className="onboarding-heading">
        <h1>Contractor Details</h1>
        <p>Add basic information to create their profile</p>
      </div>
      <div className="onboarding-form business-details-form">
        <FormField label="Business Name"><TextInput value={businessName} onChange={(event) => setBusinessName(event.target.value)} placeholder="Makena ltd" /></FormField>
        <FormField label="Email Address"><TextInput value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="hello@makena.com" /></FormField>
        <FormField label="Business Number">
          <div className="phone-input"><PhoneCountryPicker onChange={setPhoneCountry} /><TextInput value={businessNumber} onChange={(event) => setBusinessNumber(event.target.value)} type="tel" placeholder="7010203040" /></div>
        </FormField>
      </div>
      {validationMessage ? <p className="onboarding-validation-error" role="alert">{validationMessage}</p> : null}
      <div className="onboarding-actions business-details-actions">
        <button className="onboarding-secondary" type="button" onClick={onBack}>Cancel</button>
        <button className="onboarding-primary" type="button" onClick={handleContinue}>Continue</button>
      </div>
    </div>
  );
}

function ContractDetailsForm({ onBack, onContinue }: { onBack: () => void; onContinue: (values: string[]) => void }) {
  const [engagementType, setEngagementType] = useState("Fixed Term");
  const [documentName, setDocumentName] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState("");
  const isFixedTerm = engagementType === "Fixed Term";
  const handleContinue = () => {
    const values = collectReviewValues(".contract-form .onboarding-input");
    if (values.some((value) => value.length === 0)) {
      setValidationMessage("Complete all required contract details before continuing. Documents and other fields marked optional can be left blank.");
      return;
    }
    setValidationMessage("");
    onContinue(values);
  };

  return (
    <div className="onboarding-page contract-details-page">
      <button className="onboarding-back" type="button" aria-label="Back to Personal Details" onClick={onBack}>
        <ArrowLeft aria-hidden="true" strokeWidth={1.9} />
      </button>
      <OnboardingProgress activeStep={1} />
      <div className="onboarding-heading contract-heading">
        <h1>Contract Details</h1>
        <p>Enter the job-related information for this employee.</p>
      </div>
      <div className="onboarding-form contract-form">
        <section className="onboarding-section">
          <FormField label="Job Title/Service Provided"><TextInput placeholder="Product Designer" /></FormField>
          <FormField label="Department"><TextInput placeholder="Design" /></FormField>
          <FormField label="Manager"><TextInput placeholder="John Smith" /></FormField>
          <FormField label="Scope of Work"><TextInput placeholder="Describe the scope of work" /></FormField>
        </section>
        <section className="onboarding-section engagement-details-section">
          <h2>Engagement Details</h2>
          <div className="document-row">
            <div><strong>{documentName ?? "File"}</strong><span>{documentName ? "Document selected" : "JPG, PNG or PDF (max 5MB)"}</span></div>
            <label className="document-import"><Upload aria-hidden="true" /> {documentName ? "Replace Document" : "Import Document"}<input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={(event) => setDocumentName(event.target.files?.[0]?.name ?? null)} /></label>
          </div>
          <FormField label=""><SelectInput value={engagementType} includeCurrent={false} onChange={(event) => setEngagementType(event.target.value)}>
            <option>Fixed Term</option>
            <option>Ongoing engagement</option>
            <option>Project Based</option>
          </SelectInput></FormField>
          <div className="date-grid">
            <FormField label="Start Date"><DateInput /></FormField>
            {isFixedTerm ? <FormField label="End Date"><DateInput /></FormField> : null}
          </div>
          {!isFixedTerm ? (
            <FormField label="Project Name or Deliverable"><TextInput placeholder="Design" /></FormField>
          ) : null}
          {!isFixedTerm ? (
            <FormField label="Expected Completion Date"><DateInput /></FormField>
          ) : null}
          <FormField label="Notice Period"><SelectInput value="10 Days"><option>5 Days</option><option>15 Days</option><option>30 Days</option><option>60 Days</option></SelectInput></FormField>
        </section>
      </div>
      {validationMessage ? <p className="onboarding-validation-error" role="alert">{validationMessage}</p> : null}
      <div className="onboarding-actions contract-actions">
        <button className="onboarding-secondary" type="button" onClick={onBack}>Back</button>
        <button className="onboarding-primary" type="button" onClick={handleContinue}>Continue</button>
      </div>
    </div>
  );
}

function ContractorOnboardingPage({ onExit, onPersonal, onPayment, initialStep = "personal", business = false }: { onExit: () => void; onPersonal: (values: string[]) => void; onPayment: (values: string[]) => void; initialStep?: "personal" | "contract"; business?: boolean }) {
  const [step, setStep] = useState<"personal" | "contract">(initialStep);
  return step === "personal" ? (business ?
    <BusinessDetailsForm onBack={onExit} onContinue={(values) => { onPersonal(values); setStep("contract"); }} />
    : <PersonalDetailsForm onBack={onExit} onContinue={(values) => { onPersonal(values); setStep("contract"); }} />
  ) : (
    <ContractDetailsForm onBack={() => setStep("personal")} onContinue={onPayment} />
  );
}

function PaymentOptionCard({ icon: Icon, title, description, selected, onSelect }: { icon: LucideIcon; title: string; description: string; selected: boolean; onSelect: () => void }) {
  return (
    <button className={`payment-option-card${selected ? " is-selected" : ""}`} type="button" onClick={onSelect}>
      <Icon className="payment-option-icon" aria-hidden="true" strokeWidth={1.8} />
      <strong>{title}</strong>
      <p>{description}</p>
    </button>
  );
}

function PaymentSummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="payment-summary-row">
      <span><CircleHelp aria-hidden="true" />{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
function PaymentRateInput() {
  const [currency, setCurrency] = useState("CAD");
  return (
    <div className="payment-rate-input">
      <label className="payment-rate-currency">
        <select aria-label="Pay rate currency" value={currency} onChange={(event) => setCurrency(event.target.value)}>
          <option>CAD</option>
          <option>USD</option>
          <option>EUR</option>
          <option>GBP</option>
        </select>
        <ChevronDown aria-hidden="true" />
      </label>
      <TextInput value="120,000" />
    </div>
  );
}
function PaymentScheduleDetails({ paymentDue, paymentDueSummary = paymentDue }: { paymentDue: string; paymentDueSummary?: string }) {
  return (
    <>
      <FormField label="Pay Rate" className="pay-rate-field">
        <PaymentRateInput />
      </FormField>
      <FormField label="Pay Frequency" className="pay-frequency-field"><SelectInput value="Monthly"><option>Weekly</option><option>Bi-weekly</option></SelectInput></FormField>
      <FormField label="Invoice Cycle" className="invoice-cycle-field">
        <SelectInput value="Last day of the month"><option>First day of the month</option></SelectInput>
        <small>Cycle runs from 1st - last day of the month</small>
      </FormField>
      <FormField label="Payment Due" className="payment-due-field">
        <SelectInput value={paymentDue}>
          {paymentDue === "Same day" ? (
            <><option>Net 15</option><option>Net 30</option></>
          ) : (
            <><option>Same day</option><option>Net 15</option><option>Net 30</option></>
          )}
        </SelectInput>
      </FormField>
      <FormField label="First Payment Date" className="first-payment-field">
        <small>Determine when contractor get first payment</small>
        <DateInput />
        <div className="payment-summary-list">
          <PaymentSummaryRow label="Cycle start date" value="1st, May 2026" />
          <PaymentSummaryRow label="Cycle end date" value="30th, May 2026" />
          <PaymentSummaryRow label="Payment Due" value={paymentDueSummary} />
        </div>
      </FormField>
    </>
  );
}

function FixedRatePaymentDetails() {
  const [amountMode, setAmountMode] = useState<"calculated" | "full" | "custom">("calculated");

  return (
    <div className="fixed-rate-details">
      <PaymentScheduleDetails paymentDue="Same day" paymentDueSummary="Same Day" />
      <div className="first-payment-amount">
        <div className="amount-tabs">
          <button className={amountMode === "calculated" ? "is-active" : ""} type="button" onClick={() => setAmountMode("calculated")}>Calculated Amount</button>
          <button className={amountMode === "full" ? "is-active" : ""} type="button" onClick={() => setAmountMode("full")}>Full Amount</button>
          <button className={amountMode === "custom" ? "is-active" : ""} type="button" onClick={() => setAmountMode("custom")}>Custom Amount</button>
        </div>
        {amountMode === "calculated" ? (
          <>
            <p>First payment is calculated from contractor’s start date to Invoice cycle end date</p>
            <div className="calculated-amount-row"><span><CircleHelp aria-hidden="true" />24 Working Days</span><strong>CAD 2000<small>1st May - 30th May 2026</small></strong></div>
          </>
        ) : amountMode === "full" ? (
          <div className="amount-tab-content full-amount-content">
            <p>The full amount will be paid on first payment.</p>
            <div className="calculated-amount-row full-amount-row"><strong>CAD 2,000</strong></div>
          </div>
        ) : (
          <div className="amount-tab-content custom-amount-content">
            <p>Enter the initial payment amount for the contractor here.</p>
            <PaymentRateInput />
          </div>
        )}
      </div>
    </div>
  );
}

function SubmitterPermission({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) {
  return (
    <div className="submitter-permission">
      <span>{label}</span>
      <button
        className={`submitter-toggle${enabled ? " is-on" : ""}`}
        type="button"
        role="switch"
        aria-label={`${label} can submit work`}
        aria-checked={enabled}
        onClick={onToggle}
      >
        <span />
      </button>
    </div>
  );
}

function PayAsYouGoPaymentDetails() {
  const [clientCanSubmit, setClientCanSubmit] = useState(true);
  const [contractorCanSubmit, setContractorCanSubmit] = useState(true);

  return (
    <div className="fixed-rate-details pay-as-you-go-details">
      <PaymentScheduleDetails paymentDue="5 days later" />
      <section className="submitter-settings" aria-labelledby="submitter-settings-heading">
        <h3 id="submitter-settings-heading">Who can submit work</h3>
        <div className="submitter-rows">
          <SubmitterPermission label="Client" enabled={clientCanSubmit} onToggle={() => setClientCanSubmit((value) => !value)} />
          <SubmitterPermission label="Contractor" enabled={contractorCanSubmit} onToggle={() => setContractorCanSubmit((value) => !value)} />
        </div>
      </section>
    </div>
  );
}

function PaymentPage({ onBack, onContinue }: { onBack: () => void; onContinue: (data: { type: string; fields: string[] }) => void }) {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState("");
  const isPayAsYouGo = selectedType === "Pay as you go";
  const handleContinue = () => {
    const fields = collectReviewValues(".payment-panel .onboarding-input");
    if (!selectedType || fields.some((value) => value.length === 0)) {
      setValidationMessage("Complete the required payment details, including the first payment date, before continuing.");
      return;
    }
    setValidationMessage("");
    onContinue({ type: selectedType, fields });
  };

  useEffect(() => {
    if (selectedType) {
      document.querySelector<HTMLElement>(".payment-content")?.scrollTo({ top: 0, behavior: "auto" });
    }
  }, [selectedType]);

  return (
    <div className="payment-page">
      <button className="onboarding-back payment-back" type="button" aria-label="Back to Contract Details" onClick={onBack}>
        <ArrowLeft aria-hidden="true" strokeWidth={1.9} />
      </button>
      <OnboardingProgress activeStep={2} />
      <div className="payment-heading">
        <h1>Payment</h1>
        <p>Manage contractor rates and payment cycle</p>
      </div>
      <section className={`payment-panel${selectedType ? " is-expanded" : ""}${isPayAsYouGo ? " is-pay-as-you-go" : ""}`}>
        <h2>Select contract type</h2>
        <div className="payment-options">
          <PaymentOptionCard
            icon={CircleDollarSign}
            title="Fixed rate"
            description="Consistent monthly payments for ongoing work"
            selected={selectedType === "Fixed rate"}
            onSelect={() => setSelectedType("Fixed rate")}
          />
          <PaymentOptionCard
            icon={Clock3}
            title="Pay as you go"
            description="Pay based on tasks, hours or days worked"
            selected={selectedType === "Pay as you go"}
            onSelect={() => setSelectedType("Pay as you go")}
          />
        </div>
        {selectedType === "Fixed rate" ? <FixedRatePaymentDetails /> : null}
        {isPayAsYouGo ? <PayAsYouGoPaymentDetails /> : null}
      </section>
      {selectedType ? (
        <>
          {validationMessage ? <p className="onboarding-validation-error" role="alert">{validationMessage}</p> : null}
          <div className={`payment-actions${isPayAsYouGo ? " is-pay-as-you-go" : ""}`}>
          <button className="onboarding-secondary" type="button" onClick={onBack}>Back</button>
            <button className="onboarding-primary" type="button" onClick={handleContinue}>Continue</button>
          </div>
        </>
      ) : null}
    </div>
  );
}

function AgreementTypeCard({
  icon: Icon,
  title,
  description,
  selected,
  onSelect,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button className={`agreement-type-card${selected ? " is-selected" : ""}`} type="button" aria-pressed={selected} onClick={onSelect}>
      <Icon className="agreement-type-icon" aria-hidden="true" strokeWidth={1.7} />
      <strong>{title}</strong>
      <span>{description}</span>
    </button>
  );
}

function AgreementUploadBox({ label, onFile }: { label: string; onFile: (name: string | null) => void }) {
  const [documentName, setDocumentName] = useState<string | null>(null);

  return (
    <label className="agreement-upload-box">
      <Upload aria-hidden="true" strokeWidth={1.7} />
      <strong>{documentName ?? label}</strong>
      <span>JPG, PNG or PDF (max 5MB)</span>
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.pdf"
        onChange={(event) => {
          const name = event.target.files?.[0]?.name ?? null;
          setDocumentName(name);
          onFile(name);
        }}
      />
    </label>
  );
}

function StandardAgreementDetails() {
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState<"file" | "link">("file");
  const [actionRequired, setActionRequired] = useState<"signed" | "acknowledge">("signed");
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [importedDocument, setImportedDocument] = useState<string | null>(null);

  return (
    <div className="agreement-details">
      <div className="agreement-document-heading">Rolla Agreement</div>
      <div className="agreement-document-row">
        <div className="agreement-document-name"><FileText aria-hidden="true" strokeWidth={1.7} /><strong>Rolla Standard Agreement</strong></div>
        <button className="agreement-preview-button" type="button"><Eye aria-hidden="true" strokeWidth={1.7} />Preview</button>
      </div>
      <FormField label="Contract Name (optional)">
        <small>This contract name will appear on the agreement</small>
        <TextInput placeholder="Product Design Contract" />
      </FormField>
      <FormField label="Special clause (optional)">
        <small>Add a special clause on the contract</small>
        <textarea className="onboarding-textarea" rows={4} />
      </FormField>
      <div className="agreement-upload-section">
        <div className="agreement-document-heading">Additional Documents</div>
        <small>Attach any additional document for the contract</small>
        {showDocumentForm ? (
          <div className="agreement-additional-document-form">
            <FormField label="Document Name">
              <TextInput value={documentName} placeholder="Employment Contract" />
            </FormField>
            <fieldset className="agreement-choice-group">
              <legend>Document</legend>
              <label><input type="radio" name="document-type" checked={documentType === "file"} onChange={() => setDocumentType("file")} />Import file</label>
              <label><input type="radio" name="document-type" checked={documentType === "link"} onChange={() => setDocumentType("link")} />Add a link</label>
            </fieldset>
            {documentType === "file" ? <AgreementUploadBox label="Import Document" onFile={setImportedDocument} /> : <TextInput placeholder="https://" />}
            <fieldset className="agreement-choice-group">
              <legend>Action Required</legend>
              <label><input type="radio" name="action-required" checked={actionRequired === "signed"} onChange={() => setActionRequired("signed")} />Import signed copy</label>
              <label><input type="radio" name="action-required" checked={actionRequired === "acknowledge"} onChange={() => setActionRequired("acknowledge")} />Acknowledge</label>
            </fieldset>
            <div className="agreement-import-actions">
              <button type="button" className="agreement-cancel-button" onClick={() => setShowDocumentForm(false)}>Cancel</button>
              <button type="button" className="agreement-import-button" onClick={() => setShowDocumentForm(false)}>Import</button>
            </div>
          </div>
        ) : null}
        {!showDocumentForm && !importedDocument ? <AgreementUploadBox label="Import Document" onFile={setImportedDocument} /> : null}
        {importedDocument ? (
          <div className="agreement-imported-document-row">
            <div>
              <strong>{importedDocument}</strong>
              <span>1.8MB PDF</span>
            </div>
            <button type="button" aria-label={`Remove ${importedDocument}`} onClick={() => { setImportedDocument(null); setShowDocumentForm(true); }}>×</button>
          </div>
        ) : null}
        <button className="agreement-add-document-button" type="button" onClick={() => setShowDocumentForm(true)}>+ Import Document</button>
      </div>
    </div>
  );
}

function ImportedAgreementDetails({ onFile }: { onFile: (name: string | null) => void }) {
  return (
    <div className="agreement-import-details">
      <div className="agreement-document-heading">Contract Agreement</div>
      <small>Import a signed copy of your contract Agreement</small>
      <AgreementUploadBox label="Import Document" onFile={onFile} />
      <FormField label="Contract Name (optional)">
        <small>This contract name will appear on the agreement</small>
        <TextInput placeholder="Product Design Contract" />
      </FormField>
      <div className="agreement-upload-section">
        <div className="agreement-document-heading">Additional Documents</div>
        <small>Attach any additional document for the contract</small>
        <AgreementUploadBox label="Import Document" onFile={() => undefined} />
      </div>
    </div>
  );
}

function CoverageCard({ kind, title, price, benefits, selected, onAdd }: { kind: "full" | "limited"; title: string; price: string; benefits: { text: string; included: boolean }[]; selected: boolean; onAdd: () => void }) {
  return (
    <article className={`coverage-card${selected ? " is-selected" : ""}`}>
      {kind === "full" ? <FileText className="coverage-icon" aria-hidden="true" /> : <Upload className="coverage-icon" aria-hidden="true" />}
      <h3>{title}</h3>
      <strong className="coverage-price">{price}</strong>
      <ul>
        {benefits.map((benefit) => (
          <li key={benefit.text} className={benefit.included ? "is-included" : "is-excluded"}>
            {benefit.included ? <Check aria-hidden="true" /> : <span aria-hidden="true">—</span>}
            {benefit.text}
          </li>
        ))}
      </ul>
      <button className="coverage-add-button" type="button" onClick={onAdd}>{selected ? "Added" : "Add Coverage"}</button>
      <button className="coverage-details-button" type="button">View Details</button>
    </article>
  );
}

function AgreementPage({ onBack, onContinue, bulk = false, inviteSummary = { count: 0, recipient: "", amount: "", currency: "" } }: { onBack: () => void; onContinue: (agreement: string) => void; bulk?: boolean; inviteSummary?: { count: number; recipient: string; amount: string; currency: string } }) {
  const [agreementType, setAgreementType] = useState<"standard" | "import" | null>(null);
  const [coverageStep, setCoverageStep] = useState(false);
  const [coverage, setCoverage] = useState<"full" | "limited" | null>(null);
  const [coverageModal, setCoverageModal] = useState<"full" | "limited" | null>(null);
  const [importedConfirm, setImportedConfirm] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [importedAgreementName, setImportedAgreementName] = useState<string | null>(null);
  const [validationMessage, setValidationMessage] = useState("");
  const selectedAgreementLabel = agreementType === "standard" ? "Rolla Standard Agreement" : "Import Agreement";
  const selectedCoverageLabel = coverage === "full" ? "Full coverage by Rolla" : coverage === "limited" ? "Coverage up to $25k" : "No coverage selected";
  const addedCoverageLabel = coverageModal === "full" ? "full coverage by Rolla" : "coverage up to $25k";

  const addCoverage = (kind: "full" | "limited") => {
    setCoverage(kind);
    setCoverageModal(kind);
  };

  useEffect(() => {
    document.querySelector<HTMLElement>(".payment-content")?.scrollTo({ top: 0, behavior: "auto" });
  }, [agreementType, coverageStep, coverage]);

  return (
    <div className="payment-page agreement-page">
      <button className="onboarding-back payment-back" type="button" aria-label="Back to Payment" onClick={onBack}><ArrowLeft aria-hidden="true" strokeWidth={1.9} /></button>
      {bulk ? <BulkImportProgress activeStep={2} /> : <OnboardingProgress activeStep={3} />}
      <div className="payment-heading agreement-heading">
        <h1>{coverageStep ? "Coverage" : "Agreement"}</h1>
        <p>{coverageStep ? "Want a extra piece of mind? Explore our coverage options" : "Ensure compliance by importing contractor agreements, and other required documents."}</p>
      </div>
      {!coverageStep ? (
        <section className="agreement-panel">
          <h2>Select Agreement type</h2>
          <div className="agreement-type-options">
            <AgreementTypeCard icon={FileText} title="Rolla Standard Agreement" description="Use Rolla’s localised agreement created by our legal team" selected={agreementType === "standard"} onSelect={() => setAgreementType("standard")} />
            <AgreementTypeCard icon={Upload} title="Import Agreement" description="Import a signed copy of your own agreement" selected={agreementType === "import"} onSelect={() => setAgreementType("import")} />
          </div>
          {agreementType === "standard" ? bulk ? <BulkStandardAgreementDetails onImport={() => setImportedConfirm(true)} /> : <StandardAgreementDetails /> : null}
          {agreementType === "import" ? <ImportedAgreementDetails onFile={(name) => { setImportedAgreementName(name); if (name) setValidationMessage(""); }} /> : null}
        </section>
      ) : (
        <section className="agreement-panel coverage-panel">
          <h2>Coverage options</h2>
          <div className="coverage-options">
            <CoverageCard
              kind="full"
              title="Full coverage by Rolla"
              price="$325.00"
              selected={coverage === "full"}
              onAdd={() => addCoverage("full")}
              benefits={[{ text: "Unlock global hiring", included: true }, { text: "Rolla acts as the Contractor of Records", included: true }, { text: "We assume full risk protection", included: true }, { text: "We manage full worker classification", included: true }]}
            />
            <CoverageCard
              kind="limited"
              title="Coverage up to $25k"
              price="$50.00"
              selected={coverage === "limited"}
              onAdd={() => addCoverage("limited")}
              benefits={[{ text: "Unlock global hiring", included: true }, { text: "Financial protection up to $25k", included: false }, { text: "Manages some misclassification cost", included: false }, { text: "You are the employer of records/client", included: false }]}
            />
          </div>
        </section>
      )}
      {!bulk && (coverageStep || agreementType) ? (
        <div className="payment-actions agreement-actions">
          <button className="onboarding-secondary" type="button" onClick={() => coverageStep ? setCoverageStep(false) : onBack()}>Back</button>
          <button className="onboarding-primary" type="button" onClick={() => {
            if (!coverageStep && agreementType === "import" && !importedAgreementName) {
              setValidationMessage("Import your signed agreement before continuing. Optional contract details can be left blank.");
              return;
            }
            setValidationMessage("");
            coverageStep ? onContinue(`${selectedAgreementLabel} — ${selectedCoverageLabel}`) : setCoverageStep(true);
          }}>Continue</button>
        </div>
      ) : null}
      {!bulk && validationMessage ? <p className="onboarding-validation-error agreement-validation-error" role="alert">{validationMessage}</p> : null}
      {coverageStep && coverageModal ? (
        <div className="coverage-confirm-overlay" role="presentation">
          <section className="coverage-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="coverage-confirm-title">
            <h2 id="coverage-confirm-title">Coverage Added</h2>
            <div className="coverage-confirm-check"><Check aria-hidden="true" /></div>
            <p>You have successfully added the {addedCoverageLabel}</p>
            <button className="coverage-confirm-done" type="button" onClick={() => setCoverageModal(null)}>Done</button>
          </section>
        </div>
      ) : null}
      {bulk && importedConfirm ? <div className="bulk-invite-overlay" role="presentation"><section className="bulk-imported-modal" role="dialog" aria-modal="true" aria-labelledby="bulk-imported-title"><h2 id="bulk-imported-title">Contractors Imported</h2><div className="bulk-imported-check"><Check aria-hidden="true" /></div><p>Would you like to send onboarding invitations to the contractors now?</p><div className="bulk-imported-actions"><button className="bulk-send-later" type="button" onClick={() => onContinue(selectedAgreementLabel)}>Send later</button><button className="bulk-invite-now" type="button" onClick={() => { setImportedConfirm(false); setInviteSent(true); }}>Invite</button></div></section></div> : null}
      {bulk && inviteSent ? <div className="bulk-invite-overlay" role="presentation"><section className="bulk-invite-modal" role="dialog" aria-modal="true" aria-labelledby="bulk-invite-title"><h2 id="bulk-invite-title">Onboarding Invite Sent</h2><div className="bulk-invite-check"><Check aria-hidden="true" /></div><p>You have successfully invited {inviteSummary.count} contractor{inviteSummary.count === 1 ? "" : "s"}</p><button type="button" onClick={() => onContinue(selectedAgreementLabel)}>Done</button></section></div> : null}
    </div>
  );
}

type ReviewData = {
  personal: string[];
  contract: string[];
  payment: { type: string; fields: string[] };
  agreement: string;
};

const emptyReviewData: ReviewData = {
  personal: [],
  contract: [],
  payment: { type: "", fields: [] },
  agreement: "",
};

function updateClientSigningUrl(enabled: boolean) {
  const url = new URL(window.location.href);
  if (enabled) url.searchParams.set("client-sign", "1");
  else url.searchParams.delete("client-sign");
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function getClientSigningUrl() {
  const url = new URL(window.location.href);
  url.searchParams.set("client-sign", "1");
  return url.toString();
}

async function copyTextToClipboard(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to the DOM copy method for browsers without clipboard permission.
  }

  const input = document.createElement("textarea");
  input.value = text;
  input.setAttribute("readonly", "");
  input.style.position = "fixed";
  input.style.opacity = "0";
  document.body.appendChild(input);
  input.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  input.remove();
  return copied;
}

function collectReviewValues(selector: string) {
  return Array.from(document.querySelectorAll<HTMLElement>(selector)).map((element) => {
    if ("value" in element) return String((element as HTMLInputElement | HTMLSelectElement).value).trim();
    return element.textContent?.trim() ?? "";
  });
}

function ContractSignaturePanel({ agreementLabel, fullName, onBack, onSigned, onSignatureCleared, compact = false }: { agreementLabel: string; fullName: string; onBack: () => void; onSigned: () => void; onSignatureCleared: () => void; compact?: boolean }) {
  const [signatureMode, setSignatureMode] = useState<"draw" | "type" | "upload">("draw");
  const [signerName, setSignerName] = useState(fullName);
  const [positionHeld, setPositionHeld] = useState("");
  const [typedSignature, setTypedSignature] = useState("");
  const [drawnSignatureDataUrl, setDrawnSignatureDataUrl] = useState<string | null>(null);
  const [uploadedSignature, setUploadedSignature] = useState<File | null>(null);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [signed, setSigned] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const bounds = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(bounds.width * ratio));
    canvas.height = Math.max(1, Math.floor(bounds.height * ratio));
    const context = canvas.getContext("2d");
    if (!context) return;
    context.scale(ratio, ratio);
    context.lineWidth = 2;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#363146";
  }, []);

  const getCanvasPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const bounds = canvas.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  };

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(event);
    const context = canvasRef.current?.getContext("2d");
    if (!point || !context) return;
    drawingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const drawSignature = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const point = getCanvasPoint(event);
    const context = canvasRef.current?.getContext("2d");
    if (!point || !context) return;
    context.lineTo(point.x, point.y);
    context.stroke();
    setHasDrawnSignature(true);
  };

  const stopDrawing = () => {
    drawingRef.current = false;
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (canvas && context) context.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
    setTypedSignature("");
    setDrawnSignatureDataUrl(null);
    setUploadedSignature(null);
    setSignatureMode("draw");
    setSigned(false);
    onSignatureCleared();
  };

  const signatureAvailable = signatureMode === "draw" ? hasDrawnSignature : signatureMode === "type" ? typedSignature.trim().length > 0 : uploadedSignature !== null;
  const canSign = signatureAvailable && consentAccepted;

  return (
    <section className={`review-signature-panel${compact && signed ? " is-bulk-signed" : ""}`}>
      {!compact ? <button className="review-signature-back" type="button" onClick={onBack}>
        <ArrowLeft aria-hidden="true" />
        Back to signatures
      </button> : null}
      <div className="review-document-bar">
        <span><FileText aria-hidden="true" /><strong>{agreementLabel}</strong></span>
        <button type="button">Preview</button>
      </div>
      <div className="review-signature-content">
        <h2>Review and sign</h2>
        <p>Complete the fields below to sign the agreement</p>
        {compact && signed ? <div className="bulk-signed-signature"><span>{signerName || "Full Name"}&nbsp; {positionHeld || "Position held"}</span><strong>{signatureMode === "draw" && drawnSignatureDataUrl ? <img src={drawnSignatureDataUrl} alt="Drawn signature" /> : typedSignature.trim() || signerName || "Signature"}</strong><button type="button" aria-label="Remove signature" onClick={clearSignature}>×</button></div> : null}
        {!compact ? <p className="signature-prototype-note" role="note">Prototype only: signatures and invites are not saved or sent.</p> : null}
        <div className="signature-fields">
          <FormField label="Full Name"><TextInput value={compact ? signerName : fullName} onChange={compact ? (event) => setSignerName(event.target.value) : undefined} placeholder="Full Name" /></FormField>
          <FormField label="Position Held"><TextInput value={compact ? positionHeld : undefined} onChange={compact ? (event) => setPositionHeld(event.target.value) : undefined} placeholder="Position held" /></FormField>
        </div>
        <div className="signature-box">
          <div className="signature-box-heading">
            <div><strong>Your signature</strong><small>Draw, type your name, or upload a signature.</small></div>
            <div className="signature-mode-actions">
              {!compact ? <label className="signature-upload-button">Upload signature<input type="file" accept="image/*" onChange={(event) => { setUploadedSignature(event.target.files?.[0] ?? null); setSignatureMode("upload"); }} /></label> : null}
              <button className={signatureMode === "draw" ? "is-active" : ""} type="button" onClick={() => setSignatureMode("draw")}>Draw</button>
              <button className={signatureMode === "type" ? "is-active" : ""} type="button" onClick={() => setSignatureMode("type")}>Type</button>
            </div>
          </div>
          {signatureMode === "type" ? <input className="onboarding-input signature-type-input" value={typedSignature} onChange={(event) => setTypedSignature(event.target.value)} placeholder="Type your signature" aria-label="Typed signature" /> : null}
          {signatureMode === "upload" ? <div className="signature-uploaded-name">{uploadedSignature?.name}</div> : null}
          {signatureMode === "draw" ? <canvas ref={canvasRef} className="signature-canvas is-active" aria-label="Signature drawing area" onPointerDown={startDrawing} onPointerMove={drawSignature} onPointerUp={stopDrawing} onPointerCancel={stopDrawing} /> : null}
          <button className="clear-signature-button" type="button" onClick={clearSignature}>Clear Signature</button>
        </div>
        <label className="signature-consent"><input type="checkbox" checked={consentAccepted} onChange={(event) => setConsentAccepted(event.target.checked)} /> <span>I confirm that I am authorized to sign on behalf of the Client and agree that this electronic signature is legally equivalent to my handwritten signature.</span></label>
        <button className={`agree-sign-button${signed ? " is-signed" : ""}`} type="button" disabled={!canSign || signed} onClick={() => { if (signatureMode === "draw" && canvasRef.current) setDrawnSignatureDataUrl(canvasRef.current.toDataURL("image/png")); setSigned(true); onSigned(); }}>{signed ? "Document Signed" : "Agree and Sign Document"}</button>
      </div>
    </section>
  );
}

function BulkStandardAgreementDetails({ onImport }: { onImport: () => void }) {
  return <><ContractSignaturePanel compact agreementLabel="Rolla Standard Agreement" fullName="" onBack={() => undefined} onSigned={() => undefined} onSignatureCleared={() => undefined} /><button className="bulk-import-contractors-button" type="button" onClick={onImport}>Import Contractors</button></>;
}

function SignatureStatusPanel({ email, clientSigned, onReviewAndSign, onInviteClient, onCopyLink, statusMessage }: { email: string; clientSigned: boolean; onReviewAndSign: () => void; onInviteClient: () => void; onCopyLink: () => void; statusMessage: string }) {
  return (
    <section className="review-signatures-panel" aria-labelledby="review-signatures-title">
      <div className="review-signatures-heading">
        <h2 id="review-signatures-title">Signatures</h2>
        <span className="pending-signatures-pill">Pending Signatures</span>
      </div>
      <article className="signature-party-card client-signature-card">
        <div className="signature-party-main-row">
          <span className="signature-party-number">1</span>
          <strong>Client Signature</strong>
          {clientSigned ? <span className="signature-recorded-label">Signed in this preview</span> : null}
          <button className="signature-action-button primary" type="button" onClick={onReviewAndSign}>Review &amp; Sign</button>
        </div>
        <div className="signature-party-email"><Mail aria-hidden="true" /><span>{email}</span></div>
      </article>
      <article className="signature-party-card employer-signature-card">
        <div className="signature-party-main-row">
          <span className="signature-party-number muted">2</span>
          <div className="signature-party-recipient"><strong>Client / Employer</strong><small>Not yet invited</small></div>
          <span className="signature-not-invited-pill">Not Invited</span>
          <button className="signature-action-button secondary" type="button" onClick={onInviteClient}>Invite Client</button>
        </div>
        <div className="signature-copy-row">
          <div className="signature-copy-label"><Copy aria-hidden="true" /><span><strong>Copy Signing Link</strong><small>Share this link with the client to sign the contract.</small></span></div>
          <button className="signature-action-button copy-link-button" type="button" onClick={onCopyLink}><Copy aria-hidden="true" />Copy Link</button>
        </div>
      </article>
      {statusMessage ? <p className="signature-status-feedback" role="status" aria-live="polite">{statusMessage}</p> : null}
    </section>
  );
}

function ReviewPage({ onBack, backLabel = "Back to Agreement", data = emptyReviewData, business = false, onInviteSent }: { onBack: () => void; backLabel?: string; data?: ReviewData; business?: boolean; onInviteSent?: () => void }) {
  const [showSignatureForm, setShowSignatureForm] = useState(() => new URLSearchParams(window.location.search).get("client-sign") === "1");
  const [clientSigned, setClientSigned] = useState(false);
  const [signatureNotice, setSignatureNotice] = useState("");
  const [inviteNotice, setInviteNotice] = useState(false);
  const displayValue = (value: string | undefined) => value || "Not provided";
  const personalValues = data.personal ?? [];
  const contractValues = data.contract ?? [];
  const payment = data.payment ?? emptyReviewData.payment;
  const agreementLabel = data.agreement?.split(" — ")[0] || "Rolla Standard Agreement";
  const signingEmail = personalValues[1] || "maya.chen@example.com";

  useEffect(() => {
    if (!signatureNotice) return;
    const timer = window.setTimeout(() => setSignatureNotice(""), 5000);
    return () => window.clearTimeout(timer);
  }, [signatureNotice]);

  const openSigningForm = () => {
    updateClientSigningUrl(true);
    setShowSignatureForm(true);
  };

  const backToSignatures = () => {
    updateClientSigningUrl(false);
    setShowSignatureForm(false);
  };

  const handlePageBack = () => {
    updateClientSigningUrl(false);
    onBack();
  };

  const copySigningLink = async (invite = false) => {
    const link = getClientSigningUrl();
    const copied = await copyTextToClipboard(link);
    setSignatureNotice(copied
      ? invite ? "Signing link copied. Share it with the client to invite them." : "Signing link copied."
      : `Clipboard unavailable. Copy this link manually: ${link}`);
  };

  return (
    <div className="payment-page review-page">
      <button className="onboarding-back payment-back" type="button" aria-label={backLabel} onClick={handlePageBack}>
        <ArrowLeft aria-hidden="true" strokeWidth={1.9} />
      </button>
      <OnboardingProgress activeStep={4} />
      <div className="payment-heading review-heading">
        <h1>Contract Review</h1>
        <p>Review contract terms and agreements to ensure accuracy</p>
      </div>
      {showSignatureForm ? (
        <ContractSignaturePanel
          agreementLabel={agreementLabel}
          fullName={personalValues[0] ?? ""}
          onBack={backToSignatures}
          onSigned={() => setClientSigned(true)}
          onSignatureCleared={() => setClientSigned(false)}
        />
      ) : (
        <>
          <div className="review-document-bar review-overview-document">
            <span><FileText aria-hidden="true" /><strong>{agreementLabel}</strong></span>
            <button type="button">Preview</button>
          </div>
          <SignatureStatusPanel
            email={signingEmail}
            clientSigned={clientSigned}
            onReviewAndSign={openSigningForm}
            onInviteClient={() => void copySigningLink(true)}
            onCopyLink={() => void copySigningLink()}
            statusMessage={signatureNotice}
          />
        </>
      )}
      <section className="review-panel">
        <h2>Review contractor details</h2>
        <div className="review-section">
          <div className="review-section-heading"><h3>Personal Details</h3></div>
          <div className="review-summary-row"><span>{business ? "Business Name" : "Full Name"}</span><strong>{displayValue(personalValues[0])}</strong></div>
          <div className="review-summary-row"><span>Email Address</span><strong>{displayValue(personalValues[1])}</strong></div>
          <div className="review-summary-row"><span>{business ? "Business Number" : "Phone Number"}</span><strong>{displayValue(personalValues[2])}</strong></div>
        </div>
        <div className="review-section">
          <div className="review-section-heading"><h3>Contract Details</h3></div>
          <div className="review-summary-row"><span>Job Title/Service</span><strong>{displayValue(contractValues[0])}</strong></div>
          <div className="review-summary-row"><span>Department</span><strong>{displayValue(contractValues[1])}</strong></div>
          <div className="review-summary-row"><span>Engagement</span><strong>{displayValue(contractValues[4])}</strong></div>
        </div>
        <div className="review-section">
          <div className="review-section-heading"><h3>Payment</h3></div>
          <div className="review-summary-row"><span>Payment Type</span><strong>{displayValue(payment.type)}</strong></div>
          <div className="review-summary-row"><span>First Payment Date</span><strong>{displayValue(payment.fields?.find((value) => value.includes("/")))}</strong></div>
        </div>
        <div className="review-section">
          <div className="review-section-heading"><h3>Agreement</h3></div>
          <div className="review-summary-row"><span>Agreement Type</span><strong>{displayValue(data.agreement)}</strong></div>
        </div>
      </section>
      <div className="payment-actions review-actions">
        <button className="onboarding-secondary" type="button" onClick={handlePageBack}>Save Draft</button>
        <button className="onboarding-primary" type="button" onClick={() => setInviteNotice(true)}>Send Onboarding Invite</button>
      </div>
      {inviteNotice ? (
        <div className="coverage-confirm-overlay" role="presentation">
          <section className="coverage-confirm-modal invite-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="invite-confirm-title">
            <h2 id="invite-confirm-title">Onboarding Invite Sent</h2>
            <div className="coverage-confirm-check"><Check aria-hidden="true" /></div>
            <p>The onboarding invite has been sent successfully.</p>
            <button className="coverage-confirm-done" type="button" onClick={() => { setInviteNotice(false); onInviteSent?.(); }}>Done</button>
          </section>
        </div>
      ) : null}
    </div>
  );
}

function BusinessIllustration({ selected = false }: { selected?: boolean }) {
  const columnColor = selected ? "#3C329D" : "#D0D0D0";
  const baseColor = selected ? "#3C329D" : "#7F7897";
  return (
    <svg className="hire-type-image business-illustration" width="110" height="105" viewBox="0 0 110 105" fill="none" role="img" aria-label="Business building illustration">
      <g clipPath="url(#business-illustration-clip)">
        <path d="M76.1641 17.3871C76.1641 17.3871 68.8463 36.061 97.2715 53.2632C122.516 68.5404 96.7433 94.1345 82.1392 98.3934C63.2208 103.91 42.1343 87.2912 32.5504 100.962C22.9665 114.632 -6.1625 90.1773 7.02143 68.8273C23.4215 42.269 3.87692 41.8587 0.604713 30.2902C-1.74378 21.9876 14.0649 -0.894292 32.6694 6.27587C48.3247 12.3093 51.1169 5.81394 54.8708 1.98881C60.2848 -3.52807 80.2919 0.278157 76.1641 17.3871Z" fill="#EEEEF4" />
        <path d="M27.3345 43.8926H21.0845V79.6504H27.3345V43.8926Z" fill={columnColor} />
        <path d="M82.5747 43.8926H76.3247V79.6504H82.5747V43.8926Z" fill={columnColor} />
        <path d="M54.9546 43.8926H48.7046V79.6504H54.9546V43.8926Z" fill={columnColor} />
        <path d="M85.6946 78.9316H17.9546C17.4023 78.9316 16.9546 79.3794 16.9546 79.9316V85.3216C16.9546 85.8739 17.4023 86.3216 17.9546 86.3216H85.6946C86.2469 86.3216 86.6946 85.8739 86.6946 85.3216V79.9316C86.6946 79.3794 86.2469 78.9316 85.6946 78.9316Z" fill={baseColor} />
        <path d="M86.6946 44.9473H16.9546V49.8273H86.6946V44.9473Z" fill="#F2F2F2" />
        <path d="M87.4691 45.201C88.4873 45.201 88.8541 43.8568 87.977 43.3396L52.3618 22.3404C52.0484 22.1557 51.6595 22.1557 51.3461 22.3404L15.7219 43.3395C14.8446 43.8567 15.2114 45.201 16.2297 45.201H87.4691Z" fill={baseColor} />
      </g>
      <defs>
        <clipPath id="business-illustration-clip"><rect width="109.408" height="104.524" fill="white" /></clipPath>
      </defs>
    </svg>
  );
}

function EngagementCard({
  title,
  description,
  business = false,
  selected,
  onSelect,
}: {
  title: string;
  description: React.ReactNode;
  business?: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`hire-type-card engagement-card${selected ? " is-selected" : ""}`}
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
    >
      {business ? (
        <BusinessIllustration selected={selected} />
      ) : (
        <span className={`hire-type-image-wrap${selected ? " is-selected" : ""}`} aria-hidden="true">
          <img className="hire-type-image hire-type-image-default" src="/team-empty-state.png" alt="" />
          <img className={`hire-type-image hire-type-image-selected${selected ? " is-visible" : ""}`} src="/team-empty-state-blue.png" alt="" />
        </span>
      )}
      <strong>{title}</strong>
      <p>{description}</p>
    </button>
  );
}

function EngagementPage({ onBack, onIndividual, onBusinessSelect, onBusinessContinue, onBulkImport }: { onBack: () => void; onIndividual: () => void; onBusinessSelect: () => void; onBusinessContinue: () => void; onBulkImport: () => void }) {
  const [selectedEngagement, setSelectedEngagement] = useState<string | null>(null);

  return (
    <div className="hire-type-page engagement-page">
      <button className="back-button" type="button" aria-label="Back to contractor type" onClick={onBack}>
        <ArrowLeft aria-hidden="true" strokeWidth={1.9} />
      </button>
      <OnboardingProgress activeStep={0} />
      <div className="hire-type-heading engagement-heading">
        <h2>Who are you engaging?</h2>
        <p>Select the contractor you want to add</p>
      </div>
      <div className="hire-type-cards">
        <EngagementCard
          title="Individual"
          description="An individual is engaged in their own name."
          selected={selectedEngagement === "Individual"}
          onSelect={() => setSelectedEngagement("Individual")}
        />
        <EngagementCard
          title="Business"
          description="A business contractor provides services through a registered business entity."
          business
          selected={selectedEngagement === "Business"}
          onSelect={() => { setSelectedEngagement("Business"); onBusinessSelect(); }}
        />
      </div>
      {selectedEngagement ? (
        <div className="engagement-actions">
          <button className="bulk-import-action" type="button" onClick={() => { if (selectedEngagement === "Business") onBulkImport(); }}>
            <Upload aria-hidden="true" strokeWidth={1.8} />
            <span>Import contractor in bulk</span>
          </button>
          <button className="continue-action" type="button" onClick={() => { if (selectedEngagement === "Business") onBusinessContinue(); else onIndividual(); }}>Continue</button>
        </div>
      ) : null}
    </div>
  );
}

function HireTypeCard({
  title,
  description,
  selected,
  onSelect,
}: {
  title: string;
  description: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`hire-type-card hire-type-selection-card${selected ? " is-selected" : ""}`}
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span className={`hire-type-image-wrap${selected ? " is-selected" : ""}`} aria-hidden="true">
        <img className="hire-type-image hire-type-image-default" src="/team-empty-state.png" alt="" />
        <img className={`hire-type-image hire-type-image-selected${selected ? " is-visible" : ""}`} src="/team-empty-state-blue.png" alt="" />
      </span>
      <strong>{title}</strong>
      <p>{description}</p>
    </button>
  );
}

function HireTypePage({ onBack, onContinue }: { onBack: () => void; onContinue: (type: string) => void }) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  return (
    <div className="hire-type-page hire-type-selection-page">
      <button className="back-button" type="button" aria-label="Back to Team" onClick={onBack}>
        <ArrowLeft aria-hidden="true" strokeWidth={1.9} />
      </button>
      <div className="hire-type-heading">
        <h2>Who would you like to Add</h2>
        <p>Add a new member to your team</p>
      </div>
      <div className="hire-type-cards">
        <HireTypeCard
          title="An Employee"
          description={
            <>
              This person works for my company.
              <br />
              They are hired through Rolla’s entity
              <br />
              or my own.
            </>
          }
          selected={selectedType === "An Employee"}
          onSelect={() => setSelectedType("An Employee")}
        />
        <HireTypeCard
          title="Contractor"
          description={
            <>
              This self-employed person works
              <br />
              with my company independently
            </>
          }
          selected={selectedType === "Contractor"}
          onSelect={() => setSelectedType("Contractor")}
        />
      </div>
      {selectedType ? (
        <button className="continue-action" type="button" onClick={() => onContinue(selectedType)}>
          Continue
        </button>
      ) : null}
    </div>
  );
}

type OnboardingHire = {
  id: string;
  name: string;
  employmentType: string;
  category: "direct" | "global" | "contractor";
  country: string;
  startDate: string;
  status: string;
  requiredAction: string;
};

const onboardingHires: OnboardingHire[] = [
  { id: "john-smith", name: "John Smith", employmentType: "Direct Employee", category: "direct", country: "United States", startDate: "20/04/2026", status: "Draft", requiredAction: "Finish and Invite" },
  { id: "jane-doe", name: "Jane Doe", employmentType: "Contractor", category: "contractor", country: "Canada", startDate: "25/04/2026", status: "In Progress", requiredAction: "No action required" },
  { id: "robert-jones", name: "Robert Jones", employmentType: "Global Employee", category: "global", country: "Mexico", startDate: "01/05/2026", status: "Yet to Start", requiredAction: "Send reminder" },
  { id: "mary-brown", name: "Mary Brown", employmentType: "Contractor", category: "contractor", country: "France", startDate: "15/05/2026", status: "Onboarded", requiredAction: "Activate Contract" },
  { id: "michael-davis", name: "Michael Davis", employmentType: "Direct Employee", category: "direct", country: "Germany", startDate: "31/05/2026", status: "Pending Review", requiredAction: "No action required" },
];

const onboardingHireTabs: { key: "all" | OnboardingHire["category"]; label: string; count: number }[] = [
  { key: "all", label: "All Hires", count: 1 },
  { key: "direct", label: "Direct Employees", count: 1 },
  { key: "global", label: "Global Employees", count: 0 },
  { key: "contractor", label: "Contractors", count: 0 },
];
function OnboardingListPage({ onAddNewHire, temporaryHires = [] }: { onAddNewHire: () => void; temporaryHires?: OnboardingHire[] }) {
  const hires = [...onboardingHires, ...temporaryHires];
  const tabs = onboardingHireTabs.map((tab) => ({
    ...tab,
    count: tab.key === "all" ? hires.length : hires.filter((hire) => hire.category === tab.key).length,
  }));
  const [activeTab, setActiveTab] = useState<(typeof onboardingHireTabs)[number]["key"]>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [employmentFilters, setEmploymentFilters] = useState<OnboardingHire["category"][]>([]);
  const [openRowMenu, setOpenRowMenu] = useState<string | null>(null);
  const [selectedHire, setSelectedHire] = useState<OnboardingHire | null>(null);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleHires = hires.filter((hire) => {
    const matchesTab = activeTab === "all" || hire.category === activeTab;
    const matchesEmployment = employmentFilters.length === 0 || employmentFilters.includes(hire.category);
    const matchesQuery = normalizedQuery.length === 0 || [hire.name, hire.employmentType, hire.country, hire.startDate, hire.status, hire.requiredAction].some((value) => value.toLowerCase().includes(normalizedQuery));
    return matchesTab && matchesEmployment && matchesQuery;
  });
  const filterTypes: { key: OnboardingHire["category"]; label: string }[] = [
    { key: "direct", label: "Direct Employee" },
    { key: "global", label: "Global Employee" },
    { key: "contractor", label: "Contractor" },
  ];

  const toggleEmploymentFilter = (category: OnboardingHire["category"]) => {
    setEmploymentFilters((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category]);
  };

  return (
    <div className="onboarding-list-page">
      <nav className="onboarding-list-tabs" aria-label="Hire categories">
        {tabs.map((tab) => (
          <button
            className={`onboarding-list-tab${activeTab === tab.key ? " is-active" : ""}`}
            type="button"
            key={tab.key}
            aria-pressed={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </nav>

      <section className="onboarding-list-panel" aria-label="Onboarding hires">
        <div className="onboarding-list-toolbar">
          <label className="onboarding-search-box">
            <Search aria-hidden="true" strokeWidth={1.7} />
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search employees" aria-label="Search employees" />
          </label>
          <div className="onboarding-filter-control">
            <button className={`onboarding-filter-button${employmentFilters.length ? " has-filters" : ""}`} type="button" aria-expanded={isFilterOpen} aria-haspopup="dialog" onClick={() => setIsFilterOpen((open) => !open)}>
              <SlidersHorizontal aria-hidden="true" strokeWidth={1.7} />
              Filter
            </button>
            {isFilterOpen ? (
              <div className="onboarding-filter-popover" role="dialog" aria-label="Filter hires by employment type">
                <strong>Employment Type</strong>
                {filterTypes.map((filter) => (
                  <label key={filter.key}>
                    <input type="checkbox" checked={employmentFilters.includes(filter.key)} onChange={() => toggleEmploymentFilter(filter.key)} />
                    <span>{filter.label}</span>
                  </label>
                ))}
                <button className="onboarding-clear-filters" type="button" onClick={() => setEmploymentFilters([])}>Clear filters</button>
              </div>
            ) : null}
          </div>
          <button className="onboarding-add-hire-button" type="button" onClick={onAddNewHire}>Add New Hire</button>
        </div>

        <div className="onboarding-hires-table-wrap">
          <table className="onboarding-hires-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Employment Type</th>
                <th scope="col">Country</th>
                <th scope="col">Start Date</th>
                <th scope="col">Status</th>
                <th scope="col">Required Action</th>
                <th scope="col"><span className="sr-only">More actions</span></th>
              </tr>
            </thead>
            <tbody>
              {visibleHires.map((hire) => (
                <tr key={hire.id}>
                  <td>{hire.name}</td>
                  <td>{hire.employmentType}</td>
                  <td>{hire.country}</td>
                  <td>{hire.startDate}</td>
                  <td>{hire.status}</td>
                  <td>
                    {hire.requiredAction === "No action required" ? (
                      <span className="onboarding-no-action">{hire.requiredAction}</span>
                    ) : (
                      <button className="onboarding-row-action" type="button" onClick={() => setSelectedHire(hire)}>{hire.requiredAction}</button>
                    )}
                  </td>
                  <td>
                    <div className="onboarding-row-menu-wrap">
                      <button className="onboarding-row-menu-button" type="button" aria-label={`More actions for ${hire.name}`} aria-expanded={openRowMenu === hire.id} onClick={() => setOpenRowMenu((current) => current === hire.id ? null : hire.id)}>
                        <MoreHorizontal aria-hidden="true" />
                      </button>
                      {openRowMenu === hire.id ? (
                        <div className="onboarding-row-menu" role="menu">
                          <button type="button" role="menuitem" onClick={() => { setSelectedHire(hire); setOpenRowMenu(null); }}>View details</button>
                        </div>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
              {visibleHires.length === 0 ? <tr><td className="onboarding-empty-table" colSpan={7}>No hires match these filters.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>

      {selectedHire ? (
        <div className="onboarding-hire-detail-overlay" role="presentation" onClick={() => setSelectedHire(null)}>
          <section className="onboarding-hire-detail-modal" role="dialog" aria-modal="true" aria-labelledby="onboarding-hire-detail-title" onClick={(event) => event.stopPropagation()}>
            <div className="onboarding-hire-detail-header">
              <h2 id="onboarding-hire-detail-title">{selectedHire.name}</h2>
              <button type="button" aria-label="Close hire details" onClick={() => setSelectedHire(null)}><X aria-hidden="true" /></button>
            </div>
            <dl>
              <div><dt>Employment Type</dt><dd>{selectedHire.employmentType}</dd></div>
              <div><dt>Country</dt><dd>{selectedHire.country}</dd></div>
              <div><dt>Start Date</dt><dd>{selectedHire.startDate}</dd></div>
              <div><dt>Status</dt><dd>{selectedHire.status}</dd></div>
              <div><dt>Required Action</dt><dd>{selectedHire.requiredAction}</dd></div>
            </dl>
          </section>
        </div>
      ) : null}
    </div>
  );
}

type SwapWalletCode = "CAD" | "GBP" | "USD" | "NGN";

const swapWallets: Record<SwapWalletCode, { countryCode: string; name: string; symbol: string; balance: string }> = {
  CAD: { countryCode: "ca", name: "Canadian Dollars", symbol: "C$", balance: "23,000" },
  GBP: { countryCode: "gb", name: "British Pounds", symbol: "£", balance: "20.00" },
  USD: { countryCode: "us", name: "United States Dollar", symbol: "$", balance: "15,000.00" },
  NGN: { countryCode: "ng", name: "Nigerian Naira", symbol: "₦", balance: "400.00" },
};

function WalletChangeModal({
  initialWallet,
  onCancel,
  onConfirm,
}: {
  initialWallet: SwapWalletCode;
  onCancel: () => void;
  onConfirm: (wallet: SwapWalletCode) => void;
}) {
  const [selectedWallet, setSelectedWallet] = useState<SwapWalletCode>(initialWallet);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onCancel]);

  return (
    <div className="swap-wallet-modal-overlay" onClick={onCancel}>
      <section
        className="swap-wallet-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="swap-wallet-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="swap-wallet-modal-header">
          <div>
            <h2 id="swap-wallet-modal-title">Select Wallet</h2>
            <p>Choose a wallet you want to fund</p>
          </div>
          <button type="button" className="swap-wallet-modal-close" aria-label="Close wallet selection" onClick={onCancel}><X aria-hidden="true" /></button>
        </header>
        <div className="swap-wallet-options" role="radiogroup" aria-label="Available wallets">
          {(Object.entries(swapWallets) as [SwapWalletCode, typeof swapWallets[SwapWalletCode]][]).map(([code, wallet]) => (
            <button
              className={`swap-wallet-option${selectedWallet === code ? " is-selected" : ""}`}
              type="button"
              role="radio"
              aria-checked={selectedWallet === code}
              key={code}
              onClick={() => setSelectedWallet(code)}
            >
              <span className="swap-wallet-option-heading">
                <strong><CountryFlag code={wallet.countryCode} className="swap-flag-image" />{wallet.name} ({code})</strong>
                <span className="swap-active-pill">Active</span>
              </span>
              <span className="swap-wallet-option-balance">Available Balance: <b>{wallet.symbol}{wallet.balance}</b></span>
            </button>
          ))}
        </div>
        <footer className="swap-wallet-modal-actions">
          <button type="button" className="swap-wallet-cancel" onClick={onCancel}>Cancel</button>
          <button type="button" className="swap-wallet-confirm" onClick={() => onConfirm(selectedWallet)}>Select Wallet</button>
        </footer>
      </section>
    </div>
  );
}

function TransactionOtpModal({ onCancel, onComplete }: { onCancel: () => void; onComplete: () => void }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [invalidAttempt, setInvalidAttempt] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isComplete = code.every(Boolean);
  const isInvalidCode = code.join("") === "000000";

  const updateCode = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setCode((current) => current.map((item, itemIndex) => itemIndex === index ? digit : item));
    setInvalidAttempt(false);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !code[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
    if (!pasted.length) return;
    setCode((current) => current.map((item, index) => pasted[index] ?? item));
    inputRefs.current[Math.min(pasted.length, 6) - 1]?.focus();
  };

  return (
    <div className="swap-wallet-modal-overlay" onClick={onCancel}>
      <section className="swap-otp-modal" role="dialog" aria-modal="true" aria-labelledby="transaction-otp-title" onClick={(event) => event.stopPropagation()}>
        <header className="swap-wallet-modal-header">
          <div><h2 id="transaction-otp-title">Transaction OTP</h2></div>
          <button type="button" className="swap-wallet-modal-close" aria-label="Close transaction OTP" onClick={onCancel}><X aria-hidden="true" /></button>
        </header>
        <p className="swap-otp-description">Please enter the OTP code sent to your email to verify and complete this transaction. The code is valid for a short time.</p>
        <strong className="swap-otp-label">Enter 6-digit code</strong>
        <div className="swap-otp-inputs" aria-label="Six digit transaction OTP">
          {code.map((digit, index) => <input key={index} ref={(element) => { inputRefs.current[index] = element; }} value={digit} onChange={(event) => updateCode(index, event.target.value)} onKeyDown={(event) => handleKeyDown(index, event)} onPaste={handlePaste} inputMode="numeric" maxLength={1} aria-label={`OTP digit ${index + 1}`} />)}
        </div>
        {isInvalidCode || invalidAttempt ? <p className="swap-otp-invalid" role="alert">Invalid code</p> : null}
        <p className="swap-otp-resend">Didn't receive the code? <button type="button" onClick={() => { setCode(["", "", "", "", "", ""]); setInvalidAttempt(false); }}>Resend code</button></p>
        <footer className="swap-otp-actions"><button className="swap-otp-cancel" type="button" onClick={onCancel}>Cancel</button><button className="swap-otp-complete" type="button" disabled={!isComplete} onClick={() => { if (isInvalidCode) setInvalidAttempt(true); else onComplete(); }}>Complete Transaction</button></footer>
      </section>
    </div>
  );
}

function ProcessingTransactionModal() {
  return (
    <div className="swap-wallet-modal-overlay">
      <section className="swap-processing-modal" role="dialog" aria-modal="true" aria-labelledby="processing-transaction-title">
        <h2 id="processing-transaction-title">Processing Transaction</h2>
        <div className="swap-processing-loader" aria-label="Processing" role="status"><span /><span /><span /></div>
        <p>Please wait while we process your transaction</p>
      </section>
    </div>
  );
}

function FailedTransactionModal({ onDone }: { onDone: () => void }) {
  return (
    <div className="swap-wallet-modal-overlay">
      <section className="swap-failed-modal" role="dialog" aria-modal="true" aria-labelledby="transaction-failed-title">
        <h2 id="transaction-failed-title">Transaction Failed</h2>
        <div className="swap-failed-icon" aria-hidden="true">×</div>
        <p>Something went wrong while processing your transaction. Please try again in a moment.</p>
        <button type="button" onClick={onDone}>Done</button>
      </section>
    </div>
  );
}

function SuccessfulTransactionModal({ onDone }: { onDone: () => void }) {
  return (
    <div className="swap-wallet-modal-overlay">
      <section className="swap-success-modal" role="dialog" aria-modal="true" aria-labelledby="transaction-success-title">
        <h2 id="transaction-success-title">Transaction Successful</h2>
        <div className="swap-success-icon" aria-hidden="true">✓</div>
        <p>Your transaction has been completed successfully.<br />A confirmation will be sent shortly.</p>
        <button type="button" onClick={onDone}>Done</button>
      </section>
    </div>
  );
}

function SwapReviewPage({
  sendAmount,
  receiveAmount,
  sendWallet,
  receiveWallet,
  onBack,
  onSend,
}: {
  sendAmount: string;
  receiveAmount: string;
  sendWallet: SwapWalletCode;
  receiveWallet: SwapWalletCode;
  onBack: () => void;
  onSend: () => void;
}) {
  const sendValue = Number(sendAmount.replaceAll(",", "")) || 0;
  const receiveValue = Number(receiveAmount.replaceAll(",", "")) || 0;
  const transferFee = 10;
  const amountToConvert = Math.max(sendValue - transferFee, 0);
  const exchangeRate = amountToConvert > 0 ? receiveValue / amountToConvert : 0;
  const formatAmount = (amount: number) => amount.toLocaleString("en-US", { maximumFractionDigits: 2 });
  const formatCurrency = (code: SwapWalletCode, amount: number) => {
    const symbol = swapWallets[code].symbol;
    return code === "USD" ? `${symbol} ${formatAmount(amount)}` : `${symbol}${formatAmount(amount)}`;
  };

  return (
    <div className="swap-review-card">
      <h2>Wallet Swap</h2>
      <div className="swap-review-section-label">You'll Send</div>
      <div className="swap-review-rows">
        <div className="swap-review-row"><span>Amount</span><strong>{formatCurrency(sendWallet, sendValue)}</strong></div>
        <div className="swap-review-row"><span>Transfer fees</span><strong>{formatCurrency(sendWallet, transferFee)}</strong></div>
        <div className="swap-review-row"><span>Amount to convert</span><strong>{formatCurrency(sendWallet, amountToConvert)}</strong></div>
      </div>
      <div className="swap-review-divider" />
      <div className="swap-review-section-label">They’ll Receive</div>
      <div className="swap-review-row swap-review-total"><span>Total Amount</span><strong>{formatCurrency(receiveWallet, receiveValue)}</strong></div>
      <div className="swap-review-rate">Exchange Rate : 1 {sendWallet} = {formatAmount(exchangeRate)} {receiveWallet}</div>
      <div className="swap-review-recipient">
        <span className="swap-review-recipient-label">Recipient</span>
        <div className="swap-review-recipient-details">
          <span className="swap-review-avatar" aria-hidden="true">JD</span>
          <span><strong>{receiveWallet} Wallet</strong><small>@johndoe.rolla</small></span>
        </div>
      </div>
      <div className="swap-review-actions">
        <button className="swap-review-back" type="button" onClick={onBack}>Back</button>
        <button className="swap-review-send" type="button" onClick={onSend}>Send</button>
      </div>
    </div>
  );
}

function SwapPage() {
  const [sendAmount, setSendAmount] = useState("2500");
  const [receiveAmount, setReceiveAmount] = useState("2500");
  const [sendWallet, setSendWallet] = useState<SwapWalletCode>("CAD");
  const [receiveWallet, setReceiveWallet] = useState<SwapWalletCode>("NGN");
  const [walletTarget, setWalletTarget] = useState<0 | 1 | null>(null);
  const [pendingWallet, setPendingWallet] = useState<SwapWalletCode>("CAD");
  const [showReview, setShowReview] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [showSuccessful, setShowSuccessful] = useState(false);
  const [transactionMessage, setTransactionMessage] = useState("");
  const updateSend = (value: string) => { setSendAmount(value); setReceiveAmount(value); };
  const updateReceive = (value: string) => { setReceiveAmount(value); setSendAmount(value); };
  return (
    <div className="swap-page">
      <header className="swap-heading"><h1>Swap Currency</h1><p>Convert between currencies in seconds.</p></header>
      {showReview ? (
        <SwapReviewPage
          sendAmount={sendAmount}
          receiveAmount={receiveAmount}
          sendWallet={sendWallet}
          receiveWallet={receiveWallet}
          onBack={() => setShowReview(false)}
          onSend={() => { setTransactionMessage(""); setShowOtp(true); }}
        />
      ) : <section className="swap-card">
        <h2>Wallet</h2>
        <div className="swap-wallet-stack">
          {[sendWallet, receiveWallet].map((code, index) => {
            const wallet = swapWallets[code];
            return <Fragment key={`${code}-${index}`}><div className={`swap-wallet-card${index === 0 ? " is-selected" : ""}`}><div><div className="swap-wallet-title"><strong><CountryFlag code={wallet.countryCode} className="swap-flag-image" />{wallet.name} ({code})</strong></div><small>Available Balance: <b>{wallet.symbol}{wallet.balance}</b></small></div><span className="swap-active-pill">Active</span><button type="button" onClick={() => { setWalletTarget(index as 0 | 1); setPendingWallet(code); }}>Change Wallet</button></div>{index === 0 ? <div className="swap-arrow" aria-hidden="true">↓</div> : null}</Fragment>;
          })}
        </div>
        <div className="swap-amounts">
          <label><span>Amount to Send</span><div><b>{sendWallet}</b><input value={sendAmount} onChange={(event) => updateSend(event.target.value)} inputMode="decimal" /></div></label>
          <strong className="swap-or">OR</strong>
          <label><span>Amount to Receive</span><div><b>{receiveWallet}</b><input value={receiveAmount} onChange={(event) => updateReceive(event.target.value)} inputMode="decimal" /></div></label>
        </div>
        <p className="swap-help">Enter the amount to send or the amount the recipient should receive; the other updates automatically.</p>
        <button className="swap-continue" type="button" onClick={() => setShowReview(true)}>Continue</button>
      </section>}
      {walletTarget !== null ? (
        <WalletChangeModal
          initialWallet={pendingWallet}
          onCancel={() => setWalletTarget(null)}
          onConfirm={(wallet) => {
            if (walletTarget === 0) setSendWallet(wallet);
            else setReceiveWallet(wallet);
            setWalletTarget(null);
          }}
        />
      ) : null}
      {showOtp ? <TransactionOtpModal onCancel={() => setShowOtp(false)} onComplete={() => { setShowOtp(false); setShowProcessing(true); window.setTimeout(() => { setShowProcessing(false); setShowSuccessful(true); }, 1800); }} /> : null}
      {showProcessing ? <ProcessingTransactionModal /> : null}
      {showFailed ? <FailedTransactionModal onDone={() => setShowFailed(false)} /> : null}
      {showSuccessful ? <SuccessfulTransactionModal onDone={() => setShowSuccessful(false)} /> : null}
      {transactionMessage ? <p className="swap-transaction-message" role="status">{transactionMessage}</p> : null}
    </div>
  );
}

function NavigationBar({ activeSection, onSelect }: { activeSection: string; onSelect: (label: string) => void }) {
  return (
    <aside className="business-sidebar">
      <div className="sidebar-logo-row">
        <RollaMark />
      </div>
      <nav className="sidebar-navigation" aria-label="Business navigation">
        {navigationGroups.map((group) => (
          <section className="navigation-group" key={group.label}>
            <h2>{group.label}</h2>
            <div className="navigation-items">
              {group.items.map(({ label, icon: Icon, tone }) => (
                <button
                  className={`navigation-item${label === activeSection ? " is-active" : ""}${tone === "danger" ? " is-danger" : ""}`}
                  key={label}
                  onClick={() => onSelect(label)}
                  type="button"
                  aria-current={label === activeSection ? "page" : undefined}
                >
                  <Icon aria-hidden="true" strokeWidth={1.65} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  );
}

function TopBar({ title }: { title: string }) {
  return (
    <header className="top-bar">
      <h1>{title === "Swap" ? "" : title}</h1>
      <div className="top-bar-actions">
        <button className="exchange-rates-button" type="button">
          <ArrowLeftRight aria-hidden="true" strokeWidth={1.8} />
          <span>Exchange Rates</span>
        </button>
        <button className="icon-button" type="button" aria-label="Help">
          <CircleHelp aria-hidden="true" strokeWidth={1.55} />
        </button>
        <button className="icon-button notification-button" type="button" aria-label="Notifications">
          <Bell aria-hidden="true" strokeWidth={1.55} />
          <span className="notification-dot" />
        </button>
        <div className="profile-avatar" aria-label="JD profile">JD</div>
      </div>
    </header>
  );
}

export default function Home() {
  const incomingSigningLink = new URLSearchParams(window.location.search).get("client-sign") === "1";
  const [screen, setScreen] = useState<"team" | "swap" | "onboarding-list" | "hire-type" | "engagement" | "bulk-import" | "bulk-agreement" | "onboarding" | "onboarding-contract" | "payment" | "agreement" | "review">(() => incomingSigningLink ? "review" : "team");
  const [activeSection, setActiveSection] = useState<string>(() => incomingSigningLink ? "Onboarding" : "Team");
  const [reviewData, setReviewData] = useState<ReviewData>(emptyReviewData);
  const [businessContractor, setBusinessContractor] = useState(false);
  const [temporaryHires, setTemporaryHires] = useState<OnboardingHire[]>([]);
  const [bulkInviteSummary, setBulkInviteSummary] = useState({ count: 0, recipient: "", amount: "", currency: "" });
  const dashboardHome = activeSection === "Onboarding" ? "onboarding-list" : "team";

  useEffect(() => {
    document.title = `Rolla · ${activeSection}`;
  }, [activeSection]);

  return (
    <main className="dashboard-shell">
      <NavigationBar
        activeSection={activeSection}
        onSelect={(label) => {
          updateClientSigningUrl(false);
          if (label === "Swap") {
            setActiveSection(label);
            setScreen("swap");
          } else if (label === "Team" || label === "Onboarding") {
            setActiveSection(label);
            setScreen(label === "Team" ? "team" : "onboarding-list");
          }
        }}
      />
      <section className="dashboard-content">
        <TopBar title={activeSection} />
        <div className={`team-content${screen === "payment" || screen === "agreement" || screen === "bulk-agreement" || screen === "review" ? " payment-content" : ""}${screen === "onboarding" || screen === "onboarding-contract" ? " onboarding-content" : ""}${screen === "onboarding-list" ? " onboarding-list-content" : ""}${screen === "bulk-import" ? " bulk-import-content" : ""}${screen === "swap" ? " swap-content" : ""}`}>
          {screen === "swap" ? (
            <SwapPage />
          ) :
          screen === "onboarding-list" ? (
            <OnboardingListPage temporaryHires={temporaryHires} onAddNewHire={() => setScreen("hire-type")} />
          ) : screen === "onboarding" || screen === "onboarding-contract" ? (
            <ContractorOnboardingPage
              initialStep={screen === "onboarding-contract" ? "contract" : "personal"}
              business={businessContractor}
              onExit={() => setScreen("engagement")}
              onPersonal={(values) => setReviewData((current) => ({ ...current, personal: values }))}
              onPayment={(values) => { setReviewData((current) => ({ ...current, contract: values })); setScreen("payment"); }}
            />
          ) : screen === "hire-type" ? (
            <HireTypePage
              onBack={() => setScreen(dashboardHome)}
              onContinue={(type) => setScreen(type === "Contractor" ? "engagement" : dashboardHome)}
            />
          ) : screen === "engagement" ? (
            <EngagementPage
              onBack={() => setScreen("hire-type")}
              onIndividual={() => { setBusinessContractor(false); setScreen("onboarding"); }}
              onBusinessSelect={() => setBusinessContractor(true)}
              onBusinessContinue={() => setScreen("onboarding")}
              onBulkImport={() => setScreen("bulk-import")}
            />
          ) : screen === "bulk-import" ? (
            <BulkImportPage onBack={() => setScreen("engagement")} onContinue={(summary) => { setBulkInviteSummary(summary); setScreen("bulk-agreement"); }} />
          ) : screen === "bulk-agreement" ? (
            <AgreementPage bulk inviteSummary={bulkInviteSummary} onBack={() => setScreen("bulk-import")} onContinue={() => setScreen("team")} />
          ) : screen === "payment" ? (
            <PaymentPage onBack={() => setScreen("onboarding-contract")} onContinue={(data) => { setReviewData((current) => ({ ...current, payment: data })); setScreen("agreement"); }} />
          ) : screen === "agreement" ? (
            <AgreementPage onBack={() => setScreen("payment")} onContinue={(agreement) => { setReviewData((current) => ({ ...current, agreement })); setScreen("review"); }} />
          ) : screen === "review" ? (
            <ReviewPage
              data={reviewData}
              business={businessContractor}
              backLabel={incomingSigningLink ? "Back to Onboarding" : "Back to Agreement"}
              onBack={() => setScreen(incomingSigningLink ? "onboarding-list" : "agreement")}
              onInviteSent={() => {
                const name = reviewData.personal[0] || (businessContractor ? "Business contractor" : "Contractor");
                const country = businessContractor
                  ? reviewData.personal[3] || "Not provided"
                  : reviewData.personal[6] || reviewData.personal[4] || "Not provided";
                const startDate = reviewData.contract[5] || "Not set";
                setTemporaryHires((current) => [
                  ...current.filter((hire) => hire.name !== name),
                  {
                    id: `temporary-${Date.now()}`,
                    name,
                    employmentType: businessContractor ? "Business Contractor" : "Contractor",
                    category: "contractor",
                    country,
                    startDate,
                    status: "Onboarding Invite Sent",
                    requiredAction: "No action required",
                  },
                ]);
                setActiveSection("Onboarding");
                setScreen("onboarding-list");
              }}
            />
          ) : (
            <div className="team-empty-state">
              <EmptyStateIllustration />
              <div className="team-copy">
                <h2>Add New Hire to Rolla</h2>
                <p>
                  New team members will appear here when
                  <br />
                  they are done with their onboarding
                </p>
                <button className="primary-action" type="button" onClick={() => setScreen("hire-type")}>
                  Add New Hire
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
