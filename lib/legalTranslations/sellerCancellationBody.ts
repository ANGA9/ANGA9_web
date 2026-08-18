import type { LangCode } from "@/lib/i18n";
import type { CancellationBlock, CancellationSectionContent, CancellationMeta } from "./cancellationBody";

export type SellerCancellationSectionKey =
  | "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7";

export interface SellerCancellationHeadings {
  s1: string;
  s2: string;
  s3: string;
  s4: string;
  s5: string;
  s6: string;
  s7: string;
}

export interface SellerCancellationMeta {
  title: string;
  headings: SellerCancellationHeadings;
}

export const SELLER_CANCELLATION_SECTION_KEYS: SellerCancellationSectionKey[] = [
  "s1", "s2", "s3", "s4", "s5", "s6", "s7"
];

// ─── 1. English (en) ──────────────────────────────────────────────────────────
const enMeta: SellerCancellationMeta = {
  title: "Seller Order Acceptance & SLA Policy",
  headings: {
    s1: "1. Order Acceptance SLA (24 Hours)",
    s2: "2. Seller-Initiated Cancellation (Out of Stock)",
    s3: "3. Service Level Agreement (SLA) Penalties",
    s4: "4. Buyer-Initiated Cancellations before Dispatch",
    s5: "5. Post-Dispatch Cancellation Restrictions",
    s6: "6. Inventory Sync & Automated Delisting",
    s7: "7. Contact Merchant Operations Team",
  },
};

// ─── 2. Malayalam (ml) ────────────────────────────────────────────────────────
const mlMeta: SellerCancellationMeta = {
  title: "വിൽപ്പനക്കാരന്റെ ഓർഡർ സ്വീകാര്യത & SLA നയം",
  headings: {
    s1: "1. ഓർഡർ സ്വീകരിക്കൽ SLA (24 മണിക്കൂർ)",
    s2: "2. സ്റ്റോക്ക് കുറവ് മൂലമുള്ള റദ്ദാക്കലുകൾ",
    s3: "3. സേവന നിലവാര (SLA) പിഴകൾ",
    s4: "4. അയയ്ക്കുന്നതിന് മുൻപുള്ള ഉപഭോക്തൃ റദ്ദാക്കലുകൾ",
    s5: "5. അയച്ചതിന് ശേഷമുള്ള റദ്ദാക്കൽ നിയന്ത്രണങ്ങൾ",
    s6: "6. ഇൻവെന്ററി സമന്വയവും ഓട്ടോമാറ്റിക് ഡീലിസ്റ്റിംഗും",
    s7: "7. ഓപ്പറേഷൻസ് ടീമുമായി ബന്ധപ്പെടുക",
  },
};

// ─── 3. Hindi (hi) ────────────────────────────────────────────────────────────
const hiMeta: SellerCancellationMeta = {
  title: "विक्रेता ऑर्डर स्वीकृति एवं SLA नीति",
  headings: {
    s1: "1. ऑर्डर स्वीकृति SLA (24 घंटे)",
    s2: "2. विक्रेता द्वारा रद्दीकरण (आउट ऑफ स्टॉक)",
    s3: "3. सेवा स्तर अनुबंध (SLA) जुर्माना",
    s4: "4. प्रेषण से पहले खरीदार द्वारा रद्दीकरण",
    s5: "5. प्रेषण के बाद रद्दीकरण प्रतिबंध",
    s6: "6. इन्वेंटरी सिंक एवं स्वतः डीलिस्टिंग",
    s7: "7. मर्चेंट ऑपरेशंस टीम से संपर्क करें",
  },
};

// ─── 4. Tamil (ta) ────────────────────────────────────────────────────────────
const taMeta: SellerCancellationMeta = {
  title: "விற்பனையாளர் ஆர்டர் ஏற்பு & SLA கொள்கை",
  headings: {
    s1: "1. ஆர்டர் ஏற்பு SLA (24 மணிநேரம்)",
    s2: "2. விற்பனையாளர் ரத்து செய்தல் (இருப்பு இல்லை)",
    s3: "3. சேவை நிலை ஒப்பந்த (SLA) அபராதங்கள்",
    s4: "4. அனுப்புவதற்கு முன் வாங்குபவர் ரத்து செய்தல்",
    s5: "5. அனுப்பிய பின் ரத்து செய்வதற்கான கட்டுப்பாடுகள்",
    s6: "6. சரக்கு ஒத்திசைவு & தானியங்கி நீக்கம்",
    s7: "7. செயல்பாட்டுக் குழுவைத் தொடர்பு கொள்ளவும்",
  },
};

