import type { LangCode } from "@/lib/i18n";
import type { ShippingBlock, ShippingSectionContent, ShippingMeta, ShippingHeadings } from "./shippingBody";

export type SellerShippingSectionKey =
  | "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7" | "s8" | "s9";

export const SELLER_SHIPPING_SECTION_KEYS: SellerShippingSectionKey[] = [
  "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"
];

// ─── 1. English (en) ──────────────────────────────────────────────────────────
const enMeta: ShippingMeta = {
  title: "Seller Dispatch & Logistics Policy",
  headings: {
    s1: "1. Doorstep Pickup & Logistics Coverage",
    s2: "2. Dispatch SLAs & Pickup Scheduling",
    s3: "3. Packaging Standards for Bulk Wholesale Orders",
    s4: "4. Shipping Labels, Barcodes & Manifest Handover",
    s5: "5. GST E-Way Bill Compliance (> ₹50,000)",
    s6: "6. Return to Origin (RTO) & Transit Damages",
    s7: "7. Warehouse Address Changes & Cutoff Times",
    s8: "8. Courier Partner Performance & Penalties",
    s9: "9. Logistics Support & Claim Escalations",
  },
};

// ─── 2. Malayalam (ml) ────────────────────────────────────────────────────────
const mlMeta: ShippingMeta = {
  title: "വിൽപ്പനക്കാരന്റെ അയയ്ക്കലും ലോജിസ്റ്റിക്സ് നയവും",
  headings: {
    s1: "1. ഡോർസ്റ്റെപ്പ് പിക്കപ്പും ലോജിസ്റ്റിക്സ് കവറേജും",
    s2: "2. ഡിസ്പാച്ച് SLA & പിക്കപ്പ് ഷെഡ്യൂളിംഗ്",
    s3: "3. മൊത്തവ്യാപാര പാക്കേജിംഗ് മാനദണ്ഡങ്ങൾ",
    s4: "4. ഷിപ്പിംഗ് ലേബലും പിക്കപ്പ് മാനിഫെസ്റ്റും",
    s5: "5. GST ഇ-വേ ബിൽ നിർബന്ധങ്ങൾ (> ₹50,000)",
    s6: "6. റിട്ടേൺ ടു ഒറിജിൻ (RTO) & കേടുപാടുകൾ",
    s7: "7. വെയർഹൗസ് വിലാസ മാറ്റങ്ങൾ",
    s8: "8. കൊറിയർ പങ്കാളി നഷ്ടപരിഹാരം",
    s9: "9. ലോജിസ്റ്റിക്‌സ് സഹായവും ക്ലെയിമുകളും",
  },
};

// ─── 3. Hindi (hi) ────────────────────────────────────────────────────────────
const hiMeta: ShippingMeta = {
  title: "विक्रेता प्रेषण एवं लॉजिस्टिक्स नीति",
  headings: {
    s1: "1. डोरस्टेप पिकअप एवं लॉजिस्टिक्स कवरेज",
    s2: "2. प्रेषण (Dispatch) SLA एवं पिकअप समय",
    s3: "3. थोक पैकेजिंग मानक",
    s4: "4. शिपिंग लेबल एवं पिकअप मेनिफेस्ट हैंडओवर",
    s5: "5. GST ई-वे बिल अनुपालन (> ₹50,000)",
    s6: "6. रिटर्न टू ओरिजिन (RTO) एवं ट्रांजिट क्षति",
    s7: "7. गोदाम पता परिवर्तन",
    s8: "8. कूरियर पार्टनर प्रदर्शन एवं मुआवजा",
    s9: "9. लॉजिस्टिक्स सहायता एवं शिकायत निवारण",
  },
};

// ─── 4. Tamil (ta) ────────────────────────────────────────────────────────────
const taMeta: ShippingMeta = {
  title: "விற்பனையாளர் அனுப்புதல் மற்றும் தளவாடக் கொள்கை",
  headings: {
    s1: "1. வீட்டு வாசலில் பிக்கப் & தளவாடங்கள்",
    s2: "2. அனுப்புதல் SLA & பிக்கப் அட்டவணை",
    s3: "3. மொத்த பேக்கேஜிங் தரநிலைகள்",
    s4: "4. ஷிப்பிங் லேபிள் & பிக்கப் மேனிஃபெஸ்ட்",
    s5: "5. GST இ-வே பில் இணக்கம் (> ₹50,000)",
    s6: "6. திரும்பப்பெறுதல் (RTO) & போக்குவரத்து சேதங்கள்",
    s7: "7. கிடங்கு முகவரி மாற்றங்கள்",
    s8: "8. கூரியர் கூட்டாளர் செயல்திறன் & இழப்பீடு",
    s9: "9. தளவாட ஆதரவு & கோரிக்கைகள்",
  },
};

