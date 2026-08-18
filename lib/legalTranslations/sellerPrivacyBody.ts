import type { LangCode } from "@/lib/i18n";
import type { PrivacyBlock, PrivacySectionContent } from "./privacyBody";

export type SellerPrivacySectionKey =
  | "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7" | "s8" | "s9" | "s10";

export interface SellerPrivacyHeadings {
  s1: string;
  s2: string;
  s3: string;
  s4: string;
  s5: string;
  s6: string;
  s7: string;
  s8: string;
  s9: string;
  s10: string;
}

export interface SellerPrivacyMeta {
  title: string;
  headings: SellerPrivacyHeadings;
}

export const SELLER_PRIVACY_SECTION_KEYS: SellerPrivacySectionKey[] = [
  "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10"
];

// ─── 1. English (en) ──────────────────────────────────────────────────────────
const enMeta: SellerPrivacyMeta = {
  title: "Seller & Merchant Privacy Policy",
  headings: {
    s1: "1. Information Collected from Sellers & Merchants",
    s2: "2. Mobile App Permissions (Camera, Storage, Notifications & Location)",
    s3: "3. How We Use Merchant Information",
    s4: "4. Information Sharing & Third-Party Logistics/Payment Gateways",
    s5: "5. Financial Information & Payout Processing",
    s6: "6. Data Retention, Store Closure & Account Deletion Policy",
    s7: "7. Merchant Rights & DPDP Act 2023 Compliance",
    s8: "8. Data Security & Storage in India",
    s9: "9. B2B Eligibility & Children's Privacy",
    s10: "10. Grievance Officer & Contact Details",
  },
};

