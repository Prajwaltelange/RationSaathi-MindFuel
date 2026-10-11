/**
 * RationSaathi Multilingual Translation Dictionary
 * Languages: English (en), Marathi (mr), Hindi (hi)
 * 
 * Note: Marathi and Hindi wording should be reviewed by a native speaker.
 * All report lines and grievance letter statements use fixed templates with placeholders.
 */

import { LanguageCode } from '../types';

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  en: {
    // App Brand & Navigation
    'app.title': 'RationSaathi',
    'app.subtitle': 'Public Distribution Entitlement & Dispute Assistant',
    'app.banner': 'Prototype with fictional data. Roles are simulated with no password. A real system needs login, a backend and biometric/OTP verification. This tool does not verify identity or detect wrongdoing.',
    'app.footer': 'Decision-support tool. Rules shown are samples; verify against official notifications (rcms.mahafood.gov.in, NFSA 2013 section 3(1)).',
    
    // Roles & Language
    'role.citizen': 'Citizen',
    'role.shopkeeper': 'Shopkeeper',
    'role.viewingAs': 'Viewing as',
    'role.switchNotice': 'Simulated role preview (no auth required in prototype)',
    'lang.en': 'English',
    'lang.mr': 'मराठी',
    'lang.hi': 'हिन्दी',

    // Tabs
    'tab.myRation': 'My Ration',
    'tab.addReceipt': 'Add from Receipt',
    'tab.report': 'Report',
    'tab.counter': 'Shopkeeper Counter',
    'tab.rulesSetup': 'Rules Setup',
    'tab.households': 'Households',
    'tab.history': 'Audit Log',
    'tab.selfTests': 'Self-Tests',
    'tab.settings': 'Settings',
    'tab.adminSetupLabel': 'Admin setup (demo)',

    // Common Buttons & Actions
    'btn.save': 'Save',
    'btn.cancel': 'Cancel',
    'btn.edit': 'Edit',
    'btn.delete': 'Delete',
    'btn.confirm': 'Confirm (I received this)',
    'btn.notCorrect': 'Not correct',
    'btn.extract': 'Extract',
    'btn.trySample': 'Try a sample',
    'btn.loadSampleRules': 'Load sample card types',
    'btn.loadFullDemo': 'Load full demo data',
    'btn.resetAllData': 'Reset all data',
    'btn.runTests': 'Run self-tests',
    'btn.verifyHistory': 'Verify history integrity',
    'btn.downloadCsv': 'Download CSV',
    'btn.printPdf': 'Print / Save as PDF',
    'btn.generateLetter': 'Generate Grievance Letter',
    'btn.copyLetter': 'Copy text',
    'btn.close': 'Close',
    'btn.update': 'Update record',
    'btn.addMember': 'Add member',
    'btn.newHousehold': 'New Household',
    'btn.newCardType': 'New Card Type',

    // Item Translation Keys
    'item.Grain': 'Grain',
    'item.Rice': 'Rice',
    'item.Wheat': 'Wheat',
    'item.Sugar': 'Sugar',
    'item.Dal': 'Dal',
    'item.Oil': 'Oil',

    // Colours
    'colour.Yellow': 'Yellow',
    'colour.OrangeSaffron': 'Orange / Saffron',
    'colour.White': 'White',
    'colour.Custom': 'Custom colour',

    // Categories
    'cat.AAY': 'AAY (Antyodaya Anna Yojana)',
    'cat.PHH': 'PHH (Priority Household)',
    'cat.NPH': 'NPH (Non-Priority Household)',
    'cat.None': 'None',

    // Units & Periods
    'unit.kg': 'kg',
    'unit.litre': 'litre',
    'period.monthly': 'Monthly',
    'mode.PER_MEMBER': 'Per member',
    'mode.PER_CARD': 'Per card',
    'mode.PER_MEMBER_CAP': 'Per member with a cap',

    // Rules Setup Screen
    'rules.title': 'Card Types & Entitlement Rules',
    'rules.disclaimer': 'Only rules entered here are applied. No other rules are assumed. An empty rule set means no entitlement rule has been entered.',
    'rules.priceNote': 'Free grain under PMGKAY applies for the period stated by the government (till 31 Dec 2028 as per the Maharashtra Food Department page). Other items may have a price. Update the price when it changes.',
    'rules.sampleLabel': 'SAMPLE: replace with official values',
    'rules.splitNote': 'Split quantities must sum exactly to the rule quantity.',
    'rules.stockDependentLabel': 'If available in stock',
    'rules.stockDependentDesc': 'Informational only; not classified as a shortfall if unrecorded.',
    'rules.cardTypeName': 'Card Type Name',
    'rules.cardColour': 'Card Colour',
    'rules.cardCategory': 'Category',
    'rules.sourceNote': 'Source notification / reference',
    'rules.pricePerUnit': 'Price per unit (₹)',
    'rules.priceValidTill': 'Price valid till',
    'rules.splits': 'Grain splits (e.g. Rice & Wheat)',
    'rules.splitError': 'Split quantities ({splitSum} {unit}) do not match the rule quantity ({ruleQty} {unit}).',
    'rules.cannotDeleteUsed': 'Cannot delete card type because it is in use by household {cardNumber}.',

    // Household & Members
    'households.title': 'Households & Member Rosters',
    'households.cardNumber': 'Ration Card Number',
    'households.headName': 'Head of Household Name',
    'households.cardType': 'Assigned Card Type',
    'households.membersCountedLabel': 'Members counted: {count} (as of {refDate})',
    'households.refCutoffNote': 'The official cut-off for member changes was not verified; this is a user setting.',
    'households.healthChecklistTitle': 'Card Health Checklist',
    'households.healthNote': 'Self-reported checklist for verifying potential administrative barriers.',
    'households.aadhaarLinked': 'Aadhaar linked for all members',
    'households.ekycDone': 'e-KYC completed / verified',
    'households.shopMapped': 'Ration card mapped to this fair price shop',
    'households.memberListCurrent': 'Member roster is current in official portal',
    'households.mobileRegistered': 'Mobile number registered for OTP / SMS notifications',
    'households.memberAddedOn': 'Added on',
    'households.memberRemovedOn': 'Removed on',
    'households.memberReason': 'Reason for change',
    'households.reasonInitial': 'Initial registration',
    'households.reasonBirth': 'Birth in family',
    'households.reasonMarriage': 'Marriage',
    'households.reasonDeath': 'Death',
    'households.reasonOther': 'Other administrative change',
    'households.cannotDeleteWithRecords': 'Cannot delete household because it has existing distribution records.',
    'households.dateOrderError': 'Removal date cannot be before the date added.',

    // Math & Citizen Screen ("My Ration")
    'citizen.title': 'My Ration Entitlements',
    'citizen.entitlementMath': '{members} members × {rate} {unit} = {total} {unit}',
    'citizen.entitlementPerCardMath': '{rate} {unit} per card',
    'citizen.entitlementCapMath': '{members} members × {rate} {unit} (capped at {cap} {unit}) = {total} {unit}',
    'citizen.confirmed': 'Confirmed',
    'citizen.pending': 'Pending',
    'citizen.remaining': 'Remaining',
    'citizen.entitled': 'Entitled',
    'citizen.received': 'Received',
    'citizen.pendingTitle': 'Pending Entries Awaiting Your Confirmation',
    'citizen.otpInstruction': 'Share this OTP code with the shopkeeper only if you received the items in full.',
    'citizen.otpCodeLabel': 'Demo OTP Code: {code}',
    'citizen.disputePrompt': 'Please provide a short factual note explaining what is not correct:',
    'citizen.historyGridTitle': '6-Month Entitlement Status History',
    'citizen.stockTitle': 'Stock-Dependent Items (Informational)',
    'citizen.stockExplanation': 'These items are subject to fair price shop stock availability. Not recorded as shortfall.',
    'citizen.priceCardTitle': 'Price & Payment Check',
    'citizen.expectedPrice': 'Expected amount',
    'citizen.recordedPaid': 'Amount recorded paid',
    'citizen.itemsToVerify': 'Card Verification Items (from Health Checklist)',

    // Shopkeeper Screen
    'shopkeeper.title': 'Fair Price Shop Counter',
    'shopkeeper.searchCard': 'Search Household by Card Number',
    'shopkeeper.selectCardPrompt': 'Select a household to view entitlements and record distributions.',
    'shopkeeper.enterQty': 'Quantity issued ({unit})',
    'shopkeeper.enterAmount': 'Amount charged (₹)',
    'shopkeeper.enterDate': 'Distribution date',
    'shopkeeper.enterPlace': 'Distribution location',
    'shopkeeper.placeHome': 'This shop (mapped home shop)',
    'shopkeeper.placeOther': 'Another shop (portability)',
    'shopkeeper.placeUnknown': 'Unknown location',
    'shopkeeper.sourceNote': 'Receipt / reference note',
    'shopkeeper.exceedWarning': 'Entered quantity is above the remaining entitlement under the entered rule (remaining: {remaining} {unit}).',
    'shopkeeper.exceedReasonPrompt': 'Reason required for distribution above remaining entitlement:',
    'shopkeeper.otpVerification': 'Verify with Customer OTP',
    'shopkeeper.otpInputPlaceholder': 'Enter 4-digit OTP from citizen screen',
    'shopkeeper.verifyOtpBtn': 'Verify OTP & Confirm',
    'shopkeeper.otpLocked': 'OTP verification locked after 3 unsuccessful attempts. Citizen can still confirm or dispute directly.',
    'shopkeeper.otpWrong': 'Incorrect OTP code. {remaining} attempt(s) remaining.',
    'shopkeeper.otpSuccess': 'OTP verified successfully. Record marked as Confirmed.',
    'shopkeeper.recentRecords': 'Recent Distribution Entries for this Household',
    'shopkeeper.recordCorrectionNote': 'In compliance with audit standards, entries are append-only. To adjust a quantity, create a balancing entry.',

    // Classifications & Statuses
    'status.Pending': 'Pending',
    'status.Confirmed': 'Confirmed',
    'status.Disputed': 'Disputed',
    
    'class.noRule': 'No rule entered',
    'class.unclear': 'Unclear',
    'class.unrecorded': 'Unrecorded',
    'class.awaiting': 'Awaiting confirmation',
    'class.full': 'Received in full',
    'class.above': 'Recorded above rule',
    'class.shortfall': 'Shortfall',
    
    'class.noRuleReason': 'No entitlement rules have been defined for this card category.',
    'class.unclearReasonNoEntitlement': 'Entitlement is zero or no active members were counted for the selected reference date.',
    'class.unclearReasonDisputed': 'Contains one or more disputed entries or records with unverified sources.',
    'class.unrecordedReason': 'No entries have been recorded for this item in the selected month.',
    'class.awaitingReason': 'Entries have been recorded by the shopkeeper but have not yet been confirmed by the citizen or OTP.',
    'class.fullReason': 'Confirmed received quantity matches the rule entitlement exactly.',
    'class.aboveReason': 'Recorded quantity exceeds rule entitlement. The underlying operational cause is not determined.',
    'class.shortfallReason': 'Recorded quantity is below the entitlement under the entered rule.',

    // Tags
    'tag.lateEntry': 'Late entry',
    'tag.otherShop': 'Collected at another shop',

    // Evidence Badges
    'badge.strong': 'Strong evidence',
    'badge.medium': 'Medium evidence',
    'badge.weak': 'Weak evidence',
    'badge.unclear': 'Unclear source',
    
    // Receipt Extractor
    'receipt.title': 'Add from Receipt or Handwritten Note',
    'receipt.pastePrompt': 'Paste receipt text, SMS text, or informal handwritten note below:',
    'receipt.suggestionHeader': 'Parser suggestion: please verify before saving',
    'receipt.suggestionNote': 'Verify the detected details below. No record will be saved until you press Confirm.',
    'receipt.engineLocal': 'Local offline parser',
    'receipt.engineGemini': 'Gemini parser suggestion',
    'receipt.flagYear': 'Note: Year was not specified in the receipt and was defaulted to the current calendar year.',
    'receipt.flagUnconfident': 'Note: Date or quantity could not be determined with confidence and is left empty for you to enter.',
    'receipt.savedSuccess': 'Receipt record successfully added with Confirmed status.',

    // Price Checks
    'price.matches': 'Matches expected price (₹{expected})',
    'price.differs': 'Amount recorded as paid differs from the expected amount by ₹{diff} (cause not determined).',
    'price.notRecorded': 'Amount not recorded.',
    'price.expired': 'Price rule expired, please update.',
    'price.noRule': 'Price rule not entered.',

    // Mismatch Hint
    'mismatch.hint': 'Recorded quantity ({qty} {unit}) is consistent with the {matchedCard} rule rather than the {currentCard} rule. Please verify the card colour/category on record.',

    // Report
    'report.title': 'Neutral Entitlement & Distribution Report',
    'report.disclaimerTop': 'This report shows a difference between expected and recorded quantities. The cause is not determined; it may have benign explanations such as stock shortages or recording errors. No wrongdoing is implied. A human authority must review any concern.',
    'report.disclaimerBottom': 'This report is generated strictly from the user-entered rules and local records. It does not constitute legal proof or biometric verification.',
    'report.appliedRule': 'Card: {cardName} ({category}), {item}, {qtyDesc}. Entitled: {entitled} {unit}.',
    'report.twoNumbersDiff': 'Difference between entitled and confirmed: {diff1} {unit}. Difference if pending entries were confirmed: {diff2} {unit}.',
    'report.pendingSection': 'Pending Entries (Not yet confirmed)',
    'report.disputedSection': 'Disputed Entries (Under query)',
    'report.questionsHeader': 'Questions that may help clarify this difference:',
    'report.q1': 'Was there an temporary stock shortage or delayed transport at the fair price shop?',
    'report.q2': 'Is any grain delivery scheduled or pending later in the month?',
    'report.q3': 'Could an entry be missing, duplicate, or misread from a physical register?',
    'report.q4': 'Did the active family member roster change recently around the monthly cut-off date?',
    'report.q5': 'Is the ration card active, mapped to the correct shop, and e-KYC verified?',
    'report.q6': 'Was there an electronic PoS device error, connectivity failure, or biometric issue?',
    'report.q7': 'Could part of the monthly quota have been collected at another shop under portability?',
    'report.compareHeader': 'Compare Entitlements Across Card Types (for {members} members)',

    // Grievance Letter
    'letter.title': 'Neutral Grievance Letter Draft',
    'letter.draftNotice': 'Draft for the card holder to review and edit. Placeholders and contact details should be filled by the user.',
    'letter.authorityPlaceholder': 'To: The Tahsildar / Food & Civil Supplies Officer / Rationing Authority',
    'letter.officeAddressPlaceholder': 'Office: [Enter Sub-Division / Tehsil / Food Office Address]',
    'letter.helplinePlaceholder': 'Helpline / Reference: [e.g. 1967 / 1800-22-4950 or Local Helpdesk]',
    'letter.subject': 'Subject: Request for factual verification of Public Distribution distribution records for Card No: {cardNumber}',
    'letter.bodyGreeting': 'Respected Sir / Madam,',
    'letter.bodyP1': 'I am writing as the registered card holder of Ration Card No: {cardNumber} (Head of Household: {headName}, Category: {category}, Colour: {colour}).',
    'letter.bodyP2': 'For the month of {month}, our household has {members} counted members. Under the applicable distribution rule ({appliedRule}), our total entitlement is {entitled} {unit}.',
    'letter.bodyP3': 'According to the physical distribution records available to us, a total of {confirmed} {unit} has been recorded as received, leaving an unfulfilled quantity of {diff} {unit} (with {pending} {unit} currently in pending status).',
    'letter.bodyP4': 'We understand that differences may arise from stock supply delays, porting differences, or clerical record updates. No wrongdoing is implied. We kindly request the authority to review the recorded receipts and clarify the status of our remaining entitlement.',
    'letter.bodyP5': 'Thank you for your assistance.',
    'letter.bodySign': 'Yours faithfully,\n{headName}\nRation Card No: {cardNumber}\nDate: {date}',
    'letter.copied': 'Letter copied to clipboard.',

    // Neutrality Guard
    'guard.passed': 'Neutral language check passed',
    'guard.masked': '{count} word(s) masked for neutrality',
    'guard.userBoxTitle': 'As entered by the user (unmodified source evidence):',

    // Settings Screen
    'settings.title': 'Application Settings & Configurations',
    'settings.language': 'Language / भाषा',
    'settings.role': 'Active Simulation Role',
    'settings.month': 'Selected Month',
    'settings.refDay': 'Member Count Cut-off Reference Day',
    'settings.refFirst': 'First day of month (1st)',
    'settings.refLast': 'Last day of month',
    'settings.refCustom': 'Custom day of month (1 - 28)',
    'settings.otpToggle': 'Enable Simulated OTP Verification',
    'settings.geminiToggle': 'Enable Optional Gemini AI Receipt Extractor',
    'settings.geminiNote': 'Core app works offline without AI. When enabled, only anonymized receipt text is sent.',
    'settings.shopName': 'Fictional Shop Name / Code',
    'settings.resetConfirm': 'Are you sure you want to reset all data? This will clear all local records.',

    // Audit History
    'history.title': 'Audit Log & Cryptographic Hash Chain',
    'history.tamperNote': 'Stored in this browser only; this detects partial edits, it is not tamper-proof.',
    'history.valid': 'Integrity check passed: all block hashes are cryptographically chained and valid.',
    'history.broken': 'Integrity issue detected at log entry #{index}. Hash does not match previous link.',

    // Self-Tests
    'tests.title': 'Calculation & Neutrality Automated Self-Tests',
    'tests.runBtn': 'Run self-tests suite',
    'tests.allPassed': 'All {count} self-tests passed successfully.',
    'tests.failures': '{failures} of {count} tests failed.',
  },

  mr: {
    // App Brand & Navigation
    'app.title': 'रेशनसाथी',
    'app.subtitle': 'सार्वजनिक वितरण हक्क आणि तफावत सहाय्यक',
    'app.banner': 'काल्पनिक माहितीवर आधारित नमुना ॲप. पासवर्डशिवाय भूमिका बदलता येते. प्रत्यक्ष प्रणालीसाठी लॉगिन, बायोमेट्रिक व अधिकृत पडताळणी आवश्यक असते. हे साधन कोणाचाही दोष ठरवत नाही.',
    'app.footer': 'निर्णय-सहाय्यक साधन. दर्शवलेले नियम केवळ नमुने आहेत; अधिकृत शासकीय अधिसूचनांद्वारे (rcms.mahafood.gov.in, NFSA 2013 कलम ३(१)) पडताळणी करावी.',
    
    // Roles & Language
    'role.citizen': 'नागरिक',
    'role.shopkeeper': 'दुकानदार',
    'role.viewingAs': 'पाहत आहात',
    'role.switchNotice': 'प्रात्यक्षिक भूमिका निवड (नमुना ॲप)',
    'lang.en': 'English',
    'lang.mr': 'मराठी',
    'lang.hi': 'हिन्दी',

    // Tabs
    'tab.myRation': 'माझे रेशन',
    'tab.addReceipt': 'पावतीवरून नोंदवा',
    'tab.report': 'अहवाल',
    'tab.counter': 'दुकान काऊंटर',
    'tab.rulesSetup': 'नियम मांडणी',
    'tab.households': 'कुटुंबे',
    'tab.history': 'नोंदवही इतिहास',
    'tab.selfTests': 'स्वयं-चाचण्या',
    'tab.settings': 'सेटिंग्ज',
    'tab.adminSetupLabel': 'प्रशासकीय मांडणी (डेमो)',

    // Common Buttons & Actions
    'btn.save': 'जतन करा',
    'btn.cancel': 'रद्द करा',
    'btn.edit': 'बदला',
    'btn.delete': 'हटवा',
    'btn.confirm': 'पुष्टी करा (मला मिळाले)',
    'btn.notCorrect': 'योग्य नाही',
    'btn.extract': 'माहिती काढा',
    'btn.trySample': 'नमुना निवडा',
    'btn.loadSampleRules': 'नमुना शिधापत्रिका नियम भरा',
    'btn.loadFullDemo': 'संपूर्ण प्रात्यक्षिक माहिती भरा',
    'btn.resetAllData': 'सर्व माहिती पूर्ववत करा',
    'btn.runTests': 'चाचण्या चालवा',
    'btn.verifyHistory': 'नोंदवही अखंडता तपासा',
    'btn.downloadCsv': 'CSV डाउनलोड करा',
    'btn.printPdf': 'प्रिंट / PDF म्हणून जतन करा',
    'btn.generateLetter': 'तक्रार अर्ज मसुदा तयार करा',
    'btn.copyLetter': 'मजकूर कॉपी करा',
    'btn.close': 'बंद करा',
    'btn.update': 'नोंद अद्ययावत करा',
    'btn.addMember': 'सदस्य जोडा',
    'btn.newHousehold': 'नवीन कुटुंब',
    'btn.newCardType': 'नवीन शिधापत्रिका प्रकार',

    // Item Translation Keys
    'item.Grain': 'धान्य',
    'item.Rice': 'तांदूळ',
    'item.Wheat': 'गहू',
    'item.Sugar': 'साखर',
    'item.Dal': 'डाळ',
    'item.Oil': 'तेल',

    // Colours
    'colour.Yellow': 'पिवळा',
    'colour.OrangeSaffron': 'केशरी',
    'colour.White': 'पांढरा',
    'colour.Custom': 'इतर रंग',

    // Categories
    'cat.AAY': 'AAY (अंत्योदय अन्न योजना)',
    'cat.PHH': 'PHH (प्राधान्य कुटुंब)',
    'cat.NPH': 'NPH (अ-प्राधान्य कुटुंब)',
    'cat.None': 'लागू नाही',

    // Units & Periods
    'unit.kg': 'किलो',
    'unit.litre': 'लिटर',
    'period.monthly': 'मासिक',
    'mode.PER_MEMBER': 'प्रति सदस्य',
    'mode.PER_CARD': 'प्रति शिधापत्रिका',
    'mode.PER_MEMBER_CAP': 'प्रति सदस्य (मर्यादेसह)',

    // Rules Setup Screen
    'rules.title': 'शिधापत्रिका प्रकार व नियमांची रचना',
    'rules.disclaimer': 'येथे भरलेले नियमच लागू होतात. कोणताही अन्य नियम गृहीत धरला जात नाही. नियम नसल्यास कोणताही हक्क लागू होणार नाही.',
    'rules.priceNote': 'पीएमजीकेएवाय अंतर्गत मोफत धान्य शासनाने जाहीर केलेल्या मुदतीपर्यंत (महाराष्ट्र अन्न नागरी पुरवठा विभागाच्या माहितीनुसार ३१ डिसेंबर २०२८ पर्यंत) लागू आहे. इतर वस्तूंना दर असू शकतात.',
    'rules.sampleLabel': 'नमुना: अधिकृत मूल्यांशी पडताळून घ्या',
    'rules.splitNote': 'विभाजनाची बेरीज मूळ प्रमाणाशी तंतोतंत जुळली पाहिजे.',
    'rules.stockDependentLabel': 'साठा उपलब्ध असल्यास',
    'rules.stockDependentDesc': 'केवळ माहितीसाठी; न मिळाल्यास तूट म्हणून मोजले जात नाही.',
    'rules.cardTypeName': 'शिधापत्रिका प्रकार नाव',
    'rules.cardColour': 'शिधापत्रिकेचा रंग',
    'rules.cardCategory': 'प्रवर्ग',
    'rules.sourceNote': 'शासकीय संदर्भ / अधिसूचना',
    'rules.pricePerUnit': 'प्रति युनिट दर (₹)',
    'rules.priceValidTill': 'दर वैधता तारीख',
    'rules.splits': 'धान्य विभाजन (उदा. तांदूळ आणि गहू)',
    'rules.splitError': 'विभाजनाची बेरीज ({splitSum} {unit}) मूळ नियमाशी ({ruleQty} {unit}) जुळत नाही.',
    'rules.cannotDeleteUsed': 'ही शिधापत्रिका कुटुंब {cardNumber} द्वारे वापरली जात असल्याने हटवता येत नाही.',

    // Household & Members
    'households.title': 'कुटुंबे व सदस्य यादी',
    'households.cardNumber': 'शिधापत्रिका क्रमांक',
    'households.headName': 'कुटुंब प्रमुखाचे नाव',
    'households.cardType': 'शिधापत्रिका प्रकार',
    'households.membersCountedLabel': 'मोजलेले सदस्य: {count} ({refDate} रोजी)',
    'households.refCutoffNote': 'सदस्य बदलाची अधिकृत अंतिम तारीख पडताळलेली नाही; ही वापरकर्त्याची निवड आहे.',
    'households.healthChecklistTitle': 'शिधापत्रिका तपासणी यादी',
    'households.healthNote': 'संभाव्य प्रशासकीय अडचणी तपासण्यासाठी स्वतः भरलेली यादी.',
    'households.aadhaarLinked': 'सर्व सदस्यांचे आधार लिंक आहे',
    'households.ekycDone': 'ई-केवायसी (e-KYC) पूर्ण झाले आहे',
    'households.shopMapped': 'शिधापत्रिका या रास्त भाव दुकानाशी जोडलेली आहे',
    'households.memberListCurrent': 'पोर्टलवर सदस्य यादी अद्ययावत आहे',
    'households.mobileRegistered': 'मोबाईल क्रमांक नोंदणीकृत आहे',
    'households.memberAddedOn': 'जोडल्याची तारीख',
    'households.memberRemovedOn': 'कमी केल्याची तारीख',
    'households.memberReason': 'बदलाचे कारण',
    'households.reasonInitial': 'मूळ नोंदणी',
    'households.reasonBirth': 'कुटुंबात जन्म',
    'households.reasonMarriage': 'विवाह',
    'households.reasonDeath': 'मृत्यू',
    'households.reasonOther': 'इतर प्रशासकीय बदल',
    'households.cannotDeleteWithRecords': 'या कुटुंबाच्या वितरणाच्या नोंदी असल्याने कुटुंब हटवता येत नाही.',
    'households.dateOrderError': 'कमी केल्याची तारीख जोडल्याच्या तारखेपूर्वी असू शकत नाही.',

    // Math & Citizen Screen ("My Ration")
    'citizen.title': 'माझे रेशन व हक्क',
    'citizen.entitlementMath': '{members} सदस्य × {rate} {unit} = {total} {unit}',
    'citizen.entitlementPerCardMath': '{rate} {unit} प्रति शिधापत्रिका',
    'citizen.entitlementCapMath': '{members} सदस्य × {rate} {unit} (कमाल मर्यादा {cap} {unit}) = {total} {unit}',
    'citizen.confirmed': 'खात्री केलेली',
    'citizen.pending': 'प्रलंबित',
    'citizen.remaining': 'शिल्लक',
    'citizen.entitled': 'पात्र हक्क',
    'citizen.received': 'मिळालेले',
    'citizen.pendingTitle': 'तुमच्या पुष्टीची वाट पाहणाऱ्या नोंदी',
    'citizen.otpInstruction': 'धान्य पूर्ण मिळाल्याची खात्री पटल्यासच हा ओटीपी दुकानदारास द्या.',
    'citizen.otpCodeLabel': 'नमुना ओटीपी कोड: {code}',
    'citizen.disputePrompt': 'नोंद योग्य नसल्यास कृपया वस्तुनिष्ठ कारण लिहा:',
    'citizen.historyGridTitle': 'गेल्या ६ महिन्यांचा वितरण इतिहास',
    'citizen.stockTitle': 'साठ्यावर आधारित वस्तू (केवळ माहितीसाठी)',
    'citizen.stockExplanation': 'या वस्तू दुकानातील उपलब्धतेवर अवलंबून असतात. न मिळाल्यास तूट मानली जात नाही.',
    'citizen.priceCardTitle': 'दर व रक्कम पडताळणी',
    'citizen.expectedPrice': 'अपेक्षित रक्कम',
    'citizen.recordedPaid': 'नोंदवलेली रक्कम',
    'citizen.itemsToVerify': 'पडताळणी आवश्यक बाबी (तपासणी यादीनुसार)',

    // Shopkeeper Screen
    'shopkeeper.title': 'रास्त भाव दुकान काऊंटर',
    'shopkeeper.searchCard': 'शिधापत्रिका क्रमांकाने शोधा',
    'shopkeeper.selectCardPrompt': 'पात्रता पाहण्यासाठी व नोंद करण्यासाठी कुटुंब निवडा.',
    'shopkeeper.enterQty': 'दिलेले प्रमाण ({unit})',
    'shopkeeper.enterAmount': 'घेतलेली रक्कम (₹)',
    'shopkeeper.enterDate': 'वितरण तारीख',
    'shopkeeper.enterPlace': 'वितरण ठिकाण',
    'shopkeeper.placeHome': 'हे दुकान (मूळ नेमून दिलेले)',
    'shopkeeper.placeOther': 'दुसरे दुकान (पोर्टेबिलिटी)',
    'shopkeeper.placeUnknown': 'अज्ञात ठिकाण',
    'shopkeeper.sourceNote': 'पावती / संदर्भ नोंद',
    'shopkeeper.exceedWarning': 'नोंदवलेले प्रमाण शिल्लक हक्कापेक्षा जास्त आहे (शिल्लक: {remaining} {unit}).',
    'shopkeeper.exceedReasonPrompt': 'जास्त वितरणाचे कारण देणे आवश्यक आहे:',
    'shopkeeper.otpVerification': 'ग्राहकाच्या ओटीपीने खात्री करा',
    'shopkeeper.otpInputPlaceholder': 'नागरिकाच्या स्क्रीनवरील ४ अंकी ओटीपी टाका',
    'shopkeeper.verifyOtpBtn': 'ओटीपी तपासा आणि पुष्टी करा',
    'shopkeeper.otpLocked': '३ चुकीच्या प्रयत्नांनंतर ओटीपी बंद झाला आहे. नागरिक स्वतः पुष्टी किंवा हरकत नोंदवू शकतात.',
    'shopkeeper.otpWrong': 'चुकीचा ओटीपी. {remaining} प्रयत्न शिल्लक.',
    'shopkeeper.otpSuccess': 'ओटीपी पडताळणी यशस्वी. नोंद खात्रीशीर म्हणून चिन्हांकित झाली.',
    'shopkeeper.recentRecords': 'या कुटुंबासाठी अलीकडील नोंदी',
    'shopkeeper.recordCorrectionNote': 'लेखापरीक्षण मानकांनुसार नोंदी बदलल्या जात नाहीत. दुरुस्तीसाठी नवी नोंद करावी.',

    // Classifications & Statuses
    'status.Pending': 'प्रलंबित',
    'status.Confirmed': 'खात्री झालेली',
    'status.Disputed': 'हरकत घेतलेली',
    
    'class.noRule': 'नियम नोंदवला नाही',
    'class.unclear': 'अस्पष्ट',
    'class.unrecorded': 'नोंद नाही',
    'class.awaiting': 'पुष्टीची प्रतीक्षा',
    'class.full': 'पूर्ण मिळाले',
    'class.above': 'नियमापेक्षा जास्त नोंद',
    'class.shortfall': 'तूट',
    
    'class.noRuleReason': 'या शिधापत्रिकेसाठी कोणताही हक्क नियम नोंदवला गेलेला नाही.',
    'class.unclearReasonNoEntitlement': 'हक्क शून्य आहे किंवा निवडलेल्या तारखेला सक्रिय सदस्य मोजले गेले नाहीत.',
    'class.unclearReasonDisputed': 'नोंदीवर हरकत घेतली आहे किंवा माहिती अपूर्ण आहे.',
    'class.unrecordedReason': 'या महिन्यासाठी या वस्तूची कोणतीही नोंद आढळली नाही.',
    'class.awaitingReason': 'दुकानदाराने नोंद केली आहे, परंतु नागरिकाने किंवा ओटीपीने पुष्टी दिलेली नाही.',
    'class.fullReason': 'मिळालेले प्रमाण नियमानुसार ठरलेल्या हक्काशी तंतोतंत जुळते.',
    'class.aboveReason': 'नोंदवलेले प्रमाण नियमापेक्षा अधिक आहे. याचे नेमके कारण स्पष्ट झालेले नाही.',
    'class.shortfallReason': 'नोंदवलेले प्रमाण नियमानुसार असलेल्या हक्कापेक्षा कमी आहे.',

    // Tags
    'tag.lateEntry': 'उशिरा झालेली नोंद',
    'tag.otherShop': 'दुसऱ्या दुकानातून घेतलेले',

    // Evidence Badges
    'badge.strong': 'मजबूत पुरावा',
    'badge.medium': 'मध्यम पुरावा',
    'badge.weak': 'कमकुवत पुरावा',
    'badge.unclear': 'अस्पष्ट स्रोत',
    
    // Receipt Extractor
    'receipt.title': 'पावती किंवा हस्तलिखित चिठ्ठीवरून नोंद',
    'receipt.pastePrompt': 'पावतीचा मजकूर, एसएमएस किंवा चिठ्ठीचा मजकूर येथे पेस्ट करा:',
    'receipt.suggestionHeader': 'पार्सरची सूचना: जतन करण्यापूर्वी तपासा',
    'receipt.suggestionNote': 'खालील माहिती तपासा. आपण पुष्टी करेपर्यंत कोणतीही नोंद जतन केली जाणार नाही.',
    'receipt.engineLocal': 'स्थानिक ऑफलाइन पार्सर',
    'receipt.engineGemini': 'जेमिनी एआय पार्सर सूचना',
    'receipt.flagYear': 'टीप: पावतीमध्ये वर्ष नमूद नसल्याने चालू वर्ष गृहीत धरले आहे.',
    'receipt.flagUnconfident': 'टीप: तारीख किंवा प्रमाण निश्चित समजले नसल्याने रकाना रिकामा ठेवला आहे.',
    'receipt.savedSuccess': 'पावतीची नोंद यशस्वीपणे खात्रीशीर म्हणून जतन केली गेली.',

    // Price Checks
    'price.matches': 'अपेक्षित दराशी जुळते (₹{expected})',
    'price.differs': 'दिलेली रक्कम अपेक्षित रकमेपेक्षा ₹{diff} ने वेगळी आहे (कारण स्पष्ट नाही).',
    'price.notRecorded': 'रक्कम नोंदवली नाही.',
    'price.expired': 'दर नियम कालबाह्य झाला आहे, कृपया अद्ययावत करा.',
    'price.noRule': 'दर नियम नोंदवलेला नाही.',

    // Mismatch Hint
    'mismatch.hint': 'नोंदवलेले प्रमाण ({qty} {unit}) हे सध्याच्या {currentCard} नियमापेक्षा {matchedCard} नियमाशी सुसंगत आहे. कृपया अधिकृत शिधापत्रिका रंग/प्रवर्ग तपासावा.',

    // Report
    'report.title': 'वस्तुनिष्ठ हक्क आणि वितरण अहवाल',
    'report.disclaimerTop': 'हा अहवाल अपेक्षित आणि नोंदवलेल्या प्रमाणातील फरक दर्शवतो. याचे कारण ठरवलेले नाही; साठा कमी असणे किंवा नोंदणीतील त्रुटी यांसारखी सर्वसामान्य कारणे असू शकतात. कोणावरही गैरव्यवहाराचा आरोप केलेला नाही. कोणत्याही बाबीची मानवी अधिकाऱ्याने चौकशी करावी.',
    'report.disclaimerBottom': 'हा अहवाल केवळ वापरकर्त्याने नोंदवलेले नियम आणि स्थानिक नोंदींवर आधारित आहे. हा कायदेशीर पुरावा किंवा बायोमेट्रिक पडताळणी मानला जाऊ शकत नाही.',
    'report.appliedRule': 'शिधापत्रिका: {cardName} ({category}), {item}, {qtyDesc}. हक्क: {entitled} {unit}.',
    'report.twoNumbersDiff': 'हक्क आणि खात्रीशीर नोंदीतील फरक: {diff1} {unit}. प्रलंबित नोंदींची पुष्टी झाल्यास फरक: {diff2} {unit}.',
    'report.pendingSection': 'प्रलंबित नोंदी (अद्याप पुष्टी नाही)',
    'report.disputedSection': 'हरकत घेतलेल्या नोंदी (तपासणीखाली)',
    'report.questionsHeader': 'हा फरक समजून घेण्यासाठी उपयुक्त प्रश्न:',
    'report.q1': 'दुकानात तात्पुरता साठा कमी होता का किंवा वाहतुकीस विलंब झाला होता का?',
    'report.q2': 'चालू महिन्यात उर्वरित धान्याचे वितरण नंतर नियोजित आहे का?',
    'report.q3': 'नोंद वहीत दुबार नोंद झाली किंवा वाचनात चूक झाली असण्याची शक्यता आहे का?',
    'report.q4': 'महिन्याच्या शेवटी कुटुंबातील सदस्यांच्या संख्येत काही बदल झाला होता का?',
    'report.q5': 'शिधापत्रिका सक्रिय असून योग्य दुकानाशी जोडलेली व ई-केवायसी पूर्ण आहे का?',
    'report.q6': 'पॉस (PoS) यंत्रामध्ये किंवा बायोमेट्रिक यंत्रणेत काही तांत्रिक अडचण आली होती का?',
    'report.q7': 'पोर्टेबिलिटी सुविधेद्वारे धान्याचा काही भाग दुसऱ्या दुकानातून घेतला गेला होता का?',
    'report.compareHeader': 'शिधापत्रिका प्रकारानुसार हक्कांची तुलना ({members} सदस्यांसाठी)',

    // Grievance Letter
    'letter.title': 'वस्तुनिष्ठ तक्रार अर्ज मसुदा',
    'letter.draftNotice': 'शिधापत्रिकाधारकाने वाचून बदल करण्यासाठीचा मसुदा. संपर्क तपशील वापरकर्त्याने स्वतः भरावेत.',
    'letter.authorityPlaceholder': 'प्रति: तहसीलदार / अन्न धान्य पुरवठा अधिकारी / रेशनिंग प्राधिकरण',
    'letter.officeAddressPlaceholder': 'कार्यालय: [उपविभाग / तहसील / पुरवठा कार्यालयाचा पत्ता लिहा]',
    'letter.helplinePlaceholder': 'हेल्पलाईन / संदर्भ: [उदा. १९६७ / १८००-२२-४९५० किंवा स्थानिक मदत केंद्र]',
    'letter.subject': 'विषय: शिधापत्रिका क्र. {cardNumber} च्या वितरण नोंदींच्या वस्तुनिष्ठ पडताळणीबाबत विनंती',
    'letter.bodyGreeting': 'महोदय / महोदया,',
    'letter.bodyP1': 'मी शिधापत्रिका क्रमांक: {cardNumber} चा नोंदणीकृत धारक आहे (कुटुंब प्रमुख: {headName}, प्रवर्ग: {category}, रंग: {colour}).',
    'letter.bodyP2': '{month} या महिन्यासाठी आमच्या कुटुंबात {members} सदस्य आहेत. लागू नियमानुसार ({appliedRule}), आमचा एकूण हक्क {entitled} {unit} आहे.',
    'letter.bodyP3': 'आमच्याकडे उपलब्ध नोंदींनुसार एकूण {confirmed} {unit} मिळाले असल्याचे नोंदवले गेले आहे, ज्यामुळे {diff} {unit} ची तफावत दिसून येते (तसेच {pending} {unit} प्रलंबित स्थितीत आहेत).',
    'letter.bodyP4': 'साठा टंचाई किंवा नोंदीतील विसंगतीमुळे असा फरक होऊ शकतो याची आम्हाला जाणीव आहे. कोणावरही कोणताही आक्षेप घेतलेला नाही. महोदयांनी उपलब्ध नोंदींची पडताळणी करून वस्तुस्थिती स्पष्ट करावी ही नम्र विनंती.',
    'letter.bodySign': 'आपला नम्र,\n{headName}\nशिधापत्रिका क्र: {cardNumber}\nतारीख: {date}',
    'letter.copied': 'अर्जाचा मजकूर कॉपी केला गेला.',

    // Neutrality Guard
    'guard.passed': 'तटस्थ भाषा तपासणी उत्तीर्ण',
    'guard.masked': '{count} शब्द तटस्थतेसाठी झाकले गेले',
    'guard.userBoxTitle': 'वापरकर्त्याने मूळ भरल्यानुसार पुरावा:',

    // Settings Screen
    'settings.title': 'ॲप्लिकेशन सेटिंग्ज',
    'settings.language': 'भाषा / Language',
    'settings.role': 'सक्रिय प्रात्यक्षिक भूमिका',
    'settings.month': 'निवडलेला महिना',
    'settings.refDay': 'सदस्य मोजणीचा संदर्भ दिवस',
    'settings.refFirst': 'महिन्याचा पहिला दिवस (१ तारीख)',
    'settings.refLast': 'महिन्याचा शेवटचा दिवस',
    'settings.refCustom': 'महिन्यातील ठराविक दिवस (१ ते २८)',
    'settings.otpToggle': 'नमुना ओटीपी पडताळणी चालू ठेवा',
    'settings.geminiToggle': 'ऐच्छिक जेमिनी एआय पावती पार्सर वापरा',
    'settings.geminiNote': 'मुख्य ॲप एआयशिवाय ऑफलाइन चालते. चालू केल्यास केवळ पावतीचा मजकूर पाठवला जातो.',
    'settings.shopName': 'काल्पनिक दुकानाचे नाव / कोड',
    'settings.resetConfirm': 'आपण खरोखर सर्व माहिती पूर्ववत करू इच्छिता? यामुळे सर्व स्थानिक नोंदी पुसल्या जातील.',

    // Audit History
    'history.title': 'नोंदवही इतिहास व हॅश साखळी',
    'history.tamperNote': 'केवळ या ब्राउझरमध्ये साठवलेला; हा अंशतः बदल ओळखतो, हा फेरबदल-प्रतिरोधक नाही.',
    'history.valid': 'अखंडता तपासणी यशस्वी: सर्व नोंदींचे हॅश साखळीनुसार बरोबर आहेत.',
    'history.broken': 'नोंद क्रमांक #{index} जवळ विसंगती आढळली. हॅश मागील नोंदीशी जुळत नाही.',

    // Self-Tests
    'tests.title': 'गणना व तटस्थता स्वयंचलित चाचण्या',
    'tests.runBtn': 'सर्व चाचण्या चालवा',
    'tests.allPassed': 'सर्व {count} चाचण्या यशस्वीरीत्या उत्तीर्ण झाल्या.',
    'tests.failures': '{count} पैकी {failures} चाचण्या अनुत्तीर्ण झाल्या.',
  },

  hi: {
    // App Brand & Navigation
    'app.title': 'राशनसाथी',
    'app.subtitle': 'सार्वजनिक वितरण पात्रता एवं विसंगति सहायक',
    'app.banner': 'काल्पनिक डेटा पर आधारित प्रोटोटाइप ऐप। बिना पासवर्ड भूमिका बदली जा सकती है। वास्तविक प्रणाली के लिए लॉगिन, बायोमेट्रिक व आधिकारिक सत्यापन आवश्यक है। यह उपकरण किसी की गलती नहीं ठहराता।',
    'app.footer': 'निर्णय-सहायक साधन। दिखाए गए नियम केवल नमूने हैं; आधिकारिक अधिसूचनाओं (rcms.mahafood.gov.in, NFSA 2013 धारा ३(१)) से पुष्टि करें।',
    
    // Roles & Language
    'role.citizen': 'नागरिक',
    'role.shopkeeper': 'दुकानदार',
    'role.viewingAs': 'देख रहे हैं',
    'role.switchNotice': 'सिम्युलेटेड भूमिका चयन (डेमो ऐप)',
    'lang.en': 'English',
    'lang.mr': 'मराठी',
    'lang.hi': 'हिन्दी',

    // Tabs
    'tab.myRation': 'मेरा राशन',
    'tab.addReceipt': 'रसीद से जोड़ें',
    'tab.report': 'रिपोर्ट',
    'tab.counter': 'दुकान काउंटर',
    'tab.rulesSetup': 'नियम सेटअप',
    'tab.households': 'परिवार',
    'tab.history': 'ऑडिट लॉग',
    'tab.selfTests': 'स्वयं-परीक्षण',
    'tab.settings': 'सेटिंग्स',
    'tab.adminSetupLabel': 'व्यवस्थापक सेटअप (डेमो)',

    // Common Buttons & Actions
    'btn.save': 'सहेजें',
    'btn.cancel': 'रद्द करें',
    'btn.edit': 'संपादित करें',
    'btn.delete': 'हटाएं',
    'btn.confirm': 'पुष्टि करें (मुझे मिल गया)',
    'btn.notCorrect': 'सही नहीं है',
    'btn.extract': 'जानकारी निकालें',
    'btn.trySample': 'नमूना चुनें',
    'btn.loadSampleRules': 'नमूना राशन कार्ड नियम लोड करें',
    'btn.loadFullDemo': 'पूर्ण डेमो डेटा लोड करें',
    'btn.resetAllData': 'सभी डेटा रीसेट करें',
    'btn.runTests': 'परीक्षण चलाएं',
    'btn.verifyHistory': 'ऑडिट लॉग अखंडता जांचें',
    'btn.downloadCsv': 'CSV डाउनलोड करें',
    'btn.printPdf': 'प्रिंट / PDF के रूप में सहेजें',
    'btn.generateLetter': 'शिकायत पत्र ड्राफ्ट बनाएं',
    'btn.copyLetter': 'टेक्स्ट कॉपी करें',
    'btn.close': 'बंद करें',
    'btn.update': 'रिकॉर्ड अपडेट करें',
    'btn.addMember': 'सदस्य जोड़ें',
    'btn.newHousehold': 'नया परिवार',
    'btn.newCardType': 'नया कार्ड प्रकार',

    // Item Translation Keys
    'item.Grain': 'अनाज',
    'item.Rice': 'चावल',
    'item.Wheat': 'गेहूं',
    'item.Sugar': 'चीनी',
    'item.Dal': 'दाल',
    'item.Oil': 'तेल',

    // Colours
    'colour.Yellow': 'पीला',
    'colour.OrangeSaffron': 'केसरी',
    'colour.White': 'सफेद',
    'colour.Custom': 'अन्य रंग',

    // Categories
    'cat.AAY': 'AAY (अंत्योदय अन्न योजना)',
    'cat.PHH': 'PHH (प्राथमिकता परिवार)',
    'cat.NPH': 'NPH (गैर-प्राथमिकता परिवार)',
    'cat.None': 'लागू नहीं',

    // Units & Periods
    'unit.kg': 'किग्रा',
    'unit.litre': 'लीटर',
    'period.monthly': 'मासिक',
    'mode.PER_MEMBER': 'प्रति सदस्य',
    'mode.PER_CARD': 'प्रति कार्ड',
    'mode.PER_MEMBER_CAP': 'प्रति सदस्य (सीमा सहित)',

    // Rules Setup Screen
    'rules.title': 'राशन कार्ड प्रकार एवं पात्रता नियम',
    'rules.disclaimer': 'केवल यहाँ दर्ज नियम ही लागू होंगे। कोई अन्य नियम नहीं माना जाता। यदि नियम खाली है तो कोई पात्रता नहीं होगी।',
    'rules.priceNote': 'पीएमजीकेएवाई के तहत मुफ्त अनाज सरकार द्वारा घोषित अवधि (३१ दिसंबर २०२८ तक) के लिए लागू है। अन्य वस्तुओं का मूल्य हो सकता है।',
    'rules.sampleLabel': 'नमूना: आधिकारिक मूल्यों से जांच करें',
    'rules.splitNote': 'विभाजन का योग मूल मात्रा के बिल्कुल बराबर होना चाहिए।',
    'rules.stockDependentLabel': 'स्टॉक उपलब्ध होने पर',
    'rules.stockDependentDesc': 'केवल सूचनात्मक; न मिलने पर कमी नहीं मानी जाती।',
    'rules.cardTypeName': 'कार्ड प्रकार का नाम',
    'rules.cardColour': 'कार्ड का रंग',
    'rules.cardCategory': 'श्रेणी',
    'rules.sourceNote': 'शासकीय संदर्भ / अधिसूचना',
    'rules.pricePerUnit': 'प्रति यूनिट दर (₹)',
    'rules.priceValidTill': 'मूल्य वैधता तिथि',
    'rules.splits': 'अनाज विभाजन (जैसे चावल और गेहूं)',
    'rules.splitError': 'विभाजन का योग ({splitSum} {unit}) मूल नियम ({ruleQty} {unit}) से मेल नहीं खाता।',
    'rules.cannotDeleteUsed': 'यह कार्ड प्रकार परिवार {cardNumber} द्वारा उपयोग में है, इसलिए हटाया नहीं जा सकता।',

    // Household & Members
    'households.title': 'परिवार एवं सदस्य सूची',
    'households.cardNumber': 'राशन कार्ड संख्या',
    'households.headName': 'परिवार के मुखिया का नाम',
    'households.cardType': 'आवंटित कार्ड प्रकार',
    'households.membersCountedLabel': 'गिने गए सदस्य: {count} ({refDate} को)',
    'households.refCutoffNote': 'सदस्य परिवर्तन की आधिकारिक अंतिम तिथि सत्यापित नहीं है; यह उपयोगकर्ता की सेटिंग है।',
    'households.healthChecklistTitle': 'कार्ड स्वास्थ्य चेकलिस्ट',
    'households.healthNote': 'संभावित प्रशासनिक रुकावटों की जांच के लिए स्व-रिपोर्ट की गई सूची।',
    'households.aadhaarLinked': 'सभी सदस्यों का आधार लिंक है',
    'households.ekycDone': 'ई-केवाईसी (e-KYC) पूर्ण है',
    'households.shopMapped': 'राशन कार्ड इस उचित मूल्य दुकान से मैप है',
    'households.memberListCurrent': 'पोर्टल पर सदस्य सूची अद्यतन है',
    'households.mobileRegistered': 'ओटीपी/एसएमएस के लिए मोबाइल नंबर पंजीकृत है',
    'households.memberAddedOn': 'जोड़ने की तिथि',
    'households.memberRemovedOn': 'हटाने की तिथि',
    'households.memberReason': 'परिवर्तन का कारण',
    'households.reasonInitial': 'मूल पंजीकरण',
    'households.reasonBirth': 'परिवार में जन्म',
    'households.reasonMarriage': 'विवाह',
    'households.reasonDeath': 'मृत्यु',
    'households.reasonOther': 'अन्य प्रशासनिक परिवर्तन',
    'households.cannotDeleteWithRecords': 'इस परिवार के वितरण रिकॉर्ड मौजूद होने के कारण इसे हटाया नहीं जा सकता।',
    'households.dateOrderError': 'हटाने की तिथि जोड़ने की तिथि से पहले नहीं हो सकती।',

    // Math & Citizen Screen ("My Ration")
    'citizen.title': 'मेरा राशन एवं अधिकार',
    'citizen.entitlementMath': '{members} सदस्य × {rate} {unit} = {total} {unit}',
    'citizen.entitlementPerCardMath': '{rate} {unit} प्रति कार्ड',
    'citizen.entitlementCapMath': '{members} सदस्य × {rate} {unit} (अधिकतम सीमा {cap} {unit}) = {total} {unit}',
    'citizen.confirmed': 'पुष्टीकृत',
    'citizen.pending': 'लंबित',
    'citizen.remaining': 'शेष',
    'citizen.entitled': 'कुल पात्रता',
    'citizen.received': 'प्राप्त',
    'citizen.pendingTitle': 'आपकी पुष्टि की प्रतीक्षा में प्रविष्टियाँ',
    'citizen.otpInstruction': 'सामग्री पूर्ण रूप से मिलने पर ही यह ओटीपी दुकानदार को बताएं।',
    'citizen.otpCodeLabel': 'डेमो ओटीपी कोड: {code}',
    'citizen.disputePrompt': 'सही न होने पर कृपया संक्षिप्त तथ्यात्मक कारण लिखें:',
    'citizen.historyGridTitle': 'पिछले ६ महीनों का वितरण इतिहास',
    'citizen.stockTitle': 'स्टॉक पर निर्भर वस्तुएं (केवल सूचनात्मक)',
    'citizen.stockExplanation': 'ये वस्तुएं दुकान में उपलब्धता पर निर्भर करती हैं। न मिलने पर कमी नहीं मानी जाती।',
    'citizen.priceCardTitle': 'दर एवं भुगतान जांच',
    'citizen.expectedPrice': 'अपेक्षित राशि',
    'citizen.recordedPaid': 'दर्ज की गई राशि',
    'citizen.itemsToVerify': 'जांच योग्य बिंदु (चेकलिस्ट अनुसार)',

    // Shopkeeper Screen
    'shopkeeper.title': 'उचित मूल्य दुकान काउंटर',
    'shopkeeper.searchCard': 'राशन कार्ड संख्या से खोजें',
    'shopkeeper.selectCardPrompt': 'पात्रता देखने एवं रिकॉर्ड दर्ज करने के लिए परिवार चुनें।',
    'shopkeeper.enterQty': 'दी गई मात्रा ({unit})',
    'shopkeeper.enterAmount': 'ली गई राशि (₹)',
    'shopkeeper.enterDate': 'वितरण तिथि',
    'shopkeeper.enterPlace': 'वितरण स्थान',
    'shopkeeper.placeHome': 'यह दुकान (मूल आवंटित)',
    'shopkeeper.placeOther': 'अन्य दुकान (पोर्टेबिलिटी)',
    'shopkeeper.placeUnknown': 'अज्ञात स्थान',
    'shopkeeper.sourceNote': 'रसीद / संदर्भ नोट',
    'shopkeeper.exceedWarning': 'दर्ज मात्रा शेष पात्रता से अधिक है (शेष: {remaining} {unit})।',
    'shopkeeper.exceedReasonPrompt': 'शेष से अधिक वितरण का कारण लिखना अनिवार्य है:',
    'shopkeeper.otpVerification': 'ग्राहक ओटीपी से सत्यापन करें',
    'shopkeeper.otpInputPlaceholder': 'नागरिक स्क्रीन पर दिख रहा ४ अंकों का ओटीपी दर्ज करें',
    'shopkeeper.verifyOtpBtn': 'ओटीपी जांचें और पुष्टि करें',
    'shopkeeper.otpLocked': '३ गलत प्रयासों के बाद ओटीपी लॉक हो गया है। नागरिक सीधे पुष्टि या आपत्ति दर्ज कर सकते हैं।',
    'shopkeeper.otpWrong': 'गलत ओटीपी। {remaining} प्रयास शेष।',
    'shopkeeper.otpSuccess': 'ओटीपी सत्यापन सफल। रिकॉर्ड पुष्टीकृत हुआ।',
    'shopkeeper.recentRecords': 'इस परिवार के लिए हाल की प्रविष्टियां',
    'shopkeeper.recordCorrectionNote': 'ऑडिट मानकों के अनुसार प्रविष्टियां बदली नहीं जातीं। समायोजन के लिए नया रिकॉर्ड दर्ज करें।',

    // Classifications & Statuses
    'status.Pending': 'लंबित',
    'status.Confirmed': 'पुष्टीकृत',
    'status.Disputed': 'आपत्ति दर्ज',
    
    'class.noRule': 'नियम दर्ज नहीं',
    'class.unclear': 'अस्पष्ट',
    'class.unrecorded': 'दर्ज नहीं',
    'class.awaiting': 'पुष्टि की प्रतीक्षा',
    'class.full': 'पूर्ण प्राप्त',
    'class.above': 'नियम से अधिक दर्ज',
    'class.shortfall': 'कमी',
    
    'class.noRuleReason': 'इस राशन कार्ड श्रेणी के लिए कोई पात्रता नियम दर्ज नहीं किया गया है।',
    'class.unclearReasonNoEntitlement': 'पात्रता शून्य है या चुनी गई तिथि पर कोई सक्रिय सदस्य नहीं मिला।',
    'class.unclearReasonDisputed': 'रिकॉर्ड पर आपत्ति दर्ज है या जानकारी अधूरी है।',
    'class.unrecordedReason': 'इस महीने इस वस्तु का कोई रिकॉर्ड नहीं मिला।',
    'class.awaitingReason': 'दुकानदार द्वारा प्रविष्टि की गई है किंतु नागरिक या ओटीपी द्वारा पुष्टि नहीं हुई है।',
    'class.fullReason': 'प्राप्त मात्रा नियम अनुसार निर्धारित पात्रता से पूरी तरह मेल खाती है।',
    'class.aboveReason': 'दर्ज मात्रा नियम से अधिक है। इसका अंतर्निहित कारण निर्धारित नहीं है।',
    'class.shortfallReason': 'दर्ज मात्रा नियम अनुसार निर्धारित पात्रता से कम है।',

    // Tags
    'tag.lateEntry': 'देर से दर्ज प्रविष्टि',
    'tag.otherShop': 'अन्य दुकान से प्राप्त',

    // Evidence Badges
    'badge.strong': 'मजबूत प्रमाण',
    'badge.medium': 'मध्यम प्रमाण',
    'badge.weak': 'कमजोर प्रमाण',
    'badge.unclear': 'अस्पष्ट स्रोत',
    
    // Receipt Extractor
    'receipt.title': 'रसीद या हस्तलिखित पर्ची से जोड़ें',
    'receipt.pastePrompt': 'रसीद, एसएमएस या पर्ची का टेक्स्ट यहाँ पेस्ट करें:',
    'receipt.suggestionHeader': 'पार्सर सुझाव: सहेजने से पहले जांच लें',
    'receipt.suggestionNote': 'नीचे दिए विवरण की पुष्टि करें। पुष्टि करने तक कोई रिकॉर्ड सहेजा नहीं जाएगा।',
    'receipt.engineLocal': 'स्थानीय ऑफलाइन पार्सर',
    'receipt.engineGemini': 'जेमिनी एआई पार्सर सुझाव',
    'receipt.flagYear': 'नोट: रसीद में वर्ष का उल्लेख नहीं था, इसलिए वर्तमान वर्ष माना गया है।',
    'receipt.flagUnconfident': 'नोट: तिथि या मात्रा स्पष्ट नहीं थी, इसलिए यह कॉलम खाली छोड़ा गया है।',
    'receipt.savedSuccess': 'रसीद का रिकॉर्ड सफलतापूर्वक पुष्टीकृत स्थिति में सहेजा गया।',

    // Price Checks
    'price.matches': 'अपेक्षित दर से मेल खाता है (₹{expected})',
    'price.differs': 'भुगतान की गई राशि अपेक्षित राशि से ₹{diff} भिन्न है (कारण निर्धारित नहीं)।',
    'price.notRecorded': 'राशि दर्ज नहीं की गई।',
    'price.expired': 'मूल्य नियम समाप्त हो चुका है, कृपया अपडेट करें।',
    'price.noRule': 'मूल्य नियम दर्ज नहीं है।',

    // Mismatch Hint
    'mismatch.hint': 'दर्ज मात्रा ({qty} {unit}) वर्तमान {currentCard} नियम की बजाय {matchedCard} नियम से मेल खाती है। कृपया आधिकारिक कार्ड रंग/श्रेणी की जांच करें।',

    // Report
    'report.title': 'तथ्यात्मक पात्रता एवं वितरण रिपोर्ट',
    'report.disclaimerTop': 'यह रिपोर्ट अपेक्षित और दर्ज मात्राओं के बीच अंतर दर्शाती है। इसका कारण निर्धारित नहीं है; स्टॉक की कमी या प्रविष्टि त्रुटि जैसे सामान्य कारण हो सकते हैं। किसी भी गलत कार्य का आरोप नहीं लगाया गया है। किसी भी विषय की मानवीय प्राधिकारी द्वारा समीक्षा की जानी चाहिए।',
    'report.disclaimerBottom': 'यह रिपोर्ट केवल उपयोगकर्ता द्वारा दर्ज नियमों और स्थानीय रिकॉर्ड पर आधारित है। इसे कानूनी प्रमाण या बायोमेट्रिक सत्यापन नहीं माना जा सकता।',
    'report.appliedRule': 'कार्ड: {cardName} ({category}), {item}, {qtyDesc}। पात्रता: {entitled} {unit}।',
    'report.twoNumbersDiff': 'पात्रता और पुष्टीकृत मात्रा में अंतर: {diff1} {unit}। लंबित प्रविष्टियों की पुष्टि होने पर अंतर: {diff2} {unit}।',
    'report.pendingSection': 'लंबित प्रविष्टियाँ (अभी पुष्टि नहीं हुई)',
    'report.disputedSection': 'आपत्ति दर्ज प्रविष्टियाँ (समीक्षाधीन)',
    'report.questionsHeader': 'इस अंतर को स्पष्ट करने में सहायक प्रश्न:',
    'report.q1': 'क्या दुकान में अस्थायी स्टॉक की कमी थी अथवा परिवहन में विलंब हुआ था?',
    'report.q2': 'क्या चालू माह में शेष अनाज का वितरण बाद में निर्धारित है?',
    'report.q3': 'क्या रजिस्टर में कोई प्रविष्टि छूट गई, दोहराई गई या गलत पढ़ी गई?',
    'report.q4': 'क्या माह की कट-ऑफ तिथि के आसपास परिवार के सदस्यों की संख्या बदली थी?',
    'report.q5': 'क्या राशन कार्ड सक्रिय है, सही दुकान से जुड़ा है तथा ई-केवाईसी पूर्ण है?',
    'report.q6': 'क्या इलेक्ट्रॉनिक पीओएस (PoS) मशीन या बायोमेट्रिक उपकरण में तकनीकी समस्या आई थी?',
    'report.q7': 'क्या पोर्टेबिलिटी के तहत कोटे का कुछ हिस्सा किसी अन्य दुकान से लिया गया था?',
    'report.compareHeader': 'कार्ड प्रकार अनुसार पात्रता तुलना ({members} सदस्यों के लिए)',

    // Grievance Letter
    'letter.title': 'तथ्यात्मक शिकायत पत्र ड्राफ्ट',
    'letter.draftNotice': 'कार्ड धारक द्वारा समीक्षा एवं संपादन के लिए ड्राफ्ट। संपर्क विवरण उपयोगकर्ता स्वयं भरें।',
    'letter.authorityPlaceholder': 'सेवा में: तहसीलदार / खाद्य एवं नागरिक आपूर्ति अधिकारी / राशनिंग प्राधिकरण',
    'letter.officeAddressPlaceholder': 'कार्यालय: [उप-प्रभाग / तहसील / खाद्य आपूर्ति कार्यालय का पता लिखें]',
    'letter.helplinePlaceholder': 'हेल्पलाइन / संदर्भ: [जैसे 1967 / 1800-22-4950 अथवा स्थानीय हेल्पडेस्क]',
    'letter.subject': 'विषय: राशन कार्ड संख्या: {cardNumber} के वितरण रिकॉर्ड के तथ्यात्मक सत्यापन हेतु अनुरोध',
    'letter.bodyGreeting': 'महोदय / महोदया,',
    'letter.bodyP1': 'मैं राशन कार्ड संख्या: {cardNumber} का पंजीकृत धारक हूँ (परिवार के मुखिया: {headName}, श्रेणी: {category}, रंग: {colour})।',
    'letter.bodyP2': '{month} माह के लिए हमारे परिवार में {members} सदस्य हैं। लागू नियम ({appliedRule}) के अनुसार, हमारी कुल पात्रता {entitled} {unit} है।',
    'letter.bodyP3': 'हमारे पास उपलब्ध रिकॉर्ड के अनुसार, कुल {confirmed} {unit} प्राप्त होना दर्ज है, जिससे {diff} {unit} की कमी दिखती है ({pending} {unit} वर्तमान में लंबित स्थिति में है)।',
    'letter.bodyP4': 'हम समझते हैं कि स्टॉक में देरी अथवा रिकॉर्ड विसंगति के कारण ऐसा अंतर संभव है। किसी पर भी कोई आक्षेप नहीं लगाया गया है। आपसे विनम्र अनुरोध है कि रिकॉर्ड की जांच कर वस्तुस्थिति स्पष्ट करने की कृपा करें।',
    'letter.bodySign': 'भवदीय,\n{headName}\nराशन कार्ड सं: {cardNumber}\nतिथि: {date}',
    'letter.copied': 'पत्र की सामग्री कॉपी कर ली गई।',

    // Neutrality Guard
    'guard.passed': 'तटस्थ भाषा जांच सफल',
    'guard.masked': '{count} शब्द तटस्थता हेतु छिपाए गए',
    'guard.userBoxTitle': 'उपयोगकर्ता द्वारा मूल रूप से दर्ज साक्ष्य:',

    // Settings Screen
    'settings.title': 'एप्लिकेशन सेटिंग्स',
    'settings.language': 'भाषा / Language',
    'settings.role': 'सक्रिय सिम्युलेटेड भूमिका',
    'settings.month': 'चुना गया माह',
    'settings.refDay': 'सदस्य गणना कट-ऑफ संदर्भ दिवस',
    'settings.refFirst': 'माह का पहला दिन (१ तारीख)',
    'settings.refLast': 'माह का अंतिम दिन',
    'settings.refCustom': 'माह का निर्धारित दिन (१ से २८)',
    'settings.otpToggle': 'सिम्युलेटेड ओटीपी सत्यापन सक्षम करें',
    'settings.geminiToggle': 'वैकल्पिक जेमिनी एआई रसीद पार्सर का उपयोग करें',
    'settings.geminiNote': 'मुख्य ऐप एआई के बिना ऑफलाइन कार्य करता है। सक्षम होने पर केवल रसीद का टेक्स्ट भेजा जाता है।',
    'settings.shopName': 'काल्पनिक दुकान का नाम / कोड',
    'settings.resetConfirm': 'क्या आप वाकई सभी डेटा रीसेट करना चाहते हैं? इससे सभी स्थानीय रिकॉर्ड मिट जाएंगे।',

    // Audit History
    'history.title': 'ऑडिट लॉग एवं हैश श्रृंखला',
    'history.tamperNote': 'केवल इस ब्राउज़र में सहेजा गया; यह आंशिक परिवर्तन पहचानता है, छेड़छाड़-रोधी नहीं है।',
    'history.valid': 'अखंडता जांच सफल: सभी प्रविष्टियों के हैश श्रृंखला में सही हैं।',
    'history.broken': 'प्रविष्टि सं #{index} पर विसंगति मिली। हैश पिछली कड़ी से मेल नहीं खाता।',

    // Self-Tests
    'tests.title': 'गणना एवं तटस्थता स्वचालित परीक्षण',
    'tests.runBtn': 'सभी परीक्षण चलाएं',
    'tests.allPassed': 'सभी {count} परीक्षण सफलतापूर्वक पास हुए।',
    'tests.failures': '{count} में से {failures} परीक्षण असफल रहे।',
  },
};

/**
 * Multilingual string lookup with token interpolation
 * Falls back to English if the translation key is missing in the chosen language.
 */
export function t(key: string, params?: Record<string, string | number>, lang: LanguageCode = 'en'): string {
  const dictionary = TRANSLATIONS[lang] || TRANSLATIONS.en;
  let text = dictionary[key] || TRANSLATIONS.en[key] || key;

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }

  return text;
}

/**
 * Formats a localized item name (e.g. 'Grain', 'Rice')
 */
export function formatItemName(itemKey: string, lang: LanguageCode): string {
  const transKey = `item.${itemKey}`;
  const translated = t(transKey, undefined, lang);
  return translated !== transKey ? translated : itemKey;
}

/**
 * Formats a localized colour name
 */
export function formatColourName(colourKey: string, lang: LanguageCode): string {
  const transKey = `colour.${colourKey}`;
  const translated = t(transKey, undefined, lang);
  return translated !== transKey ? translated : colourKey;
}