// ─── 5. Telugu (te) ───────────────────────────────────────────────────────────
const teMeta: ShippingMeta = {
  title: "విక్రేత రవాణా & లాజిస్టిక్స్ విధానం",
  headings: {
    s1: "1. డోర్‌స్టెప్ పికప్ & లాజిస్టిక్స్ కవరేజ్",
    s2: "2. డిస్పాచ్ SLA & పికప్ షెడ్యూలింగ్",
    s3: "3. హోల్‌సేల్ ప్యాకేజింగ్ ప్రమాణాలు",
    s4: "4. షిప్పింగ్ లేబుల్ & పికప్ మ్యానిఫెస్ట్",
    s5: "5. GST ఇ-వే బిల్లు నిబంధనలు (> ₹50,000)",
    s6: "6. రిటర్న్ టు ఆరిజిన్ (RTO) & రవాణా నష్టాలు",
    s7: "7. గిడ్డంగి చిరునామా మార్పులు",
    s8: "8. కొరియర్ భాగస్వామి పనితీరు & పరిహారం",
    s9: "9. లాజిస్టిక్స్ మద్దతు & ఫిర్యాదులు",
  },
};

// ─── 6. Bengali (bn) ──────────────────────────────────────────────────────────
const bnMeta: ShippingMeta = {
  title: "বিক্রেতা প্রেরণ ও লজিস্টিক নীতি",
  headings: {
    s1: "১. ডোরস্টেপ পিকআপ এবং লজিস্টিক কভারেজ",
    s2: "২. ডিসপ্যাচ SLA এবং পিকআপের সময়সূচী",
    s3: "৩. পাইকারি প্যাকেজিং মানদণ্ড",
    s4: "৪. শিপিং লেবেল এবং পিকআপ ম্যানিফেস্ট",
    s5: "৫. GST ই-ওয়ে বিল সম্মতি (> ₹৫০,০০০)",
    s6: "৬. রিটার্ন টু অরিজিন (RTO) ও ট্রানজিট ক্ষতি",
    s7: "৭. গুদাম ঠিকানা পরিবর্তন",
    s8: "৮. কুরিয়ার পার্টনার কর্মক্ষমতা ও ক্ষতিপূরণ",
    s9: "৯. লজিস্টিক সহায়তা এবং দাবি সমাধান",
  },
};

// ─── 7. Marathi (mr) ──────────────────────────────────────────────────────────
const mrMeta: ShippingMeta = {
  title: "विक्रेता डिस्पॅच आणि लॉजिस्टिक्स धोरण",
  headings: {
    s1: "१. डोअरस्टेप पिकअप आणि लॉजिस्टिक्स कव्हरेज",
    s2: "२. डिस्पॅच SLA आणि पिकअप वेळापत्रक",
    s3: "३. घाऊक पॅकेजिंग मानके",
    s4: "४. शिपिंग लेबल आणि पिकअप मॅनिफेस्ट",
    s5: "५. GST ई-वे बिल पालन (> ₹५०,००০)",
    s6: "६. रिटर्न टू ओरिजिन (RTO) आणि वाहतूक नुकसान",
    s7: "७. गोदाम पत्ता बदल",
    s8: "८. कुरिअर भागीदार कामगिरी आणि भरपाई",
    s9: "९. लॉजिस्टिक्स समर्थन आणि दावे",
  },
};

