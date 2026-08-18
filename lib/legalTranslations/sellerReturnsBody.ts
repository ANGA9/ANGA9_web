import type { LangCode } from "@/lib/i18n";
import type { ReturnsBlock, ReturnsSectionContent, ReturnsMeta } from "./returnsBody";

export type SellerReturnsSectionKey =
  | "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7" | "s8" | "s9";

export const SELLER_RETURNS_SECTION_KEYS: SellerReturnsSectionKey[] = [
  "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"
];

// ─── 1. English (en) ──────────────────────────────────────────────────────────
const enMeta: ReturnsMeta = {
  title: "Seller Return & Inspection Policy",
  headings: {
    s1: "1. Wholesale Return Eligibility Criteria",
    s2: "2. Buyer Return Windows & Mandatory Proofs",
    s3: "3. Seller Inspection Window & Acceptance",
    s4: "4. Return Dispute Arbitration & Unboxing Video Evidence",
    s5: "5. Return Shipping Charges & Logistics Liability",
    s6: "6. Settlement Ledger Adjustments & TCS Reversals",
    s7: "7. Non-Returnable Wholesale Goods",
    s8: "8. Fraudulent Return Protection Policy",
    s9: "9. Contact Seller Dispute Arbitration Team",
  },
};

// ─── 2. Malayalam (ml) ────────────────────────────────────────────────────────
const mlMeta: ReturnsMeta = {
  title: "വിൽപ്പനക്കാരന്റെ റിട്ടേൺ & പരിശോധനാ നയം",
  headings: {
    s1: "1. മൊത്തവ്യാപാര റിട്ടേൺ യോഗ്യതാ മാനദണ്ഡങ്ങൾ",
    s2: "2. ഉപഭോക്തൃ റിട്ടേൺ സമയവും തെളിവുകളും",
    s3: "3. വിൽപ്പനക്കാരന്റെ പരിശോധനാ സമയം (72 മണിക്കൂർ)",
    s4: "4. തർക്ക പരിഹാരവും അൺബോക്സിംഗ് വീഡിയോ തെളിവും",
    s5: "5. റിട്ടേൺ ഷിപ്പിംഗ് നിരക്കുകളും ബാധ്യതകളും",
    s6: "6. പേഔട്ട് സെറ്റിൽമെന്റും GST TCS തിരിച്ചടവും",
    s7: "7. തിരികെ നൽകാത്ത സാധനങ്ങൾ",
    s8: "8. തട്ടിപ്പ് തടയൽ സംരക്ഷണ നയം",
    s9: "9. തർക്ക പരിഹാര ടീമുമായി ബന്ധപ്പെടുക",
  },
};

// ─── 3. Hindi (hi) ────────────────────────────────────────────────────────────
const hiMeta: ReturnsMeta = {
  title: "विक्रेता वापसी एवं निरीक्षण नीति",
  headings: {
    s1: "1. थोक वापसी पात्रता मानदंड",
    s2: "2. खरीदार वापसी अवधि एवं अनिवार्य प्रमाण",
    s3: "3. विक्रेता निरीक्षण अवधि (72 घंटे)",
    s4: "4. विवाद मध्यस्थता एवं अनबॉक्सिंग वीडियो साक्ष्य",
    s5: "5. वापसी कूरियर शुल्क एवं देयता",
    s6: "6. पेआउट समायोजन एवं TCS क्रेडिट",
    s7: "7. गैर-वापसी योग्य थोक वस्तुएं",
    s8: "8. धोखाधड़ी संरक्षण नीति",
    s9: "9. विवाद मध्यस्थता टीम से संपर्क करें",
  },
};

