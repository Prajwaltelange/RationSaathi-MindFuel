# RationSaathi (सार्वजनिक वितरण हक्क आणि तफावत सहाय्यक)

**Public Distribution Entitlement and Dispute Assistant**

RationSaathi is a transparent, rule-based web application prototype built to organize ration distribution records, verify household entitlements, and generate neutral, evidence-based discrepancy reports for review by food distribution authorities.

---

## 1. What This App Is and Is Not

- **What it IS**: A decision-support and evidence-organization tool for ration-card households and fair price shops. It computes exact entitlements based on transparent rules entered by users, compares them with recorded receipts, and structures factual differences for human administrative review.
- **What it is NOT**:
  - It is **NOT** a fraud detector.
  - It is **NOT** an identity-verification or biometric system.
  - It does **NOT** assert or imply wrongdoing, theft, or misconduct by any party. Factual differences may arise from common administrative causes such as stock delivery delays, PoS connectivity issues, or clerical recording errors.
  - It uses **FICTIONAL DATA ONLY**.

---

## 2. How It Works in Simple Words

1. **User-Entered Rules**: The user configures ration card types and allocation rules (e.g., 5 kg per member per month for PHH cards, or 35 kg per card for AAY cards). The app applies **only** the rules entered; no external or unverified rules are assumed.
2. **Exact Integer Arithmetic**:
   - Quantities entered in kilograms or litres (up to 3 decimal places) are parsed as **strings** and stored internally as exact **integer grams or millilitres**.
   - Currency amounts (up to 2 decimals) are stored as exact **integer paise**.
   - Floating-point arithmetic is never used, guaranteeing that `2.5 kg + 2.5 kg = 5,000 g` and `8 kg + 6 kg = 14,000 g` without rounding drift.
   - Expected prices in paise use exact integer rounding:
     $$\text{expectedPaise} = \left\lfloor \frac{\text{pricePaise} \times \text{grams} + 500}{1000} \right\rfloor$$
     Free grain under PMGKAY expects ₹0.00.
3. **Objective Evaluation**:
   - The engine compares entitled quantities against **confirmed** received quantities.
   - It computes two distinct figures:
     1. **Difference based on confirmed entries only**.
     2. **Difference if all pending entries were to be confirmed**.
   - Disputed entries are excluded from confirmed totals and trigger an **Unclear** status so an authority can review the dispute factual note.

---

## 3. Language System (Frontend Only)

- Built with a single centralized translation dictionary (`src/services/translations.ts`) supporting **English**, **मराठी (Marathi)**, and **हिन्दी (Hindi)**.
- Every label, report line, grievance letter, hint, and error message is rendered through the `t("key", {placeholders})` function.
- Report sentences and letter bodies use fixed **sentence templates** with placeholders (e.g. `{members} members × {rate} kg = {total} kg`).
- No server-side translation or AI translation is used.
- Renders Devanagari using system font stacks with zero external network downloads.
*(Note: Marathi and Hindi wording should be reviewed by a native speaker).*

---

## 4. Role of AI and 100% Offline Fallback

- **Hard Rule**: AI never touches any calculation, number, total, status, or classification. All maths and statuses are 100% deterministic code.
- **Optional Receipt Extractor**:
  - A local, rule-based offline parser parses pasted receipt text, Devanagari numerals (`०-९`), multilingual units (`kg`, `किलो`, `किग्रा`, `ग्राम`, `litre`), dates, rupee amounts, and receipt references (`ref`, `पावती क्र.`).
  - When the optional Gemini assistant toggle is enabled in Settings, the server proxy (`/api/gemini/extract-receipt`) provides extraction suggestions with an **8-second timeout**. If the API is unavailable or times out, the application silently falls back to the local offline parser.
  - No extracted data is saved until the citizen reviews and clicks **Confirm**.

---

## 5. Pending $\rightarrow$ Confirm / Not Correct Flow & Demo OTP

1. When a shopkeeper logs a distribution at the counter, the record is created with **Pending** status.
2. In prototype mode, a simulated 4-digit **Demo OTP Code** appears on the Citizen's screen.
3. The shopkeeper can type this OTP to mark the entry **Confirmed**. If an incorrect OTP is entered 3 times, the OTP verification path locks to prevent brute force, while allowing the citizen to confirm or dispute directly.
4. If an entry is incorrect, the citizen clicks **Not correct** and enters a factual explanation, saving the record as **Disputed**.

---

## 6. Honest Limitations of this Prototype

- **No Authentication / Passwords**: Roles (Citizen and Shopkeeper) are simulated for demonstration. A production system requires authenticated login, biometric e-KYC, and backend database storage.
- **Local Browser Storage**: State is persisted in browser `localStorage` (`rationsaathi_v1`).
- **Sample Values**: The pre-loaded card types and rules are labelled **SAMPLE** and must be verified against official notifications.
- **Administrative Assumptions**: The cut-off date for household member additions/removals and grain splits (e.g., Rice vs Wheat ratios) vary by district and are user settings.

---

## 7. How to Run Self-Tests

1. Open the application.
2. Navigate to the **Self-Tests** tab in the top navigation bar.
3. Click the **Run self-tests suite** button.
4. The test suite evaluates all 20 arithmetic, classification, date cut-off, neutrality, and parser invariants in browser memory.

---

## 8. Official Regulatory References

- **National Food Security Act (NFSA) 2013**, Section 3(1) (Entitlements of persons belonging to priority households).
- **Government of Maharashtra Food, Civil Supplies and Consumer Protection Department**:
  - `rcms.mahafood.gov.in`
  - `mahafood.gov.in/en/national-food-security-act-2013/`
- **Controller of Rationing, Mumbai**:
  - `controllerofrationing-mumbai.gov.in/en/ration-card/`