// ─── 5. Telugu (te) ───────────────────────────────────────────────────────────
const teMeta: SellerCancellationMeta = {
  title: "విక్రేత ఆర్డర్ ఆమోదం & SLA విధానం",
  headings: {
    s1: "1. ఆర్డర్ ఆమోద గడువు (24 గంటలు)",
    s2: "2. స్టాక్ లేకపోవడం వల్ల విక్రేత రద్దు",
    s3: "3. సేవా స్థాయి ఒప్పందం (SLA) జరిమానాలు",
    s4: "4. డిస్పాచ్‌కు ముందు కొనుగోలుదారు రద్దు",
    s5: "5. డిస్పాచ్ తర్వాత రద్దు పరిమితులు",
    s6: "6. ఇన్వెంటరీ సింక్ & ఆటోమేటెడ్ డీలిస్టింగ్",
    s7: "7. ఆపరేషన్స్ బృందాన్ని సంప్రదించండి",
  },
};

// ─── 6. Bengali (bn) ──────────────────────────────────────────────────────────
const bnMeta: SellerCancellationMeta = {
  title: "বিক্রেতা অর্ডার গ্রহণ ও SLA নীতি",
  headings: {
    s1: "১. অর্ডার গ্রহণযোগ্যতা SLA (২৪ ঘণ্টা)",
    s2: "২. বিক্রেতা কর্তৃক বাতিলকরণ (স্টক শেষ)",
    s3: "৩. পরিষেবা স্তর চুক্তি (SLA) জরিমানা",
    s4: "৪. প্রেরণের আগে ক্রেতা কর্তৃক বাতিলকরণ",
    s5: "৫. প্রেরণের পরে বাতিলকরণের সীমাবদ্ধতা",
    s6: "৬. ইনভেন্টরি সিঙ্ক ও স্বয়ংক্রিয় ডিলিস্টিং",
    s7: "৭. অপারেশন দলের সাথে যোগাযোগ",
  },
};

// ─── 7. Marathi (mr) ──────────────────────────────────────────────────────────
const mrMeta: SellerCancellationMeta = {
  title: "विक्रेता ऑर्डर स्वीकृती आणि SLA धोरण",
  headings: {
    s1: "१. ऑर्डर स्वीकृती SLA (२४ तास)",
    s2: "२. विक्रेता-सुरू केलेले रद्दीकरण (स्टॉक संपला)",
    s3: "३. सेवा स्तर करार (SLA) दंड",
    s4: "४. डिस्पॅचपूर्वी खरेदीदाराकडून रद्दीकरण",
    s5: "५. डिस्पॅचनंतर रद्दीकरण निर्बंध",
    s6: "६. इन्व्हेंटरी सिंक आणि स्वयंचलित डीलिस्टिंग",
    s7: "७. ऑपरेशन्स टीमशी संपर्क साधा",
  },
};

// ─── 8. Kannada (kn) ──────────────────────────────────────────────────────────
const knMeta: SellerCancellationMeta = {
  title: "ಮಾರಾಟಗಾರರ ಆರ್ಡರ್ ಸ್ವೀಕಾರ & SLA ನೀತಿ",
  headings: {
    s1: "1. ಆರ್ಡರ್ ಸ್ವೀಕಾರ SLA (24 ಗಂಟೆಗಳು)",
    s2: "2. ಸ್ಟಾಕ್ ಕೊರತೆಯಿಂದ ಮಾರಾಟಗಾರರ ರದ್ದತಿ",
    s3: "3. ಸೇವಾ ಮಟ್ಟದ ಒಪ್ಪಂದ (SLA) ದಂಡಗಳು",
    s4: "4. ರವಾನೆಗೆ ಮುನ್ನ ಖರೀದಿದಾರರ ರದ್ದತಿ",
    s5: "5. ರವಾನೆಯ ನಂತರದ ರದ್ದತಿ ನಿರ್ಬಂಧಗಳು",
    s6: "6. ದಾಸ್ತಾನು ಸಿಂಕ್ & ಸ್ವಯಂಚಾಲಿತ ತೆಗೆದುಹಾಕುವಿಕೆ",
    s7: "7. ಕಾರ್ಯಾಚರಣೆ ತಂಡವನ್ನು ಸಂಪರ್ಕಿಸಿ",
  },
};

// ─── 9. Gujarati (gu) ─────────────────────────────────────────────────────────
const guMeta: SellerCancellationMeta = {
  title: "વિક્રેતા ઓર્ડર સ્વીકૃતિ અને SLA નીતિ",
  headings: {
    s1: "1. ઓર્ડર સ્વીકૃતિ SLA (24 કલાક)",
    s2: "2. સ્ટોક બહાર હોવાથી વિક્રેતા દ્વારા રદ",
    s3: "3. સેવા સ્તર કરાર (SLA) પેનલ્ટી",
    s4: "4. ડિસ્પેચ પહેલાં ગ્રાહક દ્વારા રદ",
    s5: "5. ડિસ્પેચ પછી રદ કરવા પર પ્રતિબંધ",
    s6: "6. ઇન્વેન્ટરી સિંક અને સ્વચાલિત ડિલિસ્ટિંગ",
    s7: "7. ઓપરેશન્સ ટીમનો સંપર્ક કરો",
  },
};