// ─── 4. Tamil (ta) ────────────────────────────────────────────────────────────
const taMeta: ReturnsMeta = {
  title: "விற்பனையாளர் திரும்புதல் மற்றும் ஆய்வு கொள்கை",
  headings: {
    s1: "1. மொத்த விற்பனை திரும்புதல் தகுதி வரம்புகள்",
    s2: "2. வாங்குபவர் திரும்பப்பெறும் காலக்கெடு & ஆதாரங்கள்",
    s3: "3. விற்பனையாளர் ஆய்வு காலம் (72 மணிநேரம்)",
    s4: "4. தகராறு நடுவர் மற்றும் அன்பாக்சிங் வீடியோ ஆதாரம்",
    s5: "5. திரும்ப அனுப்பும் கூரியர் கட்டணங்கள்",
    s6: "6. கொடுப்பனவு சரிசெய்தல் மற்றும் GST TCS",
    s7: "7. திரும்பப்பெற முடியாத பொருட்கள்",
    s8: "8. மோசடி பாதுகாப்பு கொள்கை",
    s9: "9. தகராறு நடுவர் குழுவைத் தொடர்பு கொள்ளவும்",
  },
};

// ─── 5. Telugu (te) ───────────────────────────────────────────────────────────
const teMeta: ReturnsMeta = {
  title: "విక్రేత రిటర్న్ & తనిఖీ విధానం",
  headings: {
    s1: "1. హోల్‌సేల్ రిటర్న్ అర్హత ప్రమాణాలు",
    s2: "2. కొనుగోలుదారు రిటర్న్ విండో & ఆధారాలు",
    s3: "3. విక్రేత తనిఖీ గడువు (72 గంటలు)",
    s4: "4. వివాద పరిష్కారం & అన్‌బాక్సింగ్ వీడియో సాక్ష్యం",
    s5: "5. రిటర్న్ షిప్పింగ్ ఛార్జీలు",
    s6: "6. సెటిల్మెంట్ సర్దుబాటు & GST TCS",
    s7: "7. తిరిగి ఇవ్వలేని వస్తువులు",
    s8: "8. మోసం రక్షణ విధానం",
    s9: "9. వివాద పరిష్కార బృందాన్ని సంప్రదించండి",
  },
};

// ─── 6. Bengali (bn) ──────────────────────────────────────────────────────────
const bnMeta: ReturnsMeta = {
  title: "বিক্রেতা ফেরত ও পরিদর্শন নীতি",
  headings: {
    s1: "১. পাইকারি ফেরত যোগ্যতার মানদণ্ড",
    s2: "২. ক্রেতা ফেরত সময়সীমা ও প্রয়োজনীয় প্রমাণ",
    s3: "৩. বিক্রেতার পরিদর্শন উইন্ডো (৭২ ঘণ্টা)",
    s4: "৪. বিরোধ নিষ্পত্তি ও আনবক্সিং ভিডিও প্রমাণ",
    s5: "৫. রিটার্ন শিপিং চার্জ ও দায়বদ্ধতা",
    s6: "৬. পেআউট সমন্বয় ও GST TCS রিভার্সাল",
    s7: "৭. অ-ফেরতযোগ্য পাইকারি পণ্য",
    s8: "৮. প্রতারণা সুরক্ষা নীতি",
    s9: "৯. বিরোধ নিষ্পত্তি দলের সাথে যোগাযোগ",
  },
};

// ─── 7. Marathi (mr) ──────────────────────────────────────────────────────────
const mrMeta: ReturnsMeta = {
  title: "विक्रेता परतावा आणि तपासणी धोरण",
  headings: {
    s1: "१. घाऊक परतावा पात्रता निकष",
    s2: "२. खरेदीदार परतावा मुदत आणि पुरावे",
    s3: "३. विक्रेता तपासणी कालावधी (७२ तास)",
    s4: "४. विवाद लवाद आणि अनबॉक्सिंग व्हिडिओ पुरावा",
    s5: "५. रिटर्न कुरिअर शुल्क आणि जबाबदारी",
    s6: "६. पेआउट समायोजन आणि GST TCS परतावा",
    s7: "७. नॉन-रिटर्न करण्यायोग्य वस्तू",
    s8: "८. फसवणूक संरक्षण धोरण",
    s9: "९. विवाद लवाद संघाशी संपर्क साधा",
  },
};

