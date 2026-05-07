import type { LangCode } from "@/lib/i18n";

export type PrivacySectionKey =
  | "intro" | "s1" | "s2" | "s3" | "s4" | "s5" | "s6" | "s7" | "s8" | "s9" | "s10";

export type PrivacyBlock =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "h3"; text: string };

export type PrivacySectionContent = PrivacyBlock[];

export type PrivacyBodyDict = Partial<
  Record<LangCode, Record<PrivacySectionKey, PrivacySectionContent>>
>;

export interface PrivacyHeadings {
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

export interface PrivacyMeta {
  title: string;
  headings: PrivacyHeadings;
}

const enMeta: PrivacyMeta = {
  title: "Privacy Policy",
  headings: {
    s1: "1. Information We Collect",
    s2: "2. How We Use Your Information",
    s3: "3. How We Share Your Information",
    s4: "4. Cookies & Tracking",
    s5: "5. Data Retention",
    s6: "6. Your Rights",
    s7: "7. Data Security",
    s8: "8. Children's Privacy",
    s9: "9. Changes to this Policy",
    s10: "10. Contact",
  },
};

const en: Record<PrivacySectionKey, PrivacySectionContent> = {
  intro: [
    {
      kind: "p",
      text: "ANGA9 (\u201cwe\u201d, \u201cus\u201d, \u201cour\u201d) respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy explains what we collect, how we use it, and the choices you have.",
    },
  ],
  s1: [
    { kind: "h3", text: "Information you provide" },
    {
      kind: "ul",
      items: [
        "Account details: name, phone number, email, GST number (for sellers).",
        "Business details: company name, address, bank details (for sellers).",
        "Order details: shipping address, contact information, payment information.",
        "Communications: messages you send to support or sellers.",
      ],
    },
    { kind: "h3", text: "Information collected automatically" },
    {
      kind: "ul",
      items: [
        "Device & browser data (IP address, device type, OS, browser version).",
        "Usage data (pages viewed, products clicked, time on site).",
        "Approximate location based on IP or, with your consent, precise location.",
        "Cookies and similar tracking technologies.",
      ],
    },
  ],
  s2: [
    {
      kind: "ul",
      items: [
        "To create and manage your ANGA9 account.",
        "To process orders, payments, shipments, returns, and refunds.",
        "To personalize product recommendations and search results.",
        "To communicate with you about orders, offers, and updates.",
        "To detect, prevent, and address fraud, abuse, or security issues.",
        "To comply with legal obligations under Indian law.",
      ],
    },
  ],
  s3: [
    { kind: "p", text: "We share information only as needed to operate the Platform:" },
    {
      kind: "ul",
      items: [
        "**Sellers:** for order fulfillment, your shipping details are shared with the seller and their logistics partner.",
        "**Service providers:** payment gateways, logistics, analytics, customer support tools — bound by confidentiality obligations.",
        "**Legal authorities:** when required by law, court order, or to protect our rights and safety.",
        "**Business transfers:** in the event of a merger, acquisition, or asset sale.",
      ],
    },
    {
      kind: "p",
      text: "We do **not** sell your personal information to third-party advertisers.",
    },
  ],
  s4: [
    {
      kind: "p",
      text: "We use cookies for authentication, session management, analytics, and personalization. You can disable cookies in your browser settings, but parts of the Platform may not function properly.",
    },
  ],
  s5: [
    {
      kind: "p",
      text: "We retain your personal data for as long as your account is active and for a reasonable period afterward to comply with legal, tax, and accounting obligations under Indian law.",
    },
  ],
  s6: [
    { kind: "p", text: "You have the right to:" },
    {
      kind: "ul",
      items: [
        "Access and review the personal information we hold about you.",
        "Request correction of inaccurate information.",
        "Request deletion of your account and personal data, subject to legal limits.",
        "Opt out of marketing communications at any time.",
      ],
    },
    {
      kind: "p",
      text: "To exercise these rights, email us at [support@anga9.com](mailto:support@anga9.com).",
    },
  ],
  s7: [
    {
      kind: "p",
      text: "We use industry-standard security measures (HTTPS encryption, access controls, secure cloud infrastructure) to protect your data. However, no system is completely secure, and we cannot guarantee absolute security.",
    },
  ],
  s8: [
    {
      kind: "p",
      text: "ANGA9 is not intended for users under 18. We do not knowingly collect personal information from children. If you believe we have, please contact us and we will delete it.",
    },
  ],
  s9: [
    {
      kind: "p",
      text: "We may update this Privacy Policy occasionally. The \u201cLast updated\u201d date reflects the latest version. Material changes will be communicated via the Platform or email.",
    },
  ],
  s10: [
    {
      kind: "p",
      text: "Privacy questions or requests: [support@anga9.com](mailto:support@anga9.com).",
    },
  ],
};

const hiMeta: PrivacyMeta = {
  title: "गोपनीयता नीति",
  headings: {
    s1: "1. हम कौन सी जानकारी एकत्र करते हैं",
    s2: "2. हम आपकी जानकारी का उपयोग कैसे करते हैं",
    s3: "3. हम आपकी जानकारी कैसे साझा करते हैं",
    s4: "4. कुकीज़ और ट्रैकिंग",
    s5: "5. डेटा संरक्षण",
    s6: "6. आपके अधिकार",
    s7: "7. डेटा सुरक्षा",
    s8: "8. बच्चों की गोपनीयता",
    s9: "9. इस नीति में परिवर्तन",
    s10: "10. संपर्क",
  },
};

const hi: Record<PrivacySectionKey, PrivacySectionContent> = {
  intro: [
    {
      kind: "p",
      text: "ANGA9 (\u201cहम\u201d, \u201cहमारा\u201d) आपकी गोपनीयता का सम्मान करता है और आपके द्वारा हमारे साथ साझा की गई व्यक्तिगत जानकारी की सुरक्षा के लिए प्रतिबद्ध है। यह गोपनीयता नीति बताती है कि हम क्या एकत्र करते हैं, हम इसका उपयोग कैसे करते हैं, और आपके पास क्या विकल्प हैं।",
    },
  ],
  s1: [
    { kind: "h3", text: "आपके द्वारा प्रदान की गई जानकारी" },
    {
      kind: "ul",
      items: [
        "खाता विवरण: नाम, फ़ोन नंबर, ईमेल, GST नंबर (विक्रेताओं के लिए)।",
        "व्यवसाय विवरण: कंपनी का नाम, पता, बैंक विवरण (विक्रेताओं के लिए)।",
        "ऑर्डर विवरण: शिपिंग पता, संपर्क जानकारी, भुगतान जानकारी।",
        "संचार: सहायता या विक्रेताओं को भेजे गए संदेश।",
      ],
    },
    { kind: "h3", text: "स्वचालित रूप से एकत्र की गई जानकारी" },
    {
      kind: "ul",
      items: [
        "डिवाइस और ब्राउज़र डेटा (IP पता, डिवाइस प्रकार, OS, ब्राउज़र संस्करण)।",
        "उपयोग डेटा (देखे गए पृष्ठ, क्लिक किए गए उत्पाद, साइट पर समय)।",
        "IP के आधार पर अनुमानित स्थान या, आपकी सहमति से, सटीक स्थान।",
        "कुकीज़ और समान ट्रैकिंग तकनीकें।",
      ],
    },
  ],
  s2: [
    {
      kind: "ul",
      items: [
        "आपके ANGA9 खाते को बनाने और प्रबंधित करने के लिए।",
        "ऑर्डर, भुगतान, शिपमेंट, रिटर्न और रिफंड को संसाधित करने के लिए।",
        "उत्पाद अनुशंसाओं और खोज परिणामों को वैयक्तिकृत करने के लिए।",
        "आपको ऑर्डर, ऑफ़र और अपडेट के बारे में सूचित करने के लिए।",
        "धोखाधड़ी, दुरुपयोग या सुरक्षा समस्याओं का पता लगाने, रोकने और संबोधित करने के लिए।",
        "भारतीय कानून के तहत कानूनी दायित्वों का पालन करने के लिए।",
      ],
    },
  ],
  s3: [
    { kind: "p", text: "हम केवल प्लेटफ़ॉर्म के संचालन के लिए आवश्यक जानकारी साझा करते हैं:" },
    {
      kind: "ul",
      items: [
        "**विक्रेता:** ऑर्डर पूर्ति के लिए, आपके शिपिंग विवरण विक्रेता और उनके लॉजिस्टिक्स पार्टनर के साथ साझा किए जाते हैं।",
        "**सेवा प्रदाता:** भुगतान गेटवे, लॉजिस्टिक्स, एनालिटिक्स, ग्राहक सहायता उपकरण — गोपनीयता दायित्वों से बंधे हुए।",
        "**कानूनी प्राधिकरण:** जब कानून, अदालत के आदेश या हमारे अधिकारों और सुरक्षा की रक्षा के लिए आवश्यक हो।",
        "**व्यावसायिक हस्तांतरण:** विलय, अधिग्रहण या परिसंपत्ति बिक्री की स्थिति में।",
      ],
    },
    {
      kind: "p",
      text: "हम आपकी व्यक्तिगत जानकारी को तीसरे पक्ष के विज्ञापनदाताओं को **नहीं** बेचते हैं।",
    },
  ],
  s4: [
    {
      kind: "p",
      text: "हम प्रमाणीकरण, सत्र प्रबंधन, एनालिटिक्स और वैयक्तिकरण के लिए कुकीज़ का उपयोग करते हैं। आप अपनी ब्राउज़र सेटिंग्स में कुकीज़ को अक्षम कर सकते हैं, लेकिन प्लेटफ़ॉर्म के कुछ हिस्से ठीक से काम नहीं कर सकते हैं।",
    },
  ],
  s5: [
    {
      kind: "p",
      text: "हम आपके व्यक्तिगत डेटा को तब तक बनाए रखते हैं जब तक आपका खाता सक्रिय है और उसके बाद उचित अवधि तक भारतीय कानून के तहत कानूनी, कर और लेखा दायित्वों का पालन करने के लिए।",
    },
  ],
  s6: [
    { kind: "p", text: "आपको यह अधिकार है:" },
    {
      kind: "ul",
      items: [
        "हमारे पास आपकी व्यक्तिगत जानकारी तक पहुँचने और समीक्षा करने का।",
        "गलत जानकारी के सुधार का अनुरोध करने का।",
        "कानूनी सीमाओं के अधीन, अपने खाते और व्यक्तिगत डेटा को हटाने का अनुरोध करने का।",
        "किसी भी समय मार्केटिंग संचार से बाहर निकलने का।",
      ],
    },
    {
      kind: "p",
      text: "इन अधिकारों का प्रयोग करने के लिए, हमें [support@anga9.com](mailto:support@anga9.com) पर ईमेल करें।",
    },
  ],
  s7: [
    {
      kind: "p",
      text: "हम आपके डेटा की सुरक्षा के लिए उद्योग-मानक सुरक्षा उपायों (HTTPS एन्क्रिप्शन, एक्सेस नियंत्रण, सुरक्षित क्लाउड अवसंरचना) का उपयोग करते हैं। हालाँकि, कोई भी सिस्टम पूरी तरह से सुरक्षित नहीं है, और हम पूर्ण सुरक्षा की गारंटी नहीं दे सकते।",
    },
  ],
  s8: [
    {
      kind: "p",
      text: "ANGA9 18 वर्ष से कम आयु के उपयोगकर्ताओं के लिए नहीं है। हम जानबूझकर बच्चों से व्यक्तिगत जानकारी एकत्र नहीं करते हैं। यदि आपको लगता है कि हमने ऐसा किया है, तो कृपया हमसे संपर्क करें और हम इसे हटा देंगे।",
    },
  ],
  s9: [
    {
      kind: "p",
      text: "हम कभी-कभी इस गोपनीयता नीति को अपडेट कर सकते हैं। \u201cअंतिम अद्यतन\u201d तिथि नवीनतम संस्करण को दर्शाती है। महत्वपूर्ण परिवर्तनों को प्लेटफ़ॉर्म या ईमेल के माध्यम से सूचित किया जाएगा।",
    },
  ],
  s10: [
    {
      kind: "p",
      text: "गोपनीयता प्रश्न या अनुरोध: [support@anga9.com](mailto:support@anga9.com)।",
    },
  ],
};

const meta: Partial<Record<LangCode, PrivacyMeta>> = { en: enMeta, hi: hiMeta };
const dict: PrivacyBodyDict = { en, hi };

export const PRIVACY_SECTION_KEYS: Exclude<PrivacySectionKey, "intro">[] = [
  "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10",
];

export function getPrivacyBody(
  lang: LangCode,
  key: PrivacySectionKey,
): PrivacySectionContent {
  return dict[lang]?.[key] ?? dict.en![key];
}

export function getPrivacyMeta(lang: LangCode): PrivacyMeta {
  return meta[lang] ?? meta.en!;
}