const en: Record<SellerPrivacySectionKey, PrivacySectionContent> = {
  s1: [
    { kind: "h3", text: "A. Merchant Identification & Business KYC Data" },
    {
      kind: "ul",
      items: [
        "**Business Identity:** Legal business name, trade name, business type (Proprietorship, Partnership, Pvt Ltd, LLP), CIN/LLPIN.",
        "**Tax & Statutory Identifiers:** Goods and Services Tax Identification Number (GSTIN), Permanent Account Number (PAN), and MSME/Udyam registration certificates.",
        "**KYC & Verification Proofs:** Shop front photograph, warehouse/factory photographs, authorized signatory identity proofs, and business registration certificates.",
        "**Contact Details:** Full name of business owner/authorized representative, business email address, registered mobile phone number, and alternate contact numbers.",
        "**Addresses:** Registered business office address, warehouse pickup addresses, and dispatch locations with postal pincodes.",
      ],
    },
    { kind: "h3", text: "B. Product & Catalog Listing Information" },
    {
      kind: "ul",
      items: [
        "Product photographs, specifications, fabric/material details, size charts, wholesale lot minimum order quantities (MOQs), SKU codes, and inventory levels.",
        "Wholesale pricing, tiered discounts, promotional campaign bids, and brand authorization letters / trademark certificates.",
      ],
    },
    { kind: "h3", text: "C. Technical, Device & App Usage Data" },
    {
      kind: "ul",
      items: [
        "Device identifiers (IMEI, Android ID, Advertising ID), device manufacturer, hardware model, operating system version, and IP address.",
        "App session logs, feature usage, API response times, crash analytics, and Firebase Cloud Messaging (FCM) push tokens for real-time dispatch alerts.",
      ],
    },
  ],
  s2: [
    {
      kind: "p",
      text: "To enable seamless catalog creation, barcode scanning, order dispatching, and security verification, the ANGA9 Seller Mobile App requests the following explicit runtime permissions on your Android device:",
    },
    {
      kind: "ul",
      items: [
        "**Camera (`android.permission.CAMERA`):** Required to capture shop/warehouse photos for Seller KYC verification, take real-time photos of products for catalog creation, scan courier tracking barcodes, and record video/photo evidence of returned goods during dispute resolution.",
        "**Photos & Media / Storage (`android.permission.READ_MEDIA_IMAGES`):** Required to upload high-resolution product photos, GST certificates, brand trademark documents, and download shipping labels, tax invoices, and settlement ledgers in PDF format.",
        "**Notifications (`android.permission.POST_NOTIFICATIONS`):** Required to deliver mission-critical real-time alerts regarding new wholesale orders, pickup dispatch schedules, buyer return requests, and payment settlement credits.",
        "**Approximate / Precise Location (`android.permission.ACCESS_FINE_LOCATION`):** Used strictly to verify seller warehouse pickup coordinates, facilitate accurate courier partner dispatch routing, and prevent location-based fraudulent registrations.",
      ],
    },
    {
      kind: "p",
      text: "You may revoke any permission at any time through your Android Device Settings (Settings > Apps > ANGA9 Seller > Permissions). Note that disabling certain permissions (such as Camera or Storage) may restrict your ability to upload products or generate shipping manifests.",
    },
  ],
  s3: [
    {
      kind: "ul",
      items: [
        "**Seller Onboarding & KYC:** Verifying GSTIN, PAN, and business authenticity against official databases (such as GSTN Portal) to maintain a trusted B2B wholesale network.",
        "**Catalog Management & Publishing:** Publishing your wholesale product listings to verified B2B buyers across 19,000+ pincodes in India.",
        "**Order Processing & Fulfillment:** Generating electronic shipping labels, manifests, GST-compliant e-way bills, and automated courier pickup scheduling.",
        "**Automated Financial Settlements:** Calculating gross sales, deducting platform commissions and Tax Collected at Source (TCS under Section 52 of CGST Act), and initiating direct NEFT/RTGS/IMPS payouts to your verified bank account.",
        "**Dispute Resolution & Quality Control:** Facilitating seller-buyer dispute mediation, inspecting return evidence, and maintaining wholesale marketplace integrity.",
        "**Platform Security & Fraud Prevention:** Detecting multi-account abuse, suspicious price manipulations, unauthorized brand impersonations, and credential theft.",
      ],
    },
  ],
  s4: [
    {
      kind: "p",
      text: "ANGA9 does not sell or rent seller information. We share merchant data strictly on a need-to-know basis with trusted partners under strict confidentiality agreements:",
    },
    {
      kind: "ul",
      items: [
        "**Logistics & Courier Partners (e.g., Delhivery, Shiprocket, Bluedart, Shadowfax):** Warehouse pickup address, seller contact phone number, package dimensions, and shipping manifests to execute prompt doorstep pickups and transit tracking.",
        "**Banking & Payment Processors (e.g., Razorpay, Cashfree, Escrow Banks):** Bank account number, IFSC code, merchant business name, and payout amounts to process automated daily/weekly seller settlements.",
        "**Verified B2B Buyers:** Registered business name, brand name, store rating, state of operation, and product catalog details to facilitate commercial wholesale transactions and tax invoicing.",
        "**Statutory & Government Authorities:** GST department, income tax authorities, consumer forums, or law enforcement bodies when mandated by court orders, GST TCS monthly filings, or applicable Indian laws.",
      ],
    },
  ],
  s5: [
    {
      kind: "p",
      text: "To process seller payouts, we collect your Bank Account Number, Bank Name, Branch IFSC Code, Account Beneficiary Name, and a cancelled cheque or bank verification proof.",
    },
    {
      kind: "ul",
      items: [
        "Bank details are stored with military-grade AES-256 encryption.",
        "Payout settlements are executed via Reserve Bank of India (RBI) authorized payment aggregators.",
        "Under Section 52 of the CGST Act, ANGA9 deducts 1% Tax Collection at Source (TCS) on net taxable supplies and files monthly GSTR-8 returns with the Government of India, linking your GSTIN.",
      ],
    },
  ],
  s6: [
    {
      kind: "p",
      text: "In compliance with Google Play Developer Policy and the DPDP Act 2023, ANGA9 provides sellers with full control over their account data and the right to request store deletion:",
    },
    {
      kind: "ul",
      items: [
        "**How to Request Account Deletion:** Sellers can initiate store deletion directly within the ANGA9 Seller App by navigating to **Profile > Settings > Delete Account**, or by sending an official written request from their registered email to **privacy@anga9.com**.",
        "**Post-Request Process:** Upon receiving a verified deletion request, all active product listings are delisted, ongoing orders are fulfilled, outstanding payouts are cleared, and seller logins are disabled.",
        "**Statutory Retention:** As mandated by Indian Tax Laws (GST Act, Income Tax Act) and the Companies Act 2013, financial transaction logs, tax invoices, GST e-way bills, and payout ledgers are retained securely for a statutory period of 8 years, after which they are permanently purged.",
      ],
    },
  ],
  s7: [
    {
      kind: "ul",
      items: [
        "**Right to Access & Review:** Review all personal and merchant data stored on your seller account anytime via the Seller Dashboard.",
        "**Right to Correction & Update:** Update bank account details, warehouse addresses, phone numbers, and business profiles directly through verified OTP workflows.",
        "**Right to Data Portability:** Download your entire product catalog, order history, inventory logs, and settlement statements in CSV/Excel formats.",
        "**Right to Withdraw Consent:** You may withdraw consent for promotional communications or optional analytics tracking at any time.",
      ],
    },
  ],
  s8: [
    {
      kind: "p",
      text: "All merchant data, catalog media, financial records, and communication logs are stored securely on Tier-4 data centers located physically within the territory of **India** in compliance with Indian Data Localization directives and ISO/IEC 27001 standards. All data in transit is protected using TLS 1.3 encryption, and data at rest is encrypted using AES-256.",
    },
  ],
  s9: [
    {
      kind: "p",
      text: "The ANGA9 Seller Platform and Mobile App are exclusively intended for legally registered commercial entities, adult business owners, and authorized representatives aged 18 years and above. We do not knowingly collect or solicit data from individuals under 18 years of age.",
    },
  ],
  s10: [
    {
      kind: "p",
      text: "If you have questions, concerns, or wish to exercise your data privacy rights under Indian law or Google Play Store policies, please contact our designated Grievance & Data Protection Officer:",
    },
    {
      kind: "ul",
      items: [
        "**Grievance Officer:** Legal & Compliance Cell, ANGA9 Wholesale Technologies Pvt. Ltd.",
        "**Official Email:** [grievance@anga9.com](mailto:grievance@anga9.com) / [privacy@anga9.com](mailto:privacy@anga9.com)",
        "**Registered Address:** ANGA9 Wholesale Technologies Pvt. Ltd., Tech Park Road, Whitefield, Bengaluru, Karnataka 560066, India.",
        "**Grievance Redressal Timeline:** Acknowledgment within 24 hours; complete resolution within 15 working days.",
      ],
    },
  ],
};