// ─── 8. Kannada (kn) ──────────────────────────────────────────────────────────
const knMeta: ReturnsMeta = {
  title: "ಮಾರಾಟಗಾರರ ಮರುಪಾವತಿ & ಪರಿಶೀಲನಾ ನೀತಿ",
  headings: {
    s1: "1. ಸಗಟು ರಿಟರ್ನ್ ಅರ್ಹತಾ ಮಾನದಂಡಗಳು",
    s2: "2. ಖರೀದಿದಾರರ ರಿಟರ್ನ್ ಅವಧಿ & ಪುರಾವೆಗಳು",
    s3: "3. ಮಾರಾಟಗಾರರ ಪರಿಶೀಲನಾ ಅವಧಿ (72 ಗಂಟೆಗಳು)",
    s4: "4. ವಿವಾದ ತೀರ್ಪುಗಾರಿಕೆ & ಅನ್‌ಬಾಕ್ಸಿಂಗ್ ವಿಡಿಯೋ ಸಾಕ್ಷಿ",
    s5: "5. ರಿಟರ್ನ್ ಶಿಪ್ಪಿಂಗ್ ಶುಲ್ಕಗಳು",
    s6: "6. ಪಾವತಿ ಇತ್ಯರ್ಥ ಹೊಂದಾಣಿಕೆ & GST TCS",
    s7: "7. ಹಿಂತಿರುಗಿಸಲಾಗದ ಸರಕುಗಳು",
    s8: "8. ವಂಚನೆ ಸಂರಕ್ಷಣಾ ನೀತಿ",
    s9: "9. ವಿವಾದ ಪರಿಹಾರ ತಂಡವನ್ನು ಸಂಪರ್ಕಿಸಿ",
  },
};

// ─── 9. Gujarati (gu) ─────────────────────────────────────────────────────────
const guMeta: ReturnsMeta = {
  title: "વિક્રેતા રિટર્ન અને નિરીક્ષણ નીતિ",
  headings: {
    s1: "1. જથ્થાબંધ રિટર્ન પાત્રતા માપદંડ",
    s2: "2. ગ્રાહક રિટર્ન વિન્ડો અને પુરાવા",
    s3: "3. વિક્રેતા નિરીક્ષણ વિન્ડો (72 કલાક)",
    s4: "4. વિવાદ લવાદ અને અનબોક્સિંગ વિડીયો પુરાવા",
    s5: "5. રિટર્ન કુરિયર ચાર્જીસ",
    s6: "6. પેઆઉટ એડજસ્ટમેન્ટ અને GST TCS",
    s7: "7. નોન-રિટર્નેબલ પ્રોડક્ટ્સ",
    s8: "8. છેતરપિંડી સુરક્ષા નીતિ",
    s9: "9. વિવાદ લવાદ ટીમનો સંપર્ક કરો",
  },
};

// ─── 10. Punjabi (pa) ─────────────────────────────────────────────────────────
const paMeta: ReturnsMeta = {
  title: "ਵਿਕਰੇਤਾ ਵਾਪਸੀ ਅਤੇ ਨਿਰੀਖਣ ਨੀਤੀ",
  headings: {
    s1: "1. ਥੋਕ ਵਾਪਸੀ ਯੋਗਤਾ ਮਾਪਦੰਡ",
    s2: "2. ਖਰੀਦਦਾਰ ਵਾਪਸੀ ਸਮਾਂ ਅਤੇ ਸਬੂਤ",
    s3: "3. ਵਿਕਰੇਤਾ ਨਿਰੀਖਣ ਵਿੰਡੋ (72 ਘੰਟੇ)",
    s4: "4. ਵਿਵਾਦ ਨਿਪਟਾਰਾ ਅਤੇ ਅਨਬਾਕਸਿੰਗ ਵੀਡੀਓ ਸਬੂਤ",
    s5: "5. ਵਾਪਸੀ ਕੋਰੀਅਰ ਖਰਚੇ",
    s6: "6. ਭੁਗਤਾਨ ਐਡਜਸਟਮੈਂਟ ਅਤੇ GST TCS",
    s7: "7. ਗੈਰ-ਵਾਪਸੀਯੋਗ ਸਾਮਾਨ",
    s8: "8. ਧੋਖਾਧੜੀ ਸੁਰੱਖਿਆ ਨੀਤੀ",
    s9: "9. ਵਿਵਾਦ ਨਿਪਟਾਰਾ ਟੀਮ ਨਾਲ ਸੰਪਰਕ ਕਰੋ",
  },
};