// ─── 8. Kannada (kn) ──────────────────────────────────────────────────────────
const knMeta: ShippingMeta = {
  title: "ಮಾರಾಟಗಾರರ ರವಾನೆ ಮತ್ತು ಲಾಜಿಸ್ಟಿಕ್ಸ್ ನೀತಿ",
  headings: {
    s1: "1. ಮನೆಬಾಗಿಲಿನ ಪಿಕಪ್ & ಲಾಜಿಸ್ಟಿಕ್ಸ್ ವ್ಯಾಪ್ತಿ",
    s2: "2. ರವಾನೆ SLA & ಪಿಕಪ್ ವೇಳಾಪಟ್ಟಿ",
    s3: "3. ಸಗಟು ಪ್ಯಾಕೇಜಿಂಗ್ ಮಾನದಂಡಗಳು",
    s4: "4. ಶಿಪ್ಪಿಂಗ್ ಲೇಬಲ್ & ಪಿಕಪ್ ಮ್ಯಾನಿಫೆಸ್ಟ್",
    s5: "5. GST ಇ-ವೇ ಬಿಲ್ ಅನುಸರಣೆ (> ₹50,000)",
    s6: "6. ರಿಟರ್ನ್ ಟು ಆರಿಜಿನ್ (RTO) & ಸಾರಿಗೆ ಹಾನಿ",
    s7: "7. ಗೋದಾಮಿನ ವಿಳಾಸ ಬದಲಾವಣೆಗಳು",
    s8: "8. ಕೊರಿಯರ್ ಪಾಲುದಾರರ ಪರಿಹಾರ",
    s9: "9. ಲಾಜಿಸ್ಟಿಕ್ಸ್ ಬೆಂಬಲ & ಕ್ಲೈಮ್‌ಗಳು",
  },
};

// ─── 9. Gujarati (gu) ─────────────────────────────────────────────────────────
const guMeta: ShippingMeta = {
  title: "વિક્રેતા ડિસ્પેચ અને લોજિસ્ટિક્સ નીતિ",
  headings: {
    s1: "1. ડોરસ્ટેપ પિકઅપ અને લોજિસ્ટિક્સ કવરેજ",
    s2: "2. ડિસ્પેચ SLA અને પિકઅપ શેડ્યૂલ",
    s3: "3. જથ્થાબંધ પેકેજિંગ ધોરણો",
    s4: "4. શિપિંગ લેબલ અને પિકઅપ મેનિફેસ્ટ",
    s5: "5. GST ઈ-વે બિલ પાલન (> ₹50,000)",
    s6: "6. રિટર્ન ટુ ઓરિજિન (RTO) અને નુકસાન",
    s7: "7. વેરહાઉસ સરનામાં ફેરફાર",
    s8: "8. કુરિયર પાર્ટનર વળતર",
    s9: "9. લોજિસ્ટિક્સ સહાય અને દાવા",
  },
};

// ─── 10. Punjabi (pa) ─────────────────────────────────────────────────────────
const paMeta: ShippingMeta = {
  title: "ਵਿਕਰੇਤਾ ਡਿਸਪੈਚ ਅਤੇ ਲੌਜਿਸਟਿਕਸ ਨੀਤੀ",
  headings: {
    s1: "1. ਡੋਰਸਟੈੱਪ ਪਿਕਅੱਪ ਅਤੇ ਲੌਜਿਸਟਿਕਸ ਕਵਰੇਜ",
    s2: "2. ਡਿਸਪੈਚ SLA ਅਤੇ ਪਿਕਅੱਪ ਸਮਾਂ-ਸੂਚੀ",
    s3: "3. ਥੋਕ ਪੈਕੇਜਿੰਗ ਮਾਪਦੰਡ",
    s4: "4. ਸ਼ਿਪਿੰਗ ਲੇਬਲ ਅਤੇ ਪਿਕਅੱਪ ਮੈਨੀਫੈਸਟ",
    s5: "5. GST ਈ-ਵੇਅ ਬਿੱਲ ਪਾਲਣਾ (> ₹50,000)",
    s6: "6. ਰਿਟਰਨ ਟੂ ਓਰੀਜਿਨ (RTO) ਅਤੇ ਆਵਾਜਾਈ ਨੁਕਸਾਨ",
    s7: "7. ਵੇਅਰਹਾਊਸ ਪਤਾ ਬਦਲਾਅ",
    s8: "8. ਕੋਰੀਅਰ ਪਾਰਟਨਰ ਮੁਆਵਜ਼ਾ",
    s9: "9. ਲੌਜਿਸਟਿਕਸ ਸਹਾਇਤਾ ਅਤੇ ਦਾਅਵੇ",
  },
};