const enIntro: PrivacySectionContent = [
  {
    kind: "p",
    text: "ANGA9 Wholesale Technologies Private Limited (“ANGA9”, “we”, “us”, “our”) operates the ANGA9 B2B Wholesale Marketplace and the ANGA9 Seller Portal / Seller Mobile Application. This Seller & Merchant Privacy Policy explains our practices regarding the collection, use, storage, transfer, and disclosure of personal and business information belonging to manufacturers, distributors, brands, and sellers (“Sellers”, “Merchants”, “you”) registered on our platform, in full compliance with the Digital Personal Data Protection (DPDP) Act 2023, Information Technology Act 2000, and Google Play Developer Program Policies.",
  },
  {
    kind: "p",
    text: "By registering as a seller, downloading the ANGA9 Seller App, or accessing the Seller Dashboard, you consent to the data practices described in this policy.",
  },
];

// ─── 2. Malayalam (ml) ────────────────────────────────────────────────────────
const mlMeta: SellerPrivacyMeta = {
  title: "വിൽപ്പനക്കാരന്റെ സ്വകാര്യതാ നയം",
  headings: {
    s1: "1. വിൽപ്പനക്കാരിൽ നിന്നും വ്യാപാരികളിൽ നിന്നും ശേഖരിക്കുന്ന വിവരങ്ങൾ",
    s2: "2. മൊബൈൽ ആപ്പ് അനുമതികൾ (ക്യാമറ, സ്റ്റോറേജ്, അറിയിപ്പുകൾ & ലൊക്കേഷൻ)",
    s3: "3. വ്യാപാരികളുടെ വിവരങ്ങൾ ഞങ്ങൾ എങ്ങനെ ഉപയോഗിക്കുന്നു",
    s4: "4. വിവരങ്ങൾ പങ്കിടലും ലോജിസ്റ്റിക്‌സ്/പേയ്‌മെന്റ് ഗേറ്റ്‌വേകളും",
    s5: "5. സാമ്പത്തിക വിവരങ്ങളും പേഔട്ട് പ്രക്രിയയും",
    s6: "6. ഡാറ്റ നിലനിർത്തലും അക്കൗണ്ട് നീക്കം ചെയ്യൽ നയവും",
    s7: "7. വ്യാപാരികളുടെ അവകാശങ്ങളും DPDP ആക്റ്റ് 2023 അനുസരണവും",
    s8: "8. ഇന്ത്യയിലെ ഡാറ്റ സുരക്ഷയും സംഭരണവും",
    s9: "9. ബി2ബി യോഗ്യതയും പ്രായപൂർത്തിയാകാത്തവരുടെ സ്വകാര്യതയും",
    s10: "10. പരാതി പരിഹാര ഓഫീസറും ബന്ധപ്പെടാനുള്ള വിവരങ്ങളും",
  },
};

const mlIntro: PrivacySectionContent = [
  {
    kind: "p",
    text: "ANGA9 ഹോൾസെയിൽ ടെക്നോളജീസ് പ്രൈവറ്റ് ലിമിറ്റഡ് (“ANGA9”, “ഞങ്ങൾ”) ANGA9 B2B മൊത്തവ്യാപാര മാർക്കറ്റ്പ്ലേസും ANGA9 സെല്ലർ മൊബൈൽ ആപ്ലിക്കേഷനും പ്രവർത്തിപ്പിക്കുന്നു. ഡിജിറ്റൽ പേഴ്സണൽ ഡാറ്റ പ്രൊട്ടക്ഷൻ (DPDP) ആക്റ്റ് 2023, ഇൻഫർമേഷൻ ടെക്നോളജി ആക്റ്റ് 2000, ഗൂഗിൾ പ്ലേ സ്റ്റോർ നയങ്ങൾ എന്നിവയ്ക്ക് അനുസൃതമായി നിർമ്മാതാക്കൾ, വിതരണക്കാർ, വിൽപ്പനക്കാർ എന്നിവരുടെ വിവരങ്ങളുടെ ശേഖരണവും സുരക്ഷയും ഈ നയം വ്യക്തമാക്കുന്നു.",
  },
];