// ─── 10. Punjabi (pa) ─────────────────────────────────────────────────────────
const paMeta: SellerCancellationMeta = {
  title: "ਵਿਕਰੇਤਾ ਆਰਡਰ ਸਵੀਕ੍ਰਿਤੀ ਅਤੇ SLA ਨੀਤੀ",
  headings: {
    s1: "1. ਆਰਡਰ ਸਵੀਕ੍ਰਿਤੀ SLA (24 ਘੰਟੇ)",
    s2: "2. ਸਟਾਕ ਖਤਮ ਹੋਣ ਕਾਰਨ ਵਿਕਰੇਤਾ ਰੱਦ",
    s3: "3. ਸੇਵਾ ਪੱਧਰ ਸਮਝੌਤਾ (SLA) ਜੁਰਮਾਨੇ",
    s4: "4. ਡਿਸਪੈਚ ਤੋਂ ਪਹਿਲਾਂ ਗਾਹਕ ਰੱਦ",
    s5: "5. ਡਿਸਪੈਚ ਤੋਂ ਬਾਅਦ ਰੱਦ ਕਰਨ ਦੀਆਂ ਪਾਬੰਦੀਆਂ",
    s6: "6. ਇਨਵੈਂਟਰੀ ਸਿੰਕ ਅਤੇ ਸਵੈਚਾਲਿਤ ਡੀਲਿਸਟਿੰਗ",
    s7: "7. ਓਪਰੇਸ਼ਨ ਟੀਮ ਨਾਲ ਸੰਪਰਕ ਕਰੋ",
  },
};

// ─── 11. Urdu (ur) ────────────────────────────────────────────────────────────
const urMeta: SellerCancellationMeta = {
  title: "سیلر آرڈر کی قبولیت اور SLA پالیسی",
  headings: {
    s1: "1. آرڈر قبولیت SLA (24 گھنٹے)",
    s2: "2. اسٹاک ختم ہونے کی وجہ سے سیلر منسوخی",
    s3: "3. سروس لیول ایگریمنٹ (SLA) جرمانے",
    s4: "4. ڈسپیچ سے پہلے خریدار کی منسوخی",
    s5: "5. ڈسپیچ کے بعد منسوخی پر پابندیاں",
    s6: "6. انوینٹری سنک اور خودکار ڈی لسٹنگ",
    s7: "7. آپریشنز ٹیم سے رابطہ کریں",
  },
};

const en: Record<SellerCancellationSectionKey, CancellationSectionContent> = {
  s1: [
    {
      kind: "p",
      text: "Sellers must review and accept or reject incoming wholesale orders within **24 hours** of placement. Failure to accept within 24 hours results in automatic order cancellation and SLA breach logging.",
    },
  ],
  s2: [
    {
      kind: "p",
      text: "If an item is out of stock, sellers must immediately cancel the order from the Seller Portal before packing or generating shipping labels to avoid logistics penalties.",
    },
  ],
  s3: [
    {
      kind: "p",
      text: "Frequent cancellations (exceeding 2% of total monthly orders) or dispatch delays incur a standard marketplace reliability penalty of 5% of order value to cover buyer disruption and re-routing costs.",
    },
  ],
  s4: [
    {
      kind: "p",
      text: "Buyers may cancel an order free of cost only while the order status is 'Pending' or 'Confirmed', before the seller generates the official shipping label and manifest.",
    },
  ],
  s5: [
    {
      kind: "p",
      text: "Once a courier manifest is generated and the consignment is handed over to the courier executive, wholesale orders cannot be cancelled mid-transit by the buyer.",
    },
  ],
  s6: [
    {
      kind: "p",
      text: "Sellers are strongly advised to keep real-time inventory counts updated using our Bulk Inventory Management tool or Seller App to avoid out-of-stock scenarios.",
    },
  ],
  s7: [
    {
      kind: "p",
      text: "For questions regarding order acceptance or cancellation penalty waivers, contact [operations@anga9.com](mailto:operations@anga9.com).",
    },
  ],
};

const introBlock: CancellationSectionContent = [
  {
    kind: "p",
    text: "To provide wholesale buyers with guaranteed delivery timelines, ANGA9 enforces strict order acceptance SLAs and out-of-stock cancellation guidelines for registered sellers.",
  },
];

const METAS: Record<LangCode, SellerCancellationMeta> = {
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

export function getSellerCancellationMeta(lang: LangCode): SellerCancellationMeta {
  return METAS[lang] || METAS.en;
}

export function getSellerCancellationBody(lang: LangCode, section: "intro" | SellerCancellationSectionKey): CancellationSectionContent {
  if (section === "intro") return introBlock;
  return en[section] || [];
}
