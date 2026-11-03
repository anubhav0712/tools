export interface ToolFaqItem {
  question: string;
  answer: string;
}

export interface ToolSeoConfig {
  metaTitle: string;
  metaDescription: string;
  howToUse: string[];
  faqs: ToolFaqItem[];
  relatedToolIds: string[];
}

export const TOOL_SEO_DATA: Record<string, ToolSeoConfig> = {
  'loan-calculator': {
    metaTitle: 'Loan & Mortgage EMI Calculator — Amortization Schedule & APR | Tools',
    metaDescription: 'Calculate monthly loan EMI, amortization schedules, TILA APR, and prepayment savings 100% in your browser. Completely private with zero cloud uploads.',
    howToUse: [
      'Enter the total loan principal amount you wish to borrow.',
      'Specify the annual interest rate (note rate) and loan tenure in years.',
      'Optionally add annual property tax, homeowners insurance, or upfront origination points.',
      'Toggle payment frequencies (monthly vs bi-weekly) and simulate extra monthly prepayments to calculate interest savings.',
      'Inspect the detailed yearly amortization table and export your schedule.',
    ],
    faqs: [
      {
        question: 'How is monthly loan EMI calculated?',
        answer: 'Monthly EMI is determined using the fixed-rate reducing balance annuity formula: EMI = P × [r(1 + r)^n] / [(1 + r)^n - 1], where P is Principal, r is periodic interest rate (annual rate / 12), and n is total monthly payments.',
      },
      {
        question: 'What is the difference between Interest Rate and APR?',
        answer: 'The interest rate reflects the nominal annual cost of borrowing the principal balance. The Annual Percentage Rate (APR) incorporates upfront closing costs, discount points, and lender origination fees, representing the true annualized financing cost under the Truth in Lending Act (TILA Regulation Z).',
      },
      {
        question: 'How do extra monthly payments shorten my mortgage?',
        answer: 'Extra payments are applied directly against the remaining principal balance. Reducing the outstanding principal prevents future interest compounding, accelerating payoff and saving thousands in cumulative interest.',
      },
      {
        question: 'Are my financial calculations saved or tracked on a server?',
        answer: 'No. All calculations run strictly in your local browser sandbox memory. Zero data is ever uploaded, logged, or shared with third parties or cloud servers.',
      },
    ],
    relatedToolIds: ['auto-loan-calculator', 'debt-payoff-calculator', 'sip-calculator', 'compound-interest-calculator'],
  },

  'sip-calculator': {
    metaTitle: 'SIP & Systematic Investment Calculator — Mutual Fund Wealth Planner | Tools',
    metaDescription: 'Calculate wealth generated through monthly systematic investments (SIP/DCA) with compound returns, annual step-up, inflation-adjusted value, and LTCG tax analysis.',
    howToUse: [
      'Enter your planned monthly investment amount.',
      'Set your expected annual return rate (%) and investment duration in years.',
      'Enable the Annual Step-Up percentage to simulate annual salary increments.',
      'Review both nominal future corpus and real purchasing power discounted for inflation.',
      'Analyze expected Long-Term Capital Gains (LTCG) tax impact under modern tax norms.',
    ],
    faqs: [
      {
        question: 'What is a Systematic Investment Plan (SIP)?',
        answer: 'A Systematic Investment Plan (SIP) is a disciplined investment methodology where a fixed amount is invested at regular intervals (usually monthly) into mutual funds or index ETFs, benefiting from dollar-cost averaging and compound growth.',
      },
      {
        question: 'What is the formula for SIP compound returns?',
        answer: 'SIP maturity value is calculated using the annuity-due future value formula: FV = P × [((1 + r)^n - 1) / r] × (1 + r), where P is periodic investment, r is the periodic return rate, and n is total compounding periods.',
      },
      {
        question: 'How does an annual Step-Up SIP boost wealth creation?',
        answer: 'A Step-Up SIP increases your monthly contribution annually by a fixed percentage (e.g. 10%). Because contributions scale alongside your career earnings, the exponential compounding curve steepens dramatically over 15 to 25 years.',
      },
      {
        question: 'What is inflation-adjusted real maturity value?',
        answer: 'Real maturity value discounts future nominal wealth by the historical rate of inflation using the Fisher equation: Real FV = Nominal FV / (1 + inflation)^years. It reveals the exact purchasing power of your corpus in today\'s money.',
      },
    ],
    relatedToolIds: ['compound-interest-calculator', 'retirement-calculator', 'fd-calculator', 'inflation-calculator'],
  },

  'compound-interest-calculator': {
    metaTitle: 'Compound Interest & APY Calculator — Daily, Monthly & Annual Growth | Tools',
    metaDescription: 'Calculate compound interest and Annual Percentage Yield (APY) with customizable compounding frequencies, recurring deposits, and purchasing power adjustments.',
    howToUse: [
      'Enter your initial principal investment deposit.',
      'Input the annual interest rate and choose duration in years or months.',
      'Select compounding frequency: daily, monthly, quarterly, semi-annually, or annually.',
      'Add optional recurring deposits (monthly or annually) to model ongoing savings.',
      'Inspect the interest vs principal breakdown chart and growth trajectory.',
    ],
    faqs: [
      {
        question: 'What is compound interest?',
        answer: 'Compound interest is interest earned not only on the initial principal balance, but also on accumulated interest from previous periods—creating exponential growth over time.',
      },
      {
        question: 'What is the difference between APR and APY?',
        answer: 'APR (Annual Percentage Rate) is the simple nominal interest rate over a year. APY (Annual Percentage Yield) reflects the true effective annual rate taking compounding frequency into account: APY = (1 + r/n)^n - 1.',
      },
      {
        question: 'How does daily vs monthly compounding affect returns?',
        answer: 'More frequent compounding generates higher effective returns because interest is credited and begins generating its own return sooner. Daily compounding yields slightly higher wealth than monthly or annual compounding for identical nominal rates.',
      },
      {
        question: 'Does this calculator run offline?',
        answer: 'Yes. The calculation engine is written in pure client-side TypeScript. It operates 100% offline with zero network connectivity required.',
      },
    ],
    relatedToolIds: ['sip-calculator', 'fd-calculator', 'inflation-calculator', 'retirement-calculator'],
  },

  'salary-tax-calculator': {
    metaTitle: 'Salary & Take-Home Pay Tax Calculator — Net Pay Breakdown | Tools',
    metaDescription: 'Calculate net take-home salary, income tax brackets, social security, and standard deductions locally in your browser. 100% private with zero data logging.',
    howToUse: [
      'Select your tax jurisdiction (US Federal/State, India New/Old Regime, or Global).',
      'Enter your gross annual CTC or hourly wage.',
      'Add relevant tax deductions (e.g. 401(k), Section 80C/80D, standard deduction, or health insurance).',
      'View your estimated effective tax rate, marginal bracket, and monthly net pay.',
    ],
    faqs: [
      {
        question: 'What is the difference between Marginal and Effective Tax Rate?',
        answer: 'Your marginal tax rate is the tax rate applied to your highest dollar of income (your top tax bracket). Your effective tax rate is your actual total tax paid divided by your total taxable income.',
      },
      {
        question: 'Why should I use an in-browser tax calculator?',
        answer: 'Most online salary calculators collect your compensation data, employer info, and email to sell to financial lenders. Our calculator executes entirely in browser memory without sending a single byte to any server.',
      },
      {
        question: 'How is net take-home pay calculated?',
        answer: 'Net take-home pay is Gross Salary minus Federal/Central Income Taxes, State/Provincial Taxes, Social Security/Provident Fund contributions, and voluntary pre-tax deductions.',
      },
    ],
    relatedToolIds: ['inflation-calculator', 'retirement-calculator', 'emergency-fund-calculator', 'loan-calculator'],
  },

  'retirement-calculator': {
    metaTitle: 'Retirement & FIRE Wealth Planner — Safe Withdrawal & Corpus | Tools',
    metaDescription: 'Plan your retirement corpus, financial independence (FIRE), and safe withdrawal rates with inflation adjustments and life expectancy simulations. 100% private.',
    howToUse: [
      'Enter your current age and planned retirement age.',
      'Input current monthly living expenses and estimated post-retirement lifestyle multiplier.',
      'Set expected pre-retirement investment returns and inflation assumptions.',
      'Configure Safe Withdrawal Rate (SWR, typically 3.5%–4%) to calculate your target FIRE number.',
    ],
    faqs: [
      {
        question: 'What is the 4% Rule in retirement planning?',
        answer: 'The 4% Rule (derived from the Trinity Study) states that a retiree can safely withdraw 4% of their initial portfolio value in year one, adjusted annually for inflation, with high probability of not running out of money over a 30-year retirement.',
      },
      {
        question: 'What is the FIRE Movement (Financial Independence, Retire Early)?',
        answer: 'FIRE is a lifestyle movement centered on aggressive savings (50%+ of income) and low-cost index investing to accumulate 25–30 times annual expenses, enabling retirement decades before traditional retirement age.',
      },
      {
        question: 'How does inflation affect my retirement target?',
        answer: 'Inflation continuously degrades purchasing power. A $5,000/month lifestyle today will require over $10,000/month in 25 years at a modest 3% inflation rate, doubling your required nominal retirement nest egg.',
      },
    ],
    relatedToolIds: ['sip-calculator', 'compound-interest-calculator', 'salary-tax-calculator', 'inflation-calculator'],
  },

  'debt-payoff-calculator': {
    metaTitle: 'Credit Card & Debt Payoff Calculator — Snowball vs Avalanche | Tools',
    metaDescription: 'Compare Debt Snowball vs Debt Avalanche payoff strategies. Calculate exact debt-free dates, interest savings, and accelerated payoff schedules offline.',
    howToUse: [
      'Add each loan or credit card balance, interest rate (APR), and minimum monthly payment.',
      'Enter extra funds available each month for accelerated repayment.',
      'Toggle between Debt Avalanche (highest APR first) and Debt Snowball (lowest balance first).',
      'Compare total interest paid and months saved across both methodologies.',
    ],
    faqs: [
      {
        question: 'What is the difference between Debt Snowball and Debt Avalanche?',
        answer: 'Debt Avalanche focuses on mathematical optimization by paying off debts with the highest interest rate (APR) first, minimizing total interest. Debt Snowball prioritizes psychological momentum by paying off the smallest balances first.',
      },
      {
        question: 'How much faster can extra monthly payments eliminate debt?',
        answer: 'Even an extra $100 or $200 per month paid directly toward high-interest credit card debt can cut payoff time in half and save thousands in finance charges.',
      },
      {
        question: 'Is my credit card data private?',
        answer: 'Yes. All debt calculations run strictly in your browser. We never log balances, interest rates, or card details.',
      },
    ],
    relatedToolIds: ['loan-calculator', 'emergency-fund-calculator', 'auto-loan-calculator', 'salary-tax-calculator'],
  },

  'inflation-calculator': {
    metaTitle: 'Inflation & Purchasing Power Decay Calculator — Historical & Future | Tools',
    metaDescription: 'Calculate the real future value of your savings and purchasing power decay over time based on historical and projected inflation rates. 100% in-browser.',
    howToUse: [
      'Enter the starting monetary sum in today\'s currency.',
      'Specify the projected average annual inflation rate (e.g. 3%, 6%).',
      'Select time horizon in years to see equivalent future value and real purchasing power.',
    ],
    faqs: [
      {
        question: 'What is purchasing power decay?',
        answer: 'Purchasing power decay is the loss in goods and services that a unit of currency can buy over time due to inflation. At 6% inflation, money loses roughly half its purchasing power every 12 years.',
      },
      {
        question: 'What is the Rule of 72 in inflation?',
        answer: 'The Rule of 72 estimates how long it takes for prices to double or purchasing power to halve: divide 72 by the annual inflation rate (e.g., 72 / 6% = 12 years).',
      },
    ],
    relatedToolIds: ['retirement-calculator', 'sip-calculator', 'compound-interest-calculator', 'salary-tax-calculator'],
  },

  'emergency-fund-calculator': {
    metaTitle: 'Emergency Fund & Liquidity Safety Net Calculator | Tools',
    metaDescription: 'Calculate your ideal 3 to 12 month emergency fund size based on essential living expenses, job stability, and family dependents. 100% private.',
    howToUse: [
      'Input monthly essential expenses (housing, utilities, groceries, insurance, debt service).',
      'Select risk profile and employment type (salaried vs freelancer/business owner).',
      'Determine recommended liquidity buffer (3, 6, 9, or 12 months of survival expenses).',
    ],
    faqs: [
      {
        question: 'How many months of expenses should an emergency fund cover?',
        answer: 'General guidelines recommend 3 to 6 months of essential living expenses for stable dual-income households, and 9 to 12 months for freelancers, single-income earners, or volatile commission-based industries.',
      },
      {
        question: 'Where should emergency funds be kept?',
        answer: 'Emergency funds must remain safe and liquid, typically in high-yield savings accounts (HYSA), money market funds, or short-term treasury bills, rather than volatile equities.',
      },
    ],
    relatedToolIds: ['debt-payoff-calculator', 'salary-tax-calculator', 'fd-calculator', 'retirement-calculator'],
  },

  'fd-calculator': {
    metaTitle: 'Fixed Deposit & CD Calculator — Compound Maturity Interest | Tools',
    metaDescription: 'Calculate fixed deposit (FD) and Certificate of Deposit (CD) maturity amounts with quarterly compounding, tenure options, and tax deducted at source (TDS).',
    howToUse: [
      'Enter the deposit principal amount.',
      'Input the annual interest rate offered by your bank or financial institution.',
      'Select compounding frequency (quarterly is standard for bank FDs) and tenure.',
      'View total interest earned and final maturity payout.',
    ],
    faqs: [
      {
        question: 'How is Fixed Deposit interest compounded?',
        answer: 'Most commercial banks compound FD interest on a quarterly basis using: A = P × (1 + r/4)^(4 × t), where r is annual interest rate and t is deposit duration in years.',
      },
      {
        question: 'Is bank FD interest taxable?',
        answer: 'Yes, in most jurisdictions fixed deposit interest is treated as ordinary taxable income and may be subject to withholding taxes (TDS) once interest exceeds threshold limits.',
      },
    ],
    relatedToolIds: ['compound-interest-calculator', 'sip-calculator', 'emergency-fund-calculator', 'inflation-calculator'],
  },

  'auto-loan-calculator': {
    metaTitle: 'Auto Loan & Vehicle Financing Calculator — Out-the-Door Price | Tools',
    metaDescription: 'Calculate monthly car loan payments, sales tax, trade-in value, dealer doc fees, and total vehicle financing cost in your browser. 100% private.',
    howToUse: [
      'Enter the vehicle vehicle purchase price (MSRP or negotiated price).',
      'Add down payment and trade-in value of your current car.',
      'Specify local sales tax percentage and estimated dealer document and registration fees.',
      'Select financing loan term in months and annual loan interest rate.',
    ],
    faqs: [
      {
        question: 'What is an "out-the-door" vehicle price?',
        answer: 'The out-the-door (OTD) price is the total final cost required to drive the car off the dealership lot, including vehicle price, sales tax, documentation fees, destination charges, title, and registration.',
      },
      {
        question: 'What is the 20/4/10 rule for car buying?',
        answer: 'Financial advisors recommend putting down at least 20%, financing for no longer than 4 years (48 months), and keeping total vehicle expenses (payment, insurance, gas) under 10% of gross income.',
      },
    ],
    relatedToolIds: ['loan-calculator', 'debt-payoff-calculator', 'emergency-fund-calculator', 'salary-tax-calculator'],
  },

  'json-formatter': {
    metaTitle: 'Private JSON Formatter, Validator & Minifier — 100% In-Browser | Tools',
    metaDescription: 'Format, validate, beautify, and minify JSON data with sorted object keys and syntax highlighting. Zero data uploaded to servers—safe for API keys and NDA data.',
    howToUse: [
      'Paste your raw JSON text into the input editor or load an example.',
      'Select your preferred indentation (2 spaces, 4 spaces, or tab).',
      'Toggle "Sort Keys" alphabetically to normalize object structures.',
      'Click "Minify" to compress JSON to a compact single-line string with zero whitespace.',
      'Copy the validated output with one click or view syntax error line numbers.',
    ],
    faqs: [
      {
        question: 'Is this JSON formatter safe for confidential or production data?',
        answer: 'Yes, 100%. Unlike online formatters that transmit your payload to remote cloud servers, this tool parses JSON entirely inside your browser JavaScript runtime. Zero network requests are made.',
      },
      {
        question: 'What is JSON minification?',
        answer: 'JSON minification strips all whitespace, newlines, and indentation from the document, significantly reducing byte size for network transmission in high-performance APIs.',
      },
      {
        question: 'How does sorting keys help developers?',
        answer: 'Sorting object keys alphabetically produces a deterministic schema, making it easy to compare JSON documents in Git diffs without false positive changes caused by key reordering.',
      },
    ],
    relatedToolIds: ['sql-formatter', 'csv-json-converter', 'cron-parser', 'diff-checker'],
  },

  'sql-formatter': {
    metaTitle: 'SQL Formatter & Beautifier — Client-Side Query Indentation | Tools',
    metaDescription: 'Format, indent, and beautify SQL queries with uppercase keyword normalization. Executes 100% locally in your browser—safe for proprietary schema queries.',
    howToUse: [
      'Paste your unformatted SQL query into the editor.',
      'Select keyword casing preference (Uppercase, Lowercase, or Preserve).',
      'View formatted, clean SQL with indented clauses (SELECT, FROM, WHERE, JOIN, GROUP BY).',
    ],
    faqs: [
      {
        question: 'Why format SQL queries locally?',
        answer: 'Pasting proprietary database queries containing confidential table names and business logic into online formatters risks data leakage. Our tool formats queries in your local browser sandbox.',
      },
      {
        question: 'Which SQL dialects are supported?',
        answer: 'The formatter supports ANSI SQL, PostgreSQL, MySQL, SQLite, Oracle, BigQuery, and SQL Server syntaxes.',
      },
    ],
    relatedToolIds: ['json-formatter', 'diff-checker', 'csv-json-converter', 'regex-tester'],
  },

  'cron-parser': {
    metaTitle: 'Cron Expression Parser & Schedule Explainer | Tools',
    metaDescription: 'Parse 5 and 6 field cron expressions into plain English schedules. See upcoming execution timestamps with zero server latency. 100% in-browser.',
    howToUse: [
      'Enter a 5-part standard crontab expression (minute, hour, day of month, month, day of week).',
      'Read the humanized explanation of the schedule in plain English.',
      'Inspect the list of next scheduled execution dates and times.',
      'Select from common presets (every 5 minutes, daily at midnight, weekly on Sunday).',
    ],
    faqs: [
      {
        question: 'What are the 5 fields of a standard cron expression?',
        answer: 'The 5 fields are: 1. Minute (0-59), 2. Hour (0-23), 3. Day of month (1-31), 4. Month (1-12 or JAN-DEC), 5. Day of week (0-6 or SUN-SAT).',
      },
      {
        question: 'What does "*/15 * * * *" mean?',
        answer: 'It schedules a task to run every 15 minutes, every hour, every day of the month, every month, and every day of the week.',
      },
    ],
    relatedToolIds: ['regex-tester', 'json-formatter', 'sql-formatter', 'jwt-inspector'],
  },

  'diff-checker': {
    metaTitle: 'Diff Checker & Text Compare — Side-by-Side Code Difference | Tools',
    metaDescription: 'Compare text and code files side-by-side with character-level difference highlighting. 100% client-side privacy—safe for confidential source code and contracts.',
    howToUse: [
      'Paste original text or code in the left editor and modified text in the right editor.',
      'Toggle between Split (side-by-side) and Unified inline diff view modes.',
      'Inspect additions (green) and deletions (red) with intra-line character highlighting.',
    ],
    faqs: [
      {
        question: 'Is it safe to compare confidential code or contracts?',
        answer: 'Yes. All diffing algorithms execute strictly in your browser memory. No data is stored, logged, or sent over the internet.',
      },
      {
        question: 'How are diffs calculated?',
        answer: 'The engine uses the Myers Difference Algorithm (similar to Git diff) to calculate the shortest edit script between sequences.',
      },
    ],
    relatedToolIds: ['regex-tester', 'sql-formatter', 'json-formatter', 'markdown-preview'],
  },

  'regex-tester': {
    metaTitle: 'RegEx Tester & Pattern Matcher — Live Client-Side Regular Expressions | Tools',
    metaDescription: 'Test regular expressions with real-time match highlighting, regex flag toggles, capture group inspectors, and cheat sheets. 100% in-browser.',
    howToUse: [
      'Enter your regular expression pattern and flags (g, i, m, s, u).',
      'Paste your test string into the target body editor.',
      'View highlighted matches in real time, along with capture groups and match indices.',
    ],
    faqs: [
      {
        question: 'What are regex flags in JavaScript?',
        answer: 'Flags modify pattern matching behavior: "g" enables global search across all occurrences, "i" ignores case, "m" treats strings as multiline, and "s" allows dots to match newlines.',
      },
      {
        question: 'Does this regex tester prevent catastrophic backtracking?',
        answer: 'Yes. Computations are wrapped in strict execution guards to prevent browser UI lockups from ReDoS (Regular Expression Denial of Service) patterns.',
      },
    ],
    relatedToolIds: ['cron-parser', 'diff-checker', 'sql-formatter', 'text-analyzer'],
  },

  'jwt-inspector': {
    metaTitle: 'Secure JWT Inspector & Token Decoder — Zero Data Leak Offline | Tools',
    metaDescription: 'Decode and inspect JSON Web Tokens (JWT) client-side. View header, payload claims, expiration status, and signature details with zero network egress.',
    howToUse: [
      'Paste an encoded JSON Web Token (JWT) string.',
      'Inspect decoded header and payload claims (sub, iss, exp, iat, aud).',
      'Check expiration timestamp against current time with human-readable relative countdowns.',
      'Enjoy complete peace of mind knowing your secret claims never leave your device.',
    ],
    faqs: [
      {
        question: 'Why should I never decode production JWTs on public websites?',
        answer: 'Public JWT decoders often log submitted tokens on their servers. Because JWTs frequently carry sensitive user IDs, roles, email addresses, and API scopes, uploading tokens can compromise user accounts.',
      },
      {
        question: 'What are the three parts of a JWT?',
        answer: 'A JSON Web Token consists of three parts separated by dots (.): Header (algorithm and token type), Payload (claims and data), and Signature (verifies integrity).',
      },
    ],
    relatedToolIds: ['hash-generator', 'passphrase-generator', 'base64-converter', 'url-inspector'],
  },

  'hash-generator': {
    metaTitle: 'Hash & HMAC Generator — SHA-256, MD5, SHA-512 In-Browser | Tools',
    metaDescription: 'Generate cryptographic hashes and HMAC signatures (SHA-256, SHA-512, MD5, SHA-1) client-side using native Web Crypto API. 100% private.',
    howToUse: [
      'Enter or paste text into the input field.',
      'Select your target hashing algorithm (SHA-256, SHA-512, MD5, SHA-384, SHA-1).',
      'Optionally provide a secret key to compute keyed HMAC signatures.',
      'Copy lowercase or uppercase hex hashes with one click.',
    ],
    faqs: [
      {
        question: 'How are hashes generated client-side?',
        answer: 'Hashes are computed using the browser\'s native Web Crypto API (`crypto.subtle.digest`), providing hardware-accelerated, cryptographically secure hash outputs directly on your device.',
      },
      {
        question: 'What is HMAC?',
        answer: 'HMAC (Hash-based Message Authentication Code) combines a cryptographic hash function with a secret shared key to verify both data integrity and authenticity of a message.',
      },
    ],
    relatedToolIds: ['jwt-inspector', 'passphrase-generator', 'base64-converter', 'svg-sanitizer'],
  },

  'passphrase-generator': {
    metaTitle: 'Cryptographic Passphrase & Password Generator — High Entropy Offline | Tools',
    metaDescription: 'Generate secure Diceware passphrases and random passwords using Web Crypto API. High entropy, memorable, and 100% offline with zero server transmission.',
    howToUse: [
      'Choose generator mode: Diceware Passphrase (memorable words) or Complex Password.',
      'Adjust word count or character length using the slider.',
      'Select separators (hyphen, space, underscore) and toggle numbers or capitalization.',
      'Inspect the calculated entropy in bits to verify cryptographic strength.',
    ],
    faqs: [
      {
        question: 'Why are passphrases stronger than complex passwords?',
        answer: 'A 5-word Diceware passphrase (e.g. "correct-horse-battery-staple") provides over 65 bits of entropy, making it practically impossible to brute-force while remaining effortless for humans to remember.',
      },
      {
        question: 'How is randomness generated?',
        answer: 'Randomness is sourced strictly from `window.crypto.getRandomValues`, a cryptographically secure pseudorandom number generator (CSPRNG) seeded by the operating system kernel.',
      },
    ],
    relatedToolIds: ['hash-generator', 'jwt-inspector', 'qr-code-tool', 'exif-scrubber'],
  },

  'exif-scrubber': {
    metaTitle: 'EXIF & GPS Metadata Scrubber — Remove Photo Locations Offline | Tools',
    metaDescription: 'Remove GPS coordinates, camera serial numbers, and EXIF metadata from JPEG and PNG photos locally in your browser. Zero cloud upload guarantees total photo privacy.',
    howToUse: [
      'Drag and drop photos or select images from your file picker.',
      'Inspect existing EXIF metadata (GPS coordinates, camera model, date taken).',
      'Click "Scrub Metadata" to sanitize the image binary.',
      'Download the clean, privacy-safe photo ready for social media or publication.',
    ],
    faqs: [
      {
        question: 'Why should I remove EXIF data before sharing photos?',
        answer: 'Modern smartphone cameras embed precise GPS coordinates, timestamp, camera model, and device identifiers into image files, revealing home and workplace locations.',
      },
      {
        question: 'Does this tool upload my photos to any server?',
        answer: 'No. The image file is processed in browser memory via HTML5 Canvas and ArrayBuffers. No photos ever leave your computer or phone.',
      },
    ],
    relatedToolIds: ['image-compressor', 'svg-sanitizer', 'qr-code-tool', 'pdf-manipulator'],
  },

  'image-compressor': {
    metaTitle: 'Image Compressor & WebP Converter — Local In-Browser Optimization | Tools',
    metaDescription: 'Compress JPEG, PNG, and convert to modern WebP format entirely in your browser. Reduce file size up to 80% without uploading images to any cloud server.',
    howToUse: [
      'Select or drop image files into the compressor viewport.',
      'Adjust quality slider to balance compression ratio and visual fidelity.',
      'Choose output format (Keep Original or Convert to WebP).',
      'Download the optimized images individually or in bulk.',
    ],
    faqs: [
      {
        question: 'How does in-browser image compression work?',
        answer: 'Images are drawn to an offscreen HTML5 canvas element and re-encoded using native browser codecs (`canvas.toBlob()`), ensuring hardware acceleration and zero server upload.',
      },
      {
        question: 'Why convert images to WebP?',
        answer: 'WebP provides superior lossless and lossy compression compared to JPEG and PNG, typically reducing file sizes by 25%–35% while maintaining identical visual clarity.',
      },
    ],
    relatedToolIds: ['exif-scrubber', 'svg-sanitizer', 'qr-code-tool', 'pdf-manipulator'],
  },

  'color-contrast-checker': {
    metaTitle: 'Color Contrast & WCAG 2.1 Palette Checker — Accessible Design | Tools',
    metaDescription: 'Check color contrast ratios against WCAG 2.1 AA and AAA standards for normal and large text. Real-time accessibility compliance testing for designers and developers.',
    howToUse: [
      'Pick or enter your text foreground color and background color in hex, RGB, or HSL.',
      'Review the calculated contrast ratio (e.g. 7.5:1).',
      'Inspect instant pass/fail badges for WCAG AA and AAA compliance across normal text, large text, and UI components.',
    ],
    faqs: [
      {
        question: 'What is the minimum WCAG AA contrast ratio?',
        answer: 'WCAG 2.1 Level AA requires a contrast ratio of at least 4.5:1 for normal body text and 3:1 for large text (18pt or 14pt bold). Level AAA requires 7:1 for normal text and 4.5:1 for large text.',
      },
      {
        question: 'How is contrast ratio calculated?',
        answer: 'Contrast ratio is calculated using relative luminance: (L1 + 0.05) / (L2 + 0.05), where L1 is the relative luminance of the lighter color and L2 is the darker color.',
      },
    ],
    relatedToolIds: ['svg-sanitizer', 'image-compressor', 'markdown-preview', 'qr-code-tool'],
  },

  'qr-code-tool': {
    metaTitle: 'Private QR Code Generator — High Resolution SVG & PNG No Tracking | Tools',
    metaDescription: 'Generate custom QR codes for URLs, WiFi networks, and text in your browser. No expiration, no tracking redirects, and 100% private and free forever.',
    howToUse: [
      'Select QR code content type: URL, Plain Text, or WiFi Network.',
      'Enter the target destination.',
      'Customize error correction level (L, M, Q, H) and color palette.',
      'Download crystal-clear vector SVG or high-resolution PNG file.',
    ],
    faqs: [
      {
        question: 'Do these QR codes ever expire?',
        answer: 'No. These are direct static QR codes. They do not route through any intermediary tracking redirect server, meaning they will work permanently forever.',
      },
      {
        question: 'Are my WiFi passwords or URLs safe?',
        answer: 'Yes. QR code matrix generation happens 100% in client-side JavaScript. Nothing is sent to any backend.',
      },
    ],
    relatedToolIds: ['url-inspector', 'passphrase-generator', 'color-contrast-checker', 'svg-sanitizer'],
  },

  'svg-sanitizer': {
    metaTitle: 'SVG Sanitizer & Cleaner — Prevent XSS Attacks & Strip Scripts | Tools',
    metaDescription: 'Sanitize SVG files by stripping malicious scripts, event handlers, and XSS vulnerabilities locally in your browser. Clean and safe SVG optimization.',
    howToUse: [
      'Paste SVG code or upload an SVG file.',
      'Review detected risky tags (<script>, onclick handlers, foreignObject).',
      'Download the sanitized and minified SVG ready for safe production rendering.',
    ],
    faqs: [
      {
        question: 'Can SVG files contain viruses or XSS attacks?',
        answer: 'Yes! Because SVG is an XML-based format, it can execute arbitrary JavaScript via `<script>` tags, inline event attributes (`onload`, `onerror`), and external resource links.',
      },
      {
        question: 'How does the sanitizer clean SVGs?',
        answer: 'It parses the XML DOM and enforces a strict whitelist of safe graphical tags and presentation attributes, discarding all executable nodes.',
      },
    ],
    relatedToolIds: ['color-contrast-checker', 'image-compressor', 'exif-scrubber', 'diff-checker'],
  },

  'csv-json-converter': {
    metaTitle: 'CSV ↔ JSON Converter — Bidirectional In-Browser Data Formatter | Tools',
    metaDescription: 'Convert CSV to JSON and JSON to CSV instantly in your browser. Handles nested arrays, custom delimiters, and large confidential datasets offline.',
    howToUse: [
      'Paste CSV data or JSON text into the source viewport.',
      'Select delimiter (comma, semicolon, tab) and header row preferences.',
      'Click "Convert" to generate the target data structure instantly.',
      'Export or copy formatted JSON or CSV table with zero server upload.',
    ],
    faqs: [
      {
        question: 'Is it safe to convert confidential customer CSV files?',
        answer: 'Yes. All data parsing occurs directly in your local browser memory. No data is uploaded to any server, making it compliant with strict privacy regulations.',
      },
      {
        question: 'Does it support comma-separated and tab-separated formats?',
        answer: 'Yes, it supports standard comma-delimited CSV, semicolon-delimited files, and tab-delimited TSV data.',
      },
    ],
    relatedToolIds: ['json-formatter', 'sql-formatter', 'base64-converter', 'list-deduplicator'],
  },

  'base64-converter': {
    metaTitle: 'Base64 Encoder & Decoder — Text & Binary String Converter | Tools',
    metaDescription: 'Encode and decode Base64 strings with UTF-8 support and URL-safe formats in your browser. Fast, private, and zero cloud transmission.',
    howToUse: [
      'Paste plain text to encode into Base64, or paste Base64 to decode.',
      'Toggle URL-Safe Base64 mode if encoding for query strings or HTTP headers.',
      'Copy the converted result with one click.',
    ],
    faqs: [
      {
        question: 'What is Base64 encoding?',
        answer: 'Base64 is a binary-to-text encoding scheme that translates binary data into an ASCII string format using 64 printable characters, allowing binary data to be safely transmitted over text-based protocols.',
      },
      {
        question: 'What is URL-Safe Base64?',
        answer: 'URL-Safe Base64 replaces "+" with "-" and "/" with "_", omitting padding ("=") to avoid conflicts with reserved URL characters.',
      },
    ],
    relatedToolIds: ['jwt-inspector', 'hash-generator', 'csv-json-converter', 'url-inspector'],
  },

  'url-inspector': {
    metaTitle: 'URL & Query Inspector — Parse UTM Tags & Query Parameters | Tools',
    metaDescription: 'Inspect, decode, and modify URL query strings, protocol schemes, and marketing UTM parameters with zero tracking. 100% in-browser.',
    howToUse: [
      'Paste any complex URL into the inspector input.',
      'View parsed protocol, host, port, path, and individual query parameters in a neat key-value table.',
      'Edit or add parameters dynamically and generate the clean URL.',
    ],
    faqs: [
      {
        question: 'What are UTM parameters?',
        answer: 'UTM parameters (utm_source, utm_medium, utm_campaign, utm_content, utm_term) are query tags attached to URLs to track marketing campaign effectiveness in analytics.',
      },
      {
        question: 'Are URLs shared or pinged?',
        answer: 'No. The inspector uses the native browser `URL` Web API locally. No network pings or HTTP requests are made to the target URL.',
      },
    ],
    relatedToolIds: ['qr-code-tool', 'base64-converter', 'jwt-inspector', 'case-converter'],
  },

  'text-analyzer': {
    metaTitle: 'Word Counter & Text Statistics Analyzer — Reading Time & Density | Tools',
    metaDescription: 'Count words, characters, sentences, paragraphs, and estimate reading time in your browser. Real-time text analysis with zero data storage.',
    howToUse: [
      'Type or paste text into the analyzer editor.',
      'Inspect instant metrics: word count, character count (with/without spaces), sentences, and paragraphs.',
      'Review estimated silent reading time and speech duration metrics.',
    ],
    faqs: [
      {
        question: 'How is reading time calculated?',
        answer: 'Reading time is calculated based on the average adult reading speed of 200 to 250 words per minute (WPM). Speaking time is estimated at 130 to 150 WPM.',
      },
      {
        question: 'Does this tool store my text?',
        answer: 'No. Your text exists only in temporary browser memory. Nothing is ever saved to a database or sent across the network.',
      },
    ],
    relatedToolIds: ['case-converter', 'markdown-preview', 'list-deduplicator', 'diff-checker'],
  },

  'case-converter': {
    metaTitle: 'Case Converter & URL Slug Generator — camelCase, snake_case & Title Case | Tools',
    metaDescription: 'Convert text between camelCase, snake_case, kebab-case, PascalCase, UPPERCASE, and URL slugs in your browser. 100% free and client-side.',
    howToUse: [
      'Enter your text or programming variable name.',
      'Click on any target case (camelCase, snake_case, kebab-case, Title Case, URL Slug).',
      'Copy the converted string instantly to your clipboard.',
    ],
    faqs: [
      {
        question: 'What is the difference between camelCase and PascalCase?',
        answer: 'camelCase starts with a lowercase letter and capitalizes subsequent words (e.g. `myVariableName`), whereas PascalCase capitalizes the first letter of every word (e.g. `MyClassName`).',
      },
      {
        question: 'What is a URL slug?',
        answer: 'A URL slug is a human-readable, lowercase string where spaces and punctuation are replaced by hyphens (e.g. "My First Post" becomes "my-first-post").',
      },
    ],
    relatedToolIds: ['text-analyzer', 'url-inspector', 'list-deduplicator', 'sql-formatter'],
  },

  'list-deduplicator': {
    metaTitle: 'List Deduplicator & Set Operations — Remove Duplicate Lines | Tools',
    metaDescription: 'Remove duplicate lines from lists, sort alphabetically, trim whitespace, and perform set operations (union, intersection, difference) locally in browser.',
    howToUse: [
      'Paste your list into the text area (one item per line).',
      'Choose options: Case-sensitive matching, Trim whitespace, Sort A-Z or Z-A.',
      'View cleaned, unique list items along with counts of duplicates removed.',
    ],
    faqs: [
      {
        question: 'Can this deduplicate large lists without crashing?',
        answer: 'Yes. Utilizing modern JavaScript Sets and HashSets, it can deduplicate tens of thousands of rows in sub-second time.',
      },
      {
        question: 'Is my data secure?',
        answer: '100% secure. Everything runs client-side on your local CPU. Zero data egress.',
      },
    ],
    relatedToolIds: ['text-analyzer', 'case-converter', 'csv-json-converter', 'diff-checker'],
  },

  'markdown-preview': {
    metaTitle: 'Live Markdown Previewer & HTML Exporter — GitHub Flavored | Tools',
    metaDescription: 'Write and preview GitHub Flavored Markdown (GFM) in real-time. Export clean HTML, copy formatted text, and inspect rendering offline in your browser.',
    howToUse: [
      'Type or paste Markdown into the left editor pane.',
      'See instant live HTML rendering in the right preview pane.',
      'Export rendered output as standalone HTML or copy with one click.',
    ],
    faqs: [
      {
        question: 'Does it support GitHub Flavored Markdown (GFM)?',
        answer: 'Yes, it supports tables, task lists, strikethrough, autolinks, and fenced code blocks.',
      },
      {
        question: 'Does it work offline?',
        answer: 'Yes, completely offline without any cloud rendering microservices.',
      },
    ],
    relatedToolIds: ['text-analyzer', 'pdf-manipulator', 'diff-checker', 'color-contrast-checker'],
  },

  'pdf-manipulator': {
    metaTitle: 'Local In-Browser PDF Manipulator — Merge, Split & Reorder Private PDFs | Tools',
    metaDescription: 'Merge, split, and reorder PDF pages 100% inside your browser using WebAssembly. Never upload sensitive tax documents or contracts to cloud servers.',
    howToUse: [
      'Select or drop PDF files into the tool viewport.',
      'Reorder, rotate, or remove individual pages with drag-and-drop ease.',
      'Combine multiple PDF documents into a single file, or split by page ranges.',
      'Export the resulting PDF instantly from local browser memory.',
    ],
    faqs: [
      {
        question: 'Is it safe to merge confidential tax or legal PDFs?',
        answer: 'Yes! Unlike commercial online PDF converters that store copies of your documents on their servers, our tool processes PDF byte streams entirely inside your local browser via WebAssembly / PDF-lib. Zero bytes ever leave your device.',
      },
      {
        question: 'Are there file size limits?',
        answer: 'Because processing is constrained only by your device memory, you can manipulate standard multi-page documents seamlessly without artificial subscription paywalls.',
      },
    ],
    relatedToolIds: ['markdown-preview', 'exif-scrubber', 'image-compressor', 'text-analyzer'],
  },

  'kaveri-photo-resizer': {
    metaTitle: 'Kaveri 2.0 Marriage Photo Resizer — 2673×1890 px & Under 2MB | Tools',
    metaDescription: 'Resize and calibrate couple photos for Karnataka Kaveri 2.0 marriage certificate (exact 2673×1890 px PNG under 2MB). 100% private in-browser processing.',
    howToUse: [
      'Upload your bride and groom couple photo (JPG, PNG, or WEBP).',
      'Select Kaveri Joint Photo (2673×1890 px) or Seva Sindhu Passport (200×230 px).',
      'Use interactive framing controls to pan, zoom, rotate, and center faces.',
      'Check the live portal compliance checklist to verify exact dimensions and size limit.',
      'Download your verified Kaveri-ready PNG photo instantly from local browser memory.',
    ],
    faqs: [
      {
        question: 'Why does the Kaveri 2.0 portal reject my marriage photo?',
        answer: 'The Karnataka Kaveri 2.0 portal strictly validates that joint marriage certificate photos must be exactly 2673 × 1890 pixels (ISO B2 ratio) in PNG format and under 2.0 MB. Standard online compressors alter pixel dimensions when shrinking file size, triggering upload script rejection.',
      },
      {
        question: 'Are my personal marriage photos uploaded to any server?',
        answer: 'No. All image resizing, centering, rotation, and file-size quantization run 100% locally in your web browser memory. Zero bytes or personal photos are ever sent to remote cloud servers.',
      },
      {
        question: 'What are the Sub-Registrar Office (SRO) framing rules?',
        answer: 'Both bride and groom should face forward, positioned waist-up with clear, well-lit faces against a plain white or light background. Avoid informal selfies or wedding ceremony photos where faces are obstructed.',
      },
    ],
    relatedToolIds: ['image-compressor', 'exif-scrubber', 'pdf-manipulator', 'qr-code-tool'],
  },

  'photo-redactor': {
    metaTitle: 'Private Photo Redactor & Sensitive Info Blur — Zero Cloud Uploads | Tools',
    metaDescription: 'Irreversibly pixelate, blur, or black out sensitive text, receipts, faces, and IDs 100% inside your local browser. Automatic EXIF GPS scrubbing and zero server storage.',
    howToUse: [
      'Upload any photo, document screenshot, receipt, or ID card.',
      'Select your preferred redaction style: Pixelate (scrambled blocks), Blur (Gaussian), or Blackout (solid opaque).',
      'Click and drag bounding boxes directly across sensitive names, numbers, faces, or addresses.',
      'Adjust the block size or blur intensity slider to your desired censorship level.',
      'Download your redacted image with all EXIF and GPS location metadata automatically stripped.',
    ],
    faqs: [
      {
        question: 'Can redacted text be uncovered or reversed by adjusting contrast/brightness?',
        answer: 'No. Our tool destructively modifies pixel memory buffers directly in your browser. Unlike translucent markup tools, the original pixel values are mathematically replaced with average colors or solid black before file export, making data recovery technically impossible.',
      },
      {
        question: 'Is it safe to redact sensitive financial or medical documents here?',
        answer: 'Yes! The entire redaction engine runs 100% locally in your browser memory. No image data is ever transmitted across the internet, logged, or stored on remote servers.',
      },
      {
        question: 'Does this tool remove GPS and camera metadata?',
        answer: 'Yes. When you download the redacted image, all EXIF metadata (including GPS coordinates, camera serial numbers, and capture timestamps) is automatically excluded.',
      },
    ],
    relatedToolIds: ['exif-scrubber', 'kaveri-photo-resizer', 'image-compressor', 'pdf-manipulator'],
  },

  'passport-photo-grid': {
    metaTitle: 'Printable 4×6" Passport Photo Grid Maker — 300 DPI Sheet Generator | Tools',
    metaDescription: 'Tile 4, 6, or 8 passport photos onto a standard 4x6" print sheet at exact 300 DPI with cut lines. Print for $0.30 at any pharmacy kiosk instead of paying $25 at a studio.',
    howToUse: [
      'Upload a front-facing portrait photo with a clean white background.',
      'Select your target country preset (US 2x2", Schengen/EU 35x45mm, India Passport, India Visa, UK).',
      'Use the zoom and pan controls to align head height and facial centering.',
      'Review the generated 4x6 inch (1800x1200 px at 300 DPI) sheet with subtle cutting guides.',
      'Download the print-ready JPEG and order standard 4x6" prints at CVS, Walgreens, or home for ~$0.30.',
    ],
    faqs: [
      {
        question: 'How do I print this sheet at a pharmacy or store without paying $15 passport fees?',
        answer: 'Order standard 4x6 inch (10x15 cm) photo prints, which typically cost only $0.25 to $0.35 each. Do not select the store\'s dedicated "Passport Photo" service, which charges $15+ for the exact same paper! Simply submit your downloaded 4x6 sheet as a regular photo.',
      },
      {
        question: 'What print settings should I use to avoid dimensional distortion?',
        answer: 'Always set your printer or photo kiosk to "100% / Actual Size". Never select "Fit to Page" or "Auto-Crop", as scaling the image will alter the exact millimeter dimensions required by government passport agencies.',
      },
      {
        question: 'Are cutting guidelines included?',
        answer: 'Yes. Subtle light-gray hairline cutting guides are rendered between each photo cell so you can easily cut them out with scissors or a paper trimmer.',
      },
    ],
    relatedToolIds: ['kaveri-photo-resizer', 'image-compressor', 'photo-redactor', 'exif-scrubber'],
  },
};