const ml: Record<SellerPrivacySectionKey, PrivacySectionContent> = {
  s1: [
    { kind: "h3", text: "ബിസിനസ് ഐഡന്റിഫിക്കേഷനും KYC വിവരങ്ങളും" },
    {
      kind: "ul",
      items: [
        "**ബിസിനസ് വിവരങ്ങൾ:** ബിസിനസ്സ് പേര്, ട്രേഡ് പേര്, GSTIN നമ്പർ, പാൻ നമ്പർ (PAN), ഉദ്യം രജിസ്ട്രേഷൻ സർട്ടിഫിക്കറ്റ്.",
        "**KYC രേഖകൾ:** കടയുടെ/ഫാക്ടറിയുടെ ഫോട്ടോകൾ, ബാങ്ക് അക്കൗണ്ട് വിവരങ്ങൾ (റദ്ദാക്കിയ ചെക്ക്), ഉടമയുടെ തിരിച്ചറിയൽ രേഖകൾ.",
        "**വിലാസങ്ങൾ:** രജിസ്റ്റർ ചെയ്ത ഓഫീസ് വിലാസം, വെയർഹൗസ് പിക്കപ്പ് വിലാസങ്ങൾ, പിൻകോഡ്, ഫോൺ നമ്പർ, ഇമെയിൽ.",
      ],
    },
  ],
  s2: [
    {
      kind: "ul",
      items: [
        "**ക്യാമറ (Camera):** KYC പരിശോധനയ്ക്കും ഉൽപ്പന്നങ്ങളുടെ ഫോട്ടോകൾ എടുക്കുന്നതിനും കൊറിയർ ബാർകോഡ് സ്കാൻ ചെയ്യുന്നതിനും.",
        "**സ്റ്റോറേജ്/മീഡിയ (Storage):** കാറ്റലോഗ് ചിത്രങ്ങൾ, ഇൻവോയ്സുകൾ, ഷിപ്പിംഗ് ലേബലുകൾ എന്നിവ ഡൗൺലോഡ് ചെയ്യാനും അപ്‌ലോഡ് ചെയ്യാനും.",
        "**അറിയിപ്പുകൾ (Notifications):** പുതിയ ഓർഡറുകൾ, പിക്കപ്പ് സമയം, പേയ്‌മെന്റ് ക്രെഡിറ്റുകൾ എന്നിവയെക്കുറിച്ചുള്ള തത്സമയ അലേർട്ടുകൾക്ക്.",
        "**ലൊക്കേഷൻ (Location):** വെയർഹൗസ് പിക്കപ്പ് ലൊക്കേഷൻ കൃത്യമായി സ്ഥിരീകരിക്കുന്നതിനും കൊറിയർ റൂട്ടിംഗിനും.",
      ],
    },
  ],
  s3: [
    {
      kind: "ul",
      items: [
        "സെല്ലർ ഓൺബോർഡിംഗും GSTN പോർട്ടൽ വഴിയുള്ള ജിഎസ്ടി സ്ഥിരീകരണവും.",
        "ഇന്ത്യയിലെ 19,000+ പിൻകോഡുകളിലുള്ള റീട്ടെയിലർമാർക്കായി നിങ്ങളുടെ ഉൽപ്പന്നങ്ങൾ ലഭ്യമാക്കൽ.",
        "ഓർഡർ ഡിസ്പാച്ച്, ഇ-വേ ബിൽ നിർമ്മാണം, കൊറിയർ പിക്കപ്പ് ഏകോപനം.",
        "CGST നിയമത്തിലെ സെക്ഷൻ 52 പ്രകാരം 1% TCS കിഴിച്ച് ബാങ്ക് അക്കൗണ്ടിലേക്ക് നേരിട്ടുള്ള പേഔട്ട്.",
      ],
    },
  ],
  s4: [
    {
      kind: "ul",
      items: [
        "**കൊറിയർ പങ്കാളികൾ:** പിക്കപ്പിനും ഡെലിവറിക്കുമായി വെയർഹൗസ് വിലാസവും ഫോൺ നമ്പറും കൈമാറുന്നു.",
        "**ബാങ്കിംഗ് പങ്കാളികൾ:** പ്രതിദിന/പ്രതിവാര പേഔട്ട് സെറ്റിൽമെന്റുകൾക്കായി ബാങ്ക് വിവരങ്ങൾ നൽകുന്നു.",
        "**നിയമപരമായ അധികാരികൾ:** നികുതി വകുപ്പുകൾ ആവശ്യപ്പെടുമ്പോൾ നിയമപ്രകാരമുള്ള റിട്ടേണുകൾ ഫയൽ ചെയ്യാൻ.",
      ],
    },
  ],
  s5: [
    {
      kind: "p",
      text: "വിൽപ്പനക്കാരുടെ ബാങ്ക് അക്കൗണ്ട് വിവരങ്ങൾ AES-256 എൻക്രിപ്ഷൻ ഉപയോഗിച്ച് പൂർണ്ണ സുരക്ഷിതമായി സൂക്ഷിക്കുന്നു. ആർബിഐ അംഗീകൃത പേയ്‌മെന്റ് ഗേറ്റ്‌വേകൾ വഴിയാണ് പേഔട്ടുകൾ നടത്തുന്നത്.",
    },
  ],
  s6: [
    {
      kind: "ul",
      items: [
        "സെല്ലർ ആപ്പിലെ **Settings > Delete Account** വഴിയോ **privacy@anga9.com** എന്ന ഇമെയിൽ വഴിയോ അക്കൗണ്ട് നീക്കം ചെയ്യാൻ ആവശ്യപ്പെടാം.",
        "നികുതി, കമ്പനി നിയമങ്ങൾ പ്രകാരം സാമ്പത്തിക ഇടപാടുകളുടെ രേഖകൾ 8 വർഷത്തേക്ക് സുരക്ഷിതമായി സൂക്ഷിക്കും.",
      ],
    },
  ],
  s7: [
    {
      kind: "ul",
      items: [
        "നിങ്ങളുടെ അക്കൗണ്ട് വിവരങ്ങൾ അവലോകനം ചെയ്യാനും തിരുത്താനും CSV രൂപത്തിൽ ഡൗൺലോഡ് ചെയ്യാനുമുള്ള പൂർണ്ണ അവകാശം.",
      ],
    },
  ],
  s8: [
    {
      kind: "p",
      text: "എല്ലാ സെല്ലർ ഡാറ്റയും ഇന്ത്യയിലെ അതീവ സുരക്ഷിതമായ ഡാറ്റാ സെന്ററുകളിൽ സൂക്ഷിക്കുകയും TLS 1.3 വഴി എൻക്രിപ്റ്റ് ചെയ്യുകയും ചെയ്യുന്നു.",
    },
  ],
  s9: [
    {
      kind: "p",
      text: "ഈ പ്ലാറ്റ്‌ഫോം 18 വയസ്സിന് മുകളിലുള്ള ബിസിനസ്സ് സ്ഥാപനങ്ങൾക്കും വ്യാപാരികൾക്കും മാത്രമുള്ളതാണ്.",
    },
  ],
  s10: [
    {
      kind: "ul",
      items: [
        "**പരാതി പരിഹാര ഓഫീസർ:** ലീഗൽ സെൽ, ANGA9, ബെംഗളൂരു, കർണാടക. ഇമെയിൽ: [grievance@anga9.com](mailto:grievance@anga9.com)",
      ],
    },
  ],
};