// ─── 11. Urdu (ur) ────────────────────────────────────────────────────────────
const urMeta: ShippingMeta = {
  title: "سیلر ڈسپیچ اور لاجسٹکس پالیسی",
  headings: {
    s1: "1. ڈور سٹیپ پک اپ اور لاجسٹکس کوریج",
    s2: "2. ڈسپیچ SLA اور پک اپ شیڈولنگ",
    s3: "3. ہول سیل پیکیجنگ معیارات",
    s4: "4. شپنگ لیبل اور پک اپ مینی فیسٹ",
    s5: "5. GST ای وے بل کی تعمیل (> ₹50,000)",
    s6: "6. ریٹرن ٹو اوریجن (RTO) اور ٹرانزٹ نقصانات",
    s7: "7. گودام کے پتے کی تبدیلیاں",
    s8: "8. کوریئر پارٹنر کارکردگی اور معاوضہ",
    s9: "9. لاجسٹکس سپورٹ اور کلیمز",
  },
};

const en: Record<SellerShippingSectionKey, ShippingSectionContent> = {
  s1: [
    {
      kind: "p",
      text: "ANGA9 logistics partners provide daily doorstep pickups from registered merchant warehouses and factories across India. Pickups are scheduled automatically upon order confirmation in the Seller Dashboard or Seller App.",
    },
  ],
  s2: [
    {
      kind: "ul",
      items: [
        "**Standard Dispatch SLA:** Orders confirmed before 12:00 PM must be packed and ready for pickup the same business day. Orders confirmed after 12:00 PM must be handed over within 24–48 hours maximum.",
        "**Pickup Attempts:** Courier partners make up to 2 pickup attempts. If a pickup fails due to seller unavailability, a late dispatch penalty may apply.",
      ],
    },
  ],
  s3: [
    {
      kind: "p",
      text: "Wholesale apparel and bulk textile lots must be packaged securely to withstand interstate transit:",
    },
    {
      kind: "ul",
      items: [
        "Use 3-ply or 5-ply corrugated cardboard boxes or 60-micron tamper-evident polybags.",
        "Individual garments must be sealed in transparent inner polybags before bulk packing.",
        "Ensure packages are waterproofed and sealed with tamper-proof security tape.",
      ],
    },
  ],
  s4: [
    {
      kind: "ul",
      items: [
        "Sellers must generate and paste the official ANGA9 AWB Barcode Shipping Label on the top flat surface of each box.",
        "Always obtain an electronic or physical signature on the **Pickup Manifest Sheet** from the pickup executive as proof of handover.",
      ],
    },
  ],
  s5: [
    {
      kind: "p",
      text: "Under Indian GST regulations, for any single consignment with an invoice value exceeding ₹50,000 (inclusive of GST), the seller must generate an electronic **GST E-Way Bill** via the e-way bill portal and attach Part-A/Part-B copies to the outer parcel.",
    },
  ],
  s6: [
    {
      kind: "p",
      text: "If a buyer is unreachable or rejects delivery, the shipment is classified as Return to Origin (RTO). RTO shipments are returned directly to the seller's registered warehouse. Sellers must inspect RTO parcels within 48 hours and submit unboxing videos in case of transit damage to claim courier compensation.",
    },
  ],
  s7: [
    {
      kind: "p",
      text: "To modify a warehouse pickup address or add secondary pickup locations, submit updated address proof via the Seller Dashboard (Settings > Pickup Locations) at least 24 hours prior to new order dispatches.",
    },
  ],
  s8: [
    {
      kind: "p",
      text: "ANGA9 continuously monitors courier on-time delivery rates. If a shipment is lost in transit by the carrier, sellers receive full reimbursement based on the net invoice value minus platform commission.",
    },
  ],
  s9: [
    {
      kind: "p",
      text: "For missing pickups, transit delays, or damaged courier claims, contact our Seller Logistics Desk at [logistics@anga9.com](mailto:logistics@anga9.com) or raise a ticket via the Seller App within 48 hours.",
    },
  ],
};

const introBlock: ShippingSectionContent = [
  {
    kind: "p",
    text: "ANGA9 integrates with tier-1 Indian courier networks (Delhivery, Shiprocket, Bluedart, Shadowfax) to offer automated doorstep pickups and nationwide wholesale B2B fulfillment across 19,000+ pincodes. This policy details merchant dispatch requirements, packaging standards, and handover SLAs.",
  },
];

const METAS: Record<LangCode, ShippingMeta> = {
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

export function getSellerShippingMeta(lang: LangCode): ShippingMeta {
  return METAS[lang] || METAS.en;
}

export function getSellerShippingBody(lang: LangCode, section: "intro" | SellerShippingSectionKey): ShippingSectionContent {
  if (section === "intro") return introBlock;
  return en[section] || [];
}