// ─── 11. Urdu (ur) ────────────────────────────────────────────────────────────
const urMeta: ReturnsMeta = {
  title: "سیلر واپسی اور معائنہ کی پالیسی",
  headings: {
    s1: "1. ہول سیل واپسی کی اہلیت کے معیارات",
    s2: "2. خریدار کی واپسی کی مدت اور ثبوت",
    s3: "3. سیلر کے معائنہ کی مدت (72 گھنٹے)",
    s4: "4. تنازعات کا فیصلہ اور ان باکسنگ ویڈیو ثبوت",
    s5: "5. واپسی کوریئر چارجز",
    s6: "6. ادائیگی میں ایڈجسٹمنٹ اور GST TCS",
    s7: "7. ناقابل واپسی سامان",
    s8: "8. فراڈ پروٹیکشن پالیسی",
    s9: "9. تنازعات کی ٹیم سے رابطہ کریں",
  },
};

const en: Record<SellerReturnsSectionKey, ReturnsSectionContent> = {
  s1: [
    {
      kind: "p",
      text: "Unlike consumer retail, wholesale B2B purchases are eligible for return only under specific verifiable circumstances:",
    },
    {
      kind: "ul",
      items: [
        "Manufacturing defects (fabric tears, incorrect stitching, color fading).",
        "Mismatched bulk quantities or incorrect SKU / size sets shipped by the seller.",
        "Transit damage verified during delivery.",
      ],
    },
  ],
  s2: [
    {
      kind: "p",
      text: "Buyers must raise return requests within 48 hours of delivery along with high-resolution photos and continuous unboxing video footage showing the shipping label and defect.",
    },
  ],
  s3: [
    {
      kind: "p",
      text: "Upon physical receipt of the returned wholesale consignment, sellers have a **72-hour inspection window** to verify the returned inventory against the buyer's claim.",
    },
  ],
  s4: [
    {
      kind: "p",
      text: "If a buyer returns used, damaged, substituted, or incomplete merchandise, the seller can raise a dispute within 72 hours via the Seller Dashboard by submitting an unboxing video of the return parcel. ANGA9's arbitration cell investigates and reimburses the seller in full if fraud is detected.",
    },
  ],
  s5: [
    {
      kind: "p",
      text: "For genuine merchant-fault returns (defects or wrong items), return courier freight is charged to the seller. For buyer remorse or invalid claims, freight charges are borne by the buyer.",
    },
  ],
  s6: [
    {
      kind: "p",
      text: "Approved returns are adjusted against future payout settlement cycles. Any deducted GST TCS on the returned merchandise is reversed and reflected in your GSTR-8 matching credit ledger.",
    },
  ],
  s7: [
    {
      kind: "p",
      text: "Customized apparel, private-label stitched goods, clearance liquidation lots, and items altered post-delivery are strictly non-returnable.",
    },
  ],
  s8: [
    {
      kind: "p",
      text: "ANGA9 maintains a Seller Protection Fund (SPF) to safeguard trusted merchants against courier transit theft, malicious buyer switching, and delivery partner tampering.",
    },
  ],
  s9: [
    {
      kind: "p",
      text: "For escalations regarding disputed returns, contact the ANGA9 Dispute Desk at [disputes@anga9.com](mailto:disputes@anga9.com) or use the dedicated Disputes tab in your Seller Dashboard.",
    },
  ],
};

const introBlock: ReturnsSectionContent = [
  {
    kind: "p",
    text: "ANGA9 operates a verified B2B wholesale marketplace with strict return policies to protect manufacturers and distributors from frivolous returns. This policy outlines how merchant returns, quality inspections, unboxing claims, and settlement adjustments are processed.",
  },
];

const METAS: Record<LangCode, ReturnsMeta> = {
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

export function getSellerReturnsMeta(lang: LangCode): ReturnsMeta {
  return METAS[lang] || METAS.en;
}

export function getSellerReturnsBody(lang: LangCode, section: "intro" | SellerReturnsSectionKey): ReturnsSectionContent {
  if (section === "intro") return introBlock;
  return en[section] || [];
}