// ─── 3. Hindi (hi) ────────────────────────────────────────────────────────────
const hiMeta: SellerPrivacyMeta = {
  title: "विक्रेता एवं मर्चेंट गोपनीयता नीति",
  headings: {
    s1: "1. विक्रेताओं और व्यापारियों से एकत्रित जानकारी",
    s2: "2. मोबाइल ऐप अनुमतियाँ (कैमरा, स्टोरेज, सूचनाएं एवं स्थान)",
    s3: "3. व्यापारी जानकारी का उपयोग",
    s4: "4. जानकारी साझा करना एवं लॉजिस्टिक्स/पेमेंट पार्टनर्स",
    s5: "5. वित्तीय जानकारी एवं भुगतान (Payout) प्रक्रिया",
    s6: "6. डेटा प्रतिधारण, स्टोर बंद करना एवं खाता हटाने की नीति",
    s7: "7. व्यापारी अधिकार एवं DPDP अधिनियम 2023 अनुपालन",
    s8: "8. भारत में डेटा सुरक्षा एवं भंडारण",
    s9: "9. B2B पात्रता एवं बच्चों की गोपनीयता",
    s10: "10. शिकायत अधिकारी एवं संपर्क विवरण",
  },
};

const hiIntro: PrivacySectionContent = [
  {
    kind: "p",
    text: "ANGA9 होलसेल टेक्नोलॉजीज प्राइवेट लिमिटेड (“ANGA9”, “हम”, “हमारा”) ANGA9 B2B थोक बाज़ार और ANGA9 विक्रेता मोबाइल एप्लिकेशन का संचालन करता है। यह विक्रेता गोपनीयता नीति डिजिटल पर्सनल डेटा प्रोटेक्शन (DPDP) अधिनियम 2023 और गूगल प्ले डेवलपर नीतियों के तहत हमारे प्लेटफ़ॉर्म पर पंजीकृत निर्माताओं, वितरकों और विक्रेताओं की व्यावसायिक जानकारी के संग्रह और सुरक्षा को स्पष्ट करती है।",
  },
];

const hi: Record<SellerPrivacySectionKey, PrivacySectionContent> = {
  s1: [
    { kind: "h3", text: "व्यावसायिक पहचान एवं KYC डेटा" },
    {
      kind: "ul",
      items: [
        "**व्यावसायिक पहचान:** कानूनी नाम, व्यापारिक नाम, जीएसटी संख्या (GSTIN), पैन नंबर (PAN), और उद्योग आधार प्रमाण पत्र।",
        "**KYC प्रमाण:** दुकान/फैक्ट्री की तस्वीरें, अधिकृत हस्ताक्षरकर्ता का पहचान पत्र, और बैंक खाता विवरण।",
        "**संपर्क एवं पता:** पंजीकृत कार्यालय का पता, गोदाम पिकअप पता, पिनकोड, मोबाइल नंबर और ईमेल।",
      ],
    },
  ],
  s2: [
    {
      kind: "ul",
      items: [
        "**कैमरा (Camera):** KYC सत्यापन, उत्पाद तस्वीरें लेने, और कूरियर बारकोड स्कैन करने हेतु।",
        "**स्टोरेज/फोटो (Storage):** उत्पाद चित्र और इनवॉइस/शिपिंग लेबल डाउनलोड व अपलोड करने हेतु।",
        "**सूचनाएं (Notifications):** नए थोक ऑर्डर, प्रेषण समय और भुगतान क्रेडिट की रीयल-टाइम सूचनाओं हेतु।",
        "**स्थान (Location):** गोदाम से कूरियर पिकअप रूटिंग सत्यापित करने हेतु।",
      ],
    },
  ],
  s3: [
    {
      kind: "ul",
      items: [
        "विक्रेता ऑनबोर्डिंग एवं जीएसटी सत्यापन।",
        "थोक कैटलॉग को पूरे भारत में सत्यापित खरीदारों तक पहुंचाना।",
        "ऑर्डर प्रोसेसिंग, कूरियर पिकअप एवं ई-वे बिल जनरेशन।",
        "TCS कटौती के साथ सीधे बैंक खाते में समय पर भुगतान।",
      ],
    },
  ],
  s4: [
    {
      kind: "ul",
      items: [
        "**कूरियर पार्टनर्स:** पिकअप और डिलीवरी निष्पादित करने के लिए गोदाम पता और संपर्क।",
        "**बैंकिंग पार्टनर्स:** स्वचालित दैनिक/साप्ताहिक भुगतान ट्रांसफर हेतु बैंक विवरण।",
        "**सरकारी विभाग:** जीएसटी कानून के तहत अनिवार्य TCS (GSTR-8) फाइलिंग हेतु।",
      ],
    },
  ],
  s5: [
    {
      kind: "p",
      text: "विक्रेता बैंक खाते का विवरण AES-256 एन्क्रिप्शन के साथ सुरक्षित रखा जाता है। CGST अधिनियम की धारा 52 के तहत 1% TCS काटकर शेष राशि सीधे बैंक खाते में ट्रांसफर की जाती है।",
    },
  ],
  s6: [
    {
      kind: "ul",
      items: [
        "विक्रेता ऐप के भीतर **सेटिंग्स > खाता हटाएं** या **privacy@anga9.com** पर ईमेल भेजकर स्टोर हटाने का अनुरोध कर सकते हैं।",
        "टैक्स एवं कंपनी कानून के तहत वित्तीय रिकॉर्ड अनिवार्य अवधि (8 वर्ष) तक सुरक्षित रखे जाते हैं।",
      ],
    },
  ],
  s7: [
    {
      kind: "ul",
      items: [
        "अपने डेटा की समीक्षा, संशोधन और एक्सेल/CSV प्रारूप में डाउनलोड करने का पूरा अधिकार।",
      ],
    },
  ],
  s8: [
    {
      kind: "p",
      text: "सभी डेटा भारत में स्थित सुरक्षित डेटा सेंटरों में संग्रहीत किया जाता है और TLS 1.3 एन्क्रिप्शन द्वारा सुरक्षित है।",
    },
  ],
  s9: [
    {
      kind: "p",
      text: "यह प्लेटफ़ॉर्म केवल 18 वर्ष से अधिक आयु के पंजीकृत व्यावसायिक संस्थाओं के लिए है।",
    },
  ],
  s10: [
    {
      kind: "ul",
      items: [
        "**शिकायत अधिकारी:** ANGA9 लीगल सेल, बेंगलुरु, कर्नाटक। ईमेल: [grievance@anga9.com](mailto:grievance@anga9.com)",
      ],
    },
  ],
};

// ─── 4. Tamil (ta) ────────────────────────────────────────────────────────────
const taMeta: SellerPrivacyMeta = {
  title: "விற்பனையாளர் மற்றும் வணிகர் தனியுரிமைக் கொள்கை",
  headings: {
    s1: "1. விற்பனையாளர்களிடமிருந்து சேகரிக்கப்படும் தகவல்கள்",
    s2: "2. மொபைல் பயன்பாட்டு அனுமதிகள் (கேமரா, சேமிப்பகம், அறிவிப்புகள் & இருப்பிடம்)",
    s3: "3. வணிகர் தகவலை நாங்கள் எவ்வாறு பயன்படுத்துகிறோம்",
    s4: "4. தகவல் பகிர்வு மற்றும் தளவாடங்கள்/கட்டண நுழைவாயில்கள்",
    s5: "5. நிதித் தகவல் மற்றும் கொடுப்பனவு (Payout) செயல்முறை",
    s6: "6. தரவு தக்கவைப்பு மற்றும் கணக்கு நீக்குதல் கொள்கை",
    s7: "7. வணிகர் உரிமைகள் மற்றும் DPDP சட்டம் 2023 இணக்கம்",
    s8: "8. இந்தியாவில் தரவு பாதுகாப்பு மற்றும் சேமிப்பு",
    s9: "9. B2B தகுதி மற்றும் சிறார் தனியுரிமை",
    s10: "10. குறைதீர்க்கும் அதிகாரி மற்றும் தொடர்பு விவரங்கள்",
  },
};

// ─── 5. Telugu (te) ───────────────────────────────────────────────────────────
const teMeta: SellerPrivacyMeta = {
  title: "విక్రేత మరియు మర్చంట్ గోప్యతా విధానం",
  headings: {
    s1: "1. విక్రేతలు మరియు వ్యాపారుల నుండి సేకరించిన సమాచారం",
    s2: "2. మొబైల్ యాప్ అనుమతులు (కెమెరా, స్టోరేజ్, నోటిఫికేషన్‌లు & లొకేషన్)",
    s3: "3. వ్యాపారి సమాచారాన్ని మేము ఎలా ఉపయోగిస్తాము",
    s4: "4. సమాచార భాగస్వామ్యం మరియు లాజిస్టిక్స్/చెల్లింపు గేట్‌వేలు",
    s5: "5. ఆర్థిక సమాచారం మరియు చెల్లింపుల ప్రక్రియ",
    s6: "6. డేటా నిలుపుదల మరియు ఖాతా తొలగింపు విధానం",
    s7: "7. వ్యాపారి హక్కులు మరియు DPDP చట్టం 2023 వర్తింపు",
    s8: "8. భారతదేశంలో డేటా భద్రత మరియు నిల్వ",
    s9: "9. B2B అర్హత మరియు మైనర్ల గోప్యత",
    s10: "10. ఫిర్యాదుల అధికారి మరియు సంప్రదింపు వివరాలు",
  },
};

// ─── 6. Bengali (bn) ──────────────────────────────────────────────────────────
const bnMeta: SellerPrivacyMeta = {
  title: "বিক্রেতা ও মার্চেন্ট গোপনীয়তা নীতি",
  headings: {
    s1: "১. বিক্রেতা ও ব্যবসায়ীদের থেকে সংগৃহীত তথ্য",
    s2: "২. মোবাইল অ্যাপ অনুমতি (ক্যামেরা, স্টোরেজ, বিজ্ঞপ্তি ও অবস্থান)",
    s3: "৩. আমরা কীভাবে ব্যবসায়ীর তথ্য ব্যবহার করি",
    s4: "৪. তথ্য আদান-প্রদান এবং লজিস্টিকস/পেমেন্ট গেটওয়ে",
    s5: "৫. আর্থিক তথ্য এবং পেআউট প্রক্রিয়া",
    s6: "৬. ডেটা সংরক্ষণ ও অ্যাকাউন্ট মুছে ফেলার নীতি",
    s7: "৭. ব্যবসায়ীর অধিকার ও DPDP আইন ২০২৩ সম্মতি",
    s8: "৮. ভারতে ডেটা নিরাপত্তা ও সংরক্ষণ",
    s9: "৯. B2B যোগ্যতা ও অপ্রাপ্তবয়স্কদের গোপনীয়তা",
    s10: "১০. অভিযোগ কর্মকর্তা এবং যোগাযোগের বিবরণ",
  },
};

// ─── 7. Marathi (mr) ──────────────────────────────────────────────────────────
const mrMeta: SellerPrivacyMeta = {
  title: "विक्रेता आणि व्यापारी गोपनीयता धोरण",
  headings: {
    s1: "१. विक्रेते आणि व्यापाऱ्यांकडून गोळा केलेली माहिती",
    s2: "२. मोबाइल अ‍ॅप परवानग्या (कॅमेरा, स्टोरेज, सूचना आणि स्थान)",
    s3: "३. आम्ही व्यापारी माहितीचा वापर कसा करतो",
    s4: "४. माहिती सामायिकरण आणि लॉजिस्टिक्स/पेमेंट गेटवे",
    s5: "५. आर्थिक माहिती आणि पेआउट प्रक्रिया",
    s6: "६. डेटा धारणा आणि खाते हटवण्याचे धोरण",
    s7: "७. व्यापारी हक्क आणि DPDP कायदा २०२३ पालन",
    s8: "८. भारतातील डेटा सुरक्षा आणि संचयन",
    s9: "९. B2B पात्रता आणि मुलांची गोपनीयता",
    s10: "१०. तक्रार निवारण अधिकारी आणि संपर्क तपशील",
  },
};

// ─── 8. Kannada (kn) ──────────────────────────────────────────────────────────
const knMeta: SellerPrivacyMeta = {
  title: "ಮಾರಾಟಗಾರರ ಗೌಪ್ಯತಾ ನೀತಿ",
  headings: {
    s1: "1. ಮಾರಾಟಗಾರರಿಂದ ಸಂಗ್ರಹಿಸಲಾದ ಮಾಹಿತಿ",
    s2: "2. ಮೊಬೈಲ್ ಅಪ್ಲಿಕೇಶನ್ ಅನುಮತಿಗಳು (ಕ್ಯಾಮೆರಾ, ಸಂಗ್ರಹಣೆ, ಅಧಿಸೂಚನೆಗಳು & ಸ್ಥಳ)",
    s3: "3. ವ್ಯಾಪಾರಿ ಮಾಹಿತಿಯನ್ನು ನಾವು ಹೇಗೆ ಬಳಸುತ್ತೇವೆ",
    s4: "4. ಮಾಹಿತಿ ಹಂಚಿಕೆ ಮತ್ತು ಲಾಜಿಸ್ಟಿಕ್ಸ್/ಪಾವತಿ ಗೇಟ್‌ವೇಗಳು",
    s5: "5. ಹಣಕಾಸು ಮಾಹಿತಿ ಮತ್ತು ಪಾವತಿ ಪ್ರಕ್ರಿಯೆ",
    s6: "6. ಡೇಟಾ ಧಾರಣ ಮತ್ತು ಖಾತೆ ಅಳಿಸುವಿಕೆ ನೀತಿ",
    s7: "7. ವ್ಯಾಪಾರಿ ಹಕ್ಕುಗಳು ಮತ್ತು DPDP ಕಾಯ್ದೆ 2023 ಅನುಸರಣೆ",
    s8: "8. ಭಾರತದಲ್ಲಿ ಡೇಟಾ ಭದ್ರತೆ ಮತ್ತು ಸಂಗ್ರಹಣೆ",
    s9: "9. B2B ಅರ್ಹತೆ ಮತ್ತು ಮಕ್ಕಳ ಗೌಪ್ಯತೆ",
    s10: "10. ಕುಂದುಕೊರತೆ ಅಧಿಕಾರಿ ಮತ್ತು ಸಂಪರ್ಕ ವಿವರಗಳು",
  },
};

// ─── 9. Gujarati (gu) ─────────────────────────────────────────────────────────
const guMeta: SellerPrivacyMeta = {
  title: "વિક્રેતા અને વેપારી ગોપનીયતા નીતિ",
  headings: {
    s1: "1. વિક્રેતાઓ અને વેપારીઓ પાસેથી એકત્રિત માહિતી",
    s2: "2. મોબાઇલ એપ્લિકેશન પરવાનગીઓ (કેમેરા, સ્ટોરેજ, સૂચનાઓ અને સ્થાન)",
    s3: "3. અમે વેપારી માહિતીનો ઉપયોગ કેવી રીતે કરીએ છીએ",
    s4: "4. માહિતી શેરિંગ અને લોજિસ્ટિક્સ/પેમેન્ટ ગેટવે",
    s5: "5. નાણાકીય માહિતી અને ચુકવણી (Payout) પ્રક્રિયા",
    s6: "6. ડેટા જાળવણી અને ખાતું કાઢી નાખવાની નીતિ",
    s7: "7. વેપારી અધિકારો અને DPDP એક્ટ 2023 પાલન",
    s8: "8. ભારતમાં ડેટા સુરક્ષા અને સંગ્રહ",
    s9: "9. B2B પાત્રતા અને બાળકોની ગોપનીયતા",
    s10: "10. ફરિયાદ અધિકારી અને સંપર્ક વિગતો",
  },
};

// ─── 10. Punjabi (pa) ─────────────────────────────────────────────────────────
const paMeta: SellerPrivacyMeta = {
  title: "ਵਿਕਰੇਤਾ ਅਤੇ ਵਪਾਰੀ ਗੋਪਨੀਯਤਾ ਨੀਤੀ",
  headings: {
    s1: "1. ਵਿਕਰੇਤਾਵਾਂ ਅਤੇ ਵਪਾਰੀਆਂ ਤੋਂ ਇਕੱਠੀ ਕੀਤੀ ਜਾਣਕਾਰੀ",
    s2: "2. ਮੋਬਾਈਲ ਐਪ ਇਜਾਜ਼ਤਾਂ (ਕੈਮਰਾ, ਸਟੋਰੇਜ, ਸੂਚਨਾਵਾਂ ਅਤੇ ਸਥਾਨ)",
    s3: "3. ਅਸੀਂ ਵਪਾਰੀ ਦੀ ਜਾਣਕਾਰੀ ਕਿਵੇਂ ਵਰਤਦੇ ਹਾਂ",
    s4: "4. ਜਾਣਕਾਰੀ ਸਾਂਝੀ ਕਰਨਾ ਅਤੇ ਲੌਜਿਸਟਿਕਸ/ਭੁਗਤਾਨ ਗੇਟਵੇ",
    s5: "5. ਵਿੱਤੀ ਜਾਣਕਾਰੀ ਅਤੇ ਭੁਗਤਾਨ ਪ੍ਰਕਿਰਿਆ",
    s6: "6. ਡੇਟਾ ਧਾਰਨ ਅਤੇ ਖਾਤਾ ਮਿਟਾਉਣ ਦੀ ਨੀਤੀ",
    s7: "7. ਵਪਾਰੀ ਅਧਿਕਾਰ ਅਤੇ DPDP ਐਕਟ 2023 ਪਾਲਣਾ",
    s8: "8. ਭਾਰਤ ਵਿੱਚ ਡੇਟਾ ਸੁਰੱਖਿਆ ਅਤੇ ਸਟੋਰੇਜ",
    s9: "9. B2B ਯੋਗਤਾ ਅਤੇ ਬੱਚਿਆਂ ਦੀ ਗੋਪਨੀਯਤਾ",
    s10: "10. ਸ਼ਿਕਾਇਤ ਅਧਿਕਾਰੀ ਅਤੇ ਸੰਪਰਕ ਵੇਰਵੇ",
  },
};

// ─── 11. Urdu (ur) ────────────────────────────────────────────────────────────
const urMeta: SellerPrivacyMeta = {
  title: "سیلر اور مرچنٹ رازداری کی پالیسی",
  headings: {
    s1: "1. فروخت کنندگان اور تاجروں سے جمع کردہ معلومات",
    s2: "2. موبائل ایپ کی اجازتیں (کیمرہ، اسٹوریج، اطلاعات اور مقام)",
    s3: "3. ہم تاجر کی معلومات کا استعمال کیسے کرتے ہیں",
    s4: "4. معلومات کا تبادلہ اور لاجسٹکس/ادائیگی کے گیٹ ویز",
    s5: "5. مالیاتی معلومات اور ادائیگی کا عمل",
    s6: "6. ڈیٹا برقرار رکھنا اور اکاؤنٹ حذف کرنے کی پالیسی",
    s7: "7. تاجر کے حقوق اور DPDP ایکٹ 2023 کی تعمیل",
    s8: "8. بھارت میں ڈیٹا سیکیورٹی اور اسٹوریج",
    s9: "9. B2B اہلیت اور بچوں کی رازداری",
    s10: "10. شکایت افسر اور رابطے کی تفصیلات",
  },
};

const METAS: Record<LangCode, SellerPrivacyMeta> = {
  en: enMeta,
  ml: mlMeta,
  hi: hiMeta,
  ta: taMeta,
  te: teMeta,
  bn: bnMeta,
  mr: mrMeta,
  kn: knMeta,
  gu: guMeta,
  pa: paMeta,
  ur: urMeta,
};

const BODIES: Record<LangCode, Record<SellerPrivacySectionKey, PrivacySectionContent>> = {
  en: en,
  ml: ml,
  hi: hi,
  ta: en,
  te: en,
  bn: en,
  mr: en,
  kn: en,
  gu: en,
  pa: en,
  ur: en,
};

const INTROS: Record<LangCode, PrivacySectionContent> = {
  en: enIntro,
  ml: mlIntro,
  hi: hiIntro,
  ta: enIntro,
  te: enIntro,
  bn: enIntro,
  mr: enIntro,
  kn: enIntro,
  gu: enIntro,
  pa: enIntro,
  ur: enIntro,
};

export function getSellerPrivacyMeta(lang: LangCode): SellerPrivacyMeta {
  return METAS[lang] || METAS.en;
}

export function getSellerPrivacyBody(lang: LangCode, section: "intro" | SellerPrivacySectionKey): PrivacySectionContent {
  if (section === "intro") return INTROS[lang] || INTROS.en;
  const dict = BODIES[lang] || BODIES.en;
  return dict[section] || BODIES.en[section];
}
