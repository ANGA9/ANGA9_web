import type { LangCode } from "@/lib/i18n";
import type { TermsSectionKey, TermsBodyNode } from "./termsBody";

export interface SellerTermsMeta {
  title: string;
  intro: string;
  headings: Record<TermsSectionKey, string>;
}

export const SELLER_TERMS_SECTION_KEYS: TermsSectionKey[] = [
  "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", "s11", "s12", "s13", "s14"
];

// ─── 1. English (en) ──────────────────────────────────────────────────────────
const enMeta: SellerTermsMeta = {
  title: "Seller Terms of Service & Merchant Agreement",
  intro: "This Seller Agreement (“Agreement”) governs your access to and use of the ANGA9 B2B Wholesale Marketplace, Seller Portal, and Mobile Applications as a registered merchant, manufacturer, or distributor (“Seller”, “Merchant”).",
  headings: {
    s1: "1. Seller Eligibility & KYC Verification",
    s2: "2. Product Catalog, Listings & Authenticity Warranty",
    s3: "3. Wholesale Minimum Order Quantities (MOQ) & Pricing",
    s4: "4. Order Fulfillment, Dispatch SLAs & Packaging",
    s5: "5. Logistics, Courier Handover & E-Way Bills",
    s6: "6. Platform Fees, Commissions & GST TCS",
    s7: "7. Payout Settlement Cycles & Bank Transfers",
    s8: "8. Return to Origin (RTO), Quality Disputes & Claims",
    s9: "9. Cancellation Policy & Out-of-Stock Penalties",
    s10: "10. Merchant Intellectual Property & Brand Rights",
    s11: "11. Prohibited Products & Anti-Counterfeit Policy",
    s12: "12. Store Suspension, De-listing & Termination",
    s13: "13. Limitation of Liability & Indemnity",
    s14: "14. Governing Law & Dispute Jurisdiction",
  },
};

// ─── 2. Malayalam (ml) ────────────────────────────────────────────────────────
const mlMeta: SellerTermsMeta = {
  title: "വിൽപ്പനക്കാരന്റെ സേവന നിബന്ധനകളും വ്യാപാരി കരാറും",
  intro: "രജിസ്റ്റർ ചെയ്ത വ്യാപാരി, നിർമ്മാതാവ് അല്ലെങ്കിൽ വിതരണക്കാരൻ എന്ന നിലയിൽ ANGA9 B2B മൊത്തവ്യാപാര മാർക്കറ്റ്പ്ലേസ്, സെല്ലർ പോർട്ടൽ, മൊബൈൽ ആപ്ലിക്കേഷൻ എന്നിവയിലേക്കുള്ള നിങ്ങളുടെ പ്രവേശനത്തെയും ഉപയോഗത്തെയും ഈ കരാർ നിയന്ത്രിക്കുന്നു.",
  headings: {
    s1: "1. വിൽപ്പനക്കാരന്റെ യോഗ്യതയും KYC സ്ഥിരീകരണവും",
    s2: "2. ഉൽപ്പന്ന കാറ്റലോഗും ആധികാരികത വാറന്റിയും",
    s3: "3. മൊത്തവ്യാപാര മിനിമം ഓർഡർ അളവും (MOQ) വിലനിർണ്ണയവും",
    s4: "4. ഓർഡർ ഡിസ്പാച്ച് SLA & പാക്കേജിംഗ് മാനദണ്ഡങ്ങൾ",
    s5: "5. ലോജിസ്റ്റിക്‌സ്, കൊറിയർ ഹാൻഡ്‌ഓവർ & ഇ-വേ ബിൽ",
    s6: "6. പ്ലാറ്റ്‌ഫോം കമ്മീഷനും GST TCS കിഴിവും",
    s7: "7. പേഔട്ട് സെറ്റിൽമെന്റ് ചക്രവും ബാങ്ക് ട്രാൻസ്ഫറുകളും",
    s8: "8. റിട്ടേൺ ടു ഒറിജിൻ (RTO), ക്വാളിറ്റി തർക്കങ്ങളും ക്ലെയിമുകളും",
    s9: "9. ഓർഡർ റദ്ദാക്കൽ നയവും പിഴകളും",
    s10: "10. ബൗദ്ധിക സ്വത്തവകാശവും ബ്രാൻഡ് ഉടമസ്ഥതയും",
    s11: "11. നിരോധിത ഉൽപ്പന്നങ്ങളും വ്യാജ വിരുദ്ധ നയവും",
    s12: "12. സ്റ്റോർ സസ്പെൻഷനും അക്കൗണ്ട് അവസാനിപ്പിക്കലും",
    s13: "13. ബാധ്യതയുടെ പരിമിതിയും നഷ്ടപരിഹാരവും",
    s14: "14. ബാധകമായ നിയമവും തർക്ക പരിഹാര അധികാരപരിധിയും",
  },
};

// ─── 3. Hindi (hi) ────────────────────────────────────────────────────────────
const hiMeta: SellerTermsMeta = {
  title: "विक्रेता सेवा शर्तें एवं मर्चेंट अनुबंध",
  intro: "यह विक्रेता अनुबंध (“अनुबंध”) ANGA9 B2B थोक बाज़ार और विक्रेता मोबाइल एप्लिकेशन पर एक पंजीकृत व्यापारी के रूप में आपकी बिक्री को नियंत्रित करता है।",
  headings: {
    s1: "1. विक्रेता पात्रता एवं KYC सत्यापन",
    s2: "2. उत्पाद कैटलॉग एवं प्रामाणिकता वारंटी",
    s3: "3. थोक न्यूनतम ऑर्डर मात्रा (MOQ) एवं मूल्य निर्धारण",
    s4: "4. ऑर्डर पूर्ति, प्रेषण SLA एवं पैकेजिंग",
    s5: "5. लॉजिस्टिक्स, कूरियर हैंडओवर एवं ई-वे बिल",
    s6: "6. प्लेटफ़ॉर्म शुल्क, कमीशन एवं GST TCS",
    s7: "7. भुगतान (Payout) चक्र एवं बैंक ट्रांसफर",
    s8: "8. वापसी (RTO), गुणवत्ता विवाद एवं दावे",
    s9: "9. रद्दीकरण नीति एवं स्टॉकआउट जुर्माना",
    s10: "10. बौद्धिक संपदा एवं ब्रांड अधिकार",
    s11: "11. प्रतिबंधित उत्पाद एवं नकली विरोधी नीति",
    s12: "12. स्टोर निलंबन एवं अनुबंध समाप्ति",
    s13: "13. देयता की सीमा एवं क्षतिपूर्ति",
    s14: "14. लागू कानून एवं विवाद क्षेत्राधिकार",
  },
};

// ─── 4. Tamil (ta) ────────────────────────────────────────────────────────────
const taMeta: SellerTermsMeta = {
  title: "விற்பனையாளர் சேவை விதிமுறைகள் & வணிகர் ஒப்பந்தம்",
  intro: "ANGA9 B2B மொத்த சந்தை, விற்பனையாளர் போர்டல் மற்றும் மொபைல் பயன்பாடுகளில் பதிவுசெய்யப்பட்ட வணிகராக உங்கள் அணுகல் மற்றும் பயன்பாட்டை இந்த ஒப்பந்தம் நிர்வகிக்கிறது.",
  headings: {
    s1: "1. விற்பனையாளர் தகுதி & KYC சரிபார்ப்பு",
    s2: "2. தயாரிப்பு பட்டியல் மற்றும் நம்பகத்தன்மை உத்தரவாதம்",
    s3: "3. மொத்த விற்பனை குறைந்தபட்ச ஆர்டர் அளவு (MOQ) & விலை",
    s4: "4. ஆர்டர் அனுப்புதல் SLA மற்றும் பேக்கேஜிங்",
    s5: "5. தளவாடங்கள், கூரியர் ஒப்படைப்பு & இ-வே பில்",
    s6: "6. இயங்குதள கட்டணம், கமிஷன் & GST TCS",
    s7: "7. பணம் செலுத்தும் சுழற்சிகள் மற்றும் வங்கி பரிமாற்றங்கள்",
    s8: "8. திரும்பப்பெறுதல் (RTO), தர தகராறுகள் & கோரிக்கைகள்",
    s9: "9. ரத்து செய்தல் கொள்கை மற்றும் அபராதங்கள்",
    s10: "10. வணிகர் அறிவுசார் சொத்து மற்றும் பிராண்ட் உரிமைகள்",
    s11: "11. தடைசெய்யப்பட்ட தயாரிப்புகள் & போலி எதிர்ப்பு கொள்கை",
    s12: "12. அங்காடி இடைநீக்கம் மற்றும் கணக்கு முடித்தல்",
    s13: "13. பொறுப்பு வரம்பு மற்றும் இழப்பீடு",
    s14: "14. ஆளும் சட்டம் மற்றும் அதிகார வரம்பு",
  },
};

// ─── 5. Telugu (te) ───────────────────────────────────────────────────────────
const teMeta: SellerTermsMeta = {
  title: "విక్రేత సేవా నిబంధనలు & మర్చంట్ ఒప్పందం",
  intro: "ANGA9 B2B టోకు మార్కెట్‌ప్లేస్, సెల్లర్ పోర్టల్ మరియు మొబైల్ యాప్‌లలో నమోదిత వ్యాపారిగా మీ వినియోగాన్ని ఈ ఒప్పందం నియంత్రిస్తుంది.",
  headings: {
    s1: "1. విక్రేత అర్హత & KYC ధృవీకరణ",
    s2: "2. ఉత్పత్తి కేటలాగ్ & ప్రామాణికత వారంటీ",
    s3: "3. కనీస ఆర్డర్ పరిమాణం (MOQ) & ధర నిర్ణయం",
    s4: "4. ఆర్డర్ డిస్పాచ్ SLA & ప్యాకేజింగ్ ప్రమాణాలు",
    s5: "5. లాజిస్టిక్స్, కొరియర్ హ్యాండ్‌ఓవర్ & ఇ-వే బిల్లులు",
    s6: "6. ప్లాట్‌ఫారమ్ ఫీజులు, కమీషన్ & GST TCS",
    s7: "7. చెల్లింపు సెటిల్మెంట్ సైకిల్స్ & బ్యాంక్ బదిలీలు",
    s8: "8. రిటర్న్ టు ఆరిజిన్ (RTO), నాణ్యత వివాదాలు & క్లెయిమ్‌లు",
    s9: "9. రద్దు విధానం & స్టాక్‌అవుట్ జరిమానాలు",
    s10: "10. వ్యాపారి మేధో సంపత్తి & బ్రాండ్ హక్కులు",
    s11: "11. నిషేధిత ఉత్పత్తులు & నకిలీల నిరోధక విధానం",
    s12: "12. స్టోర్ సస్పెన్షన్ & ఖాతా రద్దు",
    s13: "13. బాధ్యత పరిమితి & నష్టపరిహారం",
    s14: "14. వర్తించే చట్టం & న్యాయపరిధి",
  },
};

// ─── 6. Bengali (bn) ──────────────────────────────────────────────────────────
const bnMeta: SellerTermsMeta = {
  title: "বিক্রেতা পরিষেবার শর্তাবলী ও মার্চেন্ট চুক্তি",
  intro: "এই বিক্রেতা চুক্তিটি ANGA9 B2B পাইকারি মার্কেটপ্লেস এবং বিক্রেতা মোবাইল অ্যাপ্লিকেশনে একজন নিবন্ধিত ব্যবসায়ী হিসেবে আপনার বিক্রয় পরিচালনা করে।",
  headings: {
    s1: "১. বিক্রেতার যোগ্যতা ও KYC যাচাইকরণ",
    s2: "২. পণ্য ক্যাটালগ এবং সত্যতার নিশ্চয়তা",
    s3: "৩. পাইকারি ন্যূনতম অর্ডার পরিমাণ (MOQ) ও মূল্য নির্ধারণ",
    s4: "৪. অর্ডার পূরণ, প্রেরণ SLA এবং প্যাকেজিং",
    s5: "৫. লজিস্টিকস, কুরিয়ার হস্তান্তর ও ই-ওয়ে বিল",
    s6: "৬. প্ল্যাটফর্ম ফি, কমিশন এবং GST TCS",
    s7: "৭. পেআউট নিষ্পত্তির সময়কাল ও ব্যাংক স্থানান্তর",
    s8: "৮. রিটার্ন টু অরিজিন (RTO), গুণমান বিরোধ ও দাবি",
    s9: "৯. বাতিলকরণ নীতি এবং জরিমানা",
    s10: "১০. বৌদ্ধিক সম্পত্তি ও ব্র্যান্ড অধিকার",
    s11: "১১. নিষিদ্ধ পণ্য ও নকল বিরোধী নীতি",
    s12: "১২. স্টোর স্থগিতকরণ ও চুক্তি সমাপ্তি",
    s13: "১৩. দায়বদ্ধতার সীমাবদ্ধতা ও ক্ষতিপূরণ",
    s14: "১৪. প্রযোজ্য আইন ও বিরোধের বিচারব্যবস্থা",
  },
};

// ─── 7. Marathi (mr) ──────────────────────────────────────────────────────────
const mrMeta: SellerTermsMeta = {
  title: "विक्रेता सेवा अटी आणि व्यापारी करार",
  intro: "हा व्यापारी करार ANGA9 B2B घाऊक बाजारपेठ आणि विक्रेता अ‍ॅपवर नोंदणीकृत विक्रेता म्हणून तुमच्या वापराचे नियमन करतो.",
  headings: {
    s1: "१. विक्रेता पात्रता आणि KYC पडताळणी",
    s2: "२. उत्पादन कॅटलॉग आणि अस्सलपणाची हमी",
    s3: "३. घाऊक किमान ऑर्डर प्रमाण (MOQ) आणि किंमत",
    s4: "४. ऑर्डर पूर्तता, डिस्पॅच SLA आणि पॅकेजिंग",
    s5: "५. लॉजिस्टिक्स, कुरिअर हस्तांतरण आणि ई-वे बिले",
    s6: "६. प्लॅटफॉर्म शुल्क, कमिशन आणि GST TCS",
    s7: "७. पेआउट सेटलमेंट सायकल आणि बँक ट्रान्सफर",
    s8: "८. रिटर्न टू ओरिजिन (RTO), गुणवत्ता विवाद आणि दावे",
    s9: "९. रद्द करण्याचे धोरण आणि दंड",
    s10: "१०. व्यापारी बौद्धिक संपदा आणि ब्रँड हक्क",
    s11: "११. प्रतिबंधित उत्पादने आणि बनावट विरोधी धोरण",
    s12: "१२. स्टोअर निलंबन आणि खाते समाप्ती",
    s13: "१३. दायित्वाची मर्यादा आणि नुकसानभरपाई",
    s14: "१४. लागू कायदा आणि विवाद कार्यक्षेत्र",
  },
};

// ─── 8. Kannada (kn) ──────────────────────────────────────────────────────────
const knMeta: SellerTermsMeta = {
  title: "ಮಾರಾಟಗಾರರ ಸೇವಾ ನಿಯಮಗಳು & ವ್ಯಾಪಾರಿ ಒಪ್ಪಂದ",
  intro: "ಈ ವ್ಯಾಪಾರಿ ಒಪ್ಪಂದವು ANGA9 B2B ಸಗಟು ಮಾರುಕಟ್ಟೆ ಮತ್ತು ಮಾರಾಟಗಾರರ ಅಪ್ಲಿಕೇಶನ್‌ನಲ್ಲಿ ನೋಂದಾಯಿತ ವ್ಯಾಪಾರಿಯಾಗಿ ನಿಮ್ಮ ಬಳಕೆಯನ್ನು ನಿಯಂತ್ರಿಸುತ್ತದೆ.",
  headings: {
    s1: "1. ಮಾರಾಟಗಾರರ ಅರ್ಹತೆ & KYC ಪರಿಶೀಲನೆ",
    s2: "2. ಉತ್ಪನ್ನ ಕ್ಯಾಟಲಾಗ್ & ದೃಢೀಕರಣ ಖಾತರಿ",
    s3: "3. ಸಗಟು ಕನಿಷ್ಠ ಆರ್ಡರ್ ಪ್ರಮಾಣ (MOQ) & ಬೆಲೆ ನಿಗದಿ",
    s4: "4. ಆರ್ಡರ್ ರವಾನೆ SLA & ಪ್ಯಾಕೇಜಿಂಗ್ ಮಾನದಂಡಗಳು",
    s5: "5. ಲಾಜಿಸ್ಟಿಕ್ಸ್, ಕೊರಿಯರ್ ಹಸ್ತಾಂತರ & ಇ-ವೇ ಬಿಲ್ಲುಗಳು",
    s6: "6. ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಶುಲ್ಕಗಳು, ಕಮಿಷನ್ & GST TCS",
    s7: "7. ಪಾವತಿ ಇತ್ಯರ್ಥ ಚಕ್ರಗಳು & ಬ್ಯಾಂಕ್ ವರ್ಗಾವಣೆಗಳು",
    s8: "8. ರಿಟರ್ನ್ ಟು ಆರಿಜಿನ್ (RTO), ಗುಣಮಟ್ಟದ ವಿವಾದಗಳು & ಕ್ಲೈಮ್‌ಗಳು",
    s9: "9. ರದ್ದತಿ ನೀತಿ & ಸ್ಟಾಕ್ ಕೊರತೆ ದಂಡಗಳು",
    s10: "10. ವ್ಯಾಪಾರಿ ಬೌದ್ಧಿಕ ಆಸ್ತಿ & ಬ್ರ್ಯಾಂಡ್ ಹಕ್ಕುಗಳು",
    s11: "11. ನಿಷೇಧಿತ ಉತ್ಪನ್ನಗಳು & ನಕಲಿ ವಿರೋಧಿ ನೀತಿ",
    s12: "12. ಅಂಗಡಿ ಅಮಾನತು & ಖಾತೆ ರದ್ದತಿ",
    s13: "13. ಹೊಣೆಗಾರಿಕೆಯ ಮಿತಿ & ಪರಿಹಾರ",
    s14: "14. ಅನ್ವಯವಾಗುವ ಕಾನೂನು & ನ್ಯಾಯವ್ಯಾಪ್ತಿ",
  },
};

// ─── 9. Gujarati (gu) ─────────────────────────────────────────────────────────
const guMeta: SellerTermsMeta = {
  title: "વિક્રેતા સેવા શરતો અને વેપારી કરાર",
  intro: "આ વેપારી કરાર ANGA9 B2B જથ્થાબંધ બજાર અને વિક્રેતા એપ્લિકેશન પર નોંધાયેલા વેપારી તરીકે તમારા ઉપયોગને નિયંત્રિત કરે છે.",
  headings: {
    s1: "1. વિક્રેતા પાત્રતા અને KYC ચકાસણી",
    s2: "2. પ્રોડક્ટ કેટલોગ અને અધિકૃતતાની વોરંટી",
    s3: "3. જથ્થાબંધ ન્યૂનતમ ઓર્ડર જથ્થો (MOQ) અને કિંમત",
    s4: "4. ઓર્ડર પરિપૂર્ણતા, ડિસ્પેચ SLA અને પેકેજિંગ",
    s5: "5. લોજિસ્ટિક્સ, કુરિયર હેન્ડઓવર અને ઈ-વે બિલ",
    s6: "6. પ્લેટફોર્મ ફી, કમિશન અને GST TCS",
    s7: "7. પેઆઉટ સેટલમેન્ટ સાયકલ અને બેંક ટ્રાન્સફર",
    s8: "8. રિટર્ન ટુ ઓરિજિન (RTO), ગુણવત્તા વિવાદો અને દાવા",
    s9: "9. રદ કરવાની નીતિ અને પેનલ્ટી",
    s10: "10. વેપારી બૌદ્ધિક સંપત્તિ અને બ્રાન્ડ અધિકારો",
    s11: "11. પ્રતિબંધિત ઉત્પાદનો અને નકલી વિરોધી નીતિ",
    s12: "12. સ્ટોર સસ્પેન્શન અને ખાતું બંધ કરવું",
    s13: "13. જવાબદારીની મર્યાદા અને વળતર",
    s14: "14. લાગુ કાયદો અને અધિકારક્ષેત્ર",
  },
};

// ─── 10. Punjabi (pa) ─────────────────────────────────────────────────────────
const paMeta: SellerTermsMeta = {
  title: "ਵਿਕਰੇਤਾ ਸੇਵਾ ਦੀਆਂ ਸ਼ਰਤਾਂ ਅਤੇ ਵਪਾਰੀ ਸਮਝੌਤਾ",
  intro: "ਇਹ ਵਪਾਰੀ ਸਮਝੌਤਾ ANGA9 B2B ਥੋਕ ਬਾਜ਼ਾਰ ਅਤੇ ਵਿਕਰੇਤਾ ਐਪ 'ਤੇ ਰਜਿਸਟਰਡ ਵਪਾਰੀ ਵਜੋਂ ਤੁਹਾਡੀ ਵਰਤੋਂ ਨੂੰ ਨਿਯੰਤਰਿਤ ਕਰਦਾ ਹੈ।",
  headings: {
    s1: "1. ਵਿਕਰੇਤਾ ਦੀ ਯੋਗਤਾ ਅਤੇ KYC ਪੁਸ਼ਟੀਕਰਨ",
    s2: "2. ਉਤਪਾਦ ਕੈਟਾਲਾਗ ਅਤੇ ਅਸਲੀਅਤ ਦੀ ਵਾਰੰਟੀ",
    s3: "3. ਥੋਕ ਘੱਟੋ-ਘੱਟ ਆਰਡਰ ਮਾਤਰਾ (MOQ) ਅਤੇ ਕੀਮਤ",
    s4: "4. ਆਰਡਰ ਪੂਰਤੀ, ਡਿਸਪੈਚ SLA ਅਤੇ ਪੈਕੇਜਿੰਗ",
    s5: "5. ਲੌਜਿਸਟਿਕਸ, ਕੋਰੀਅਰ ਹੈਂਡਓਵਰ ਅਤੇ ਈ-ਵੇਅ ਬਿੱਲ",
    s6: "6. ਪਲੇਟਫਾਰਮ ਫੀਸ, ਕਮਿਸ਼ਨ ਅਤੇ GST TCS",
    s7: "7. ਭੁਗਤਾਨ ਨਿਪਟਾਰਾ ਚੱਕਰ ਅਤੇ ਬੈਂਕ ਟ੍ਰਾਂਸਫਰ",
    s8: "8. ਰਿਟਰਨ ਟੂ ਓਰੀਜਿਨ (RTO), ਗੁਣਵੱਤਾ ਵਿਵਾਦ ਅਤੇ ਦਾਅਵੇ",
    s9: "9. ਰੱਦ ਕਰਨ ਦੀ ਨੀਤੀ ਅਤੇ ਜੁਰਮਾਨੇ",
    s10: "10. ਵਪਾਰੀ ਬੌਧਿਕ ਸੰਪਤੀ ਅਤੇ ਬ੍ਰਾਂਡ ਅਧਿਕਾਰ",
    s11: "11. ਵਰਜਿਤ ਉਤਪਾਦ ਅਤੇ ਨਕਲੀ ਵਿਰੋਧੀ ਨੀਤੀ",
    s12: "12. ਸਟੋਰ ਮੁਅੱਤਲੀ ਅਤੇ ਖਾਤਾ ਸਮਾਪਤੀ",
    s13: "13. ਦੇਣਦਾਰੀ ਦੀ ਸੀਮਾ ਅਤੇ ਮੁਆਵਜ਼ਾ",
    s14: "14. ਲਾਗੂ ਕਾਨੂੰਨ ਅਤੇ ਅਧਿਕਾਰ ਖੇਤਰ",
  },
};

// ─── 11. Urdu (ur) ────────────────────────────────────────────────────────────
const urMeta: SellerTermsMeta = {
  title: "سیلر سروس کی شرائط اور مرچنٹ معاہدہ",
  intro: "یہ مرچنٹ معاہدہ ANGA9 B2B ہول سیل مارکیٹ پلیس اور سیلر ایپ پر بطور رجسٹرڈ تاجر آپ کے استعمال کو منظم کرتا ہے۔",
  headings: {
    s1: "1. سیلر کی اہلیت اور KYC تصدیق",
    s2: "2. پروڈکٹ کیٹلاگ اور اصلیت کی ضمانت",
    s3: "3. ہول سیل کم از کم آرڈر کی مقدار (MOQ) اور قیمت",
    s4: "4. آرڈر ڈسپیچ SLA اور پیکیجنگ معیارات",
    s5: "5. لاجسٹکس، کوریئر ہینڈ اوور اور ای وے بل",
    s6: "6. پلیٹ فارم فیس، کمیشن اور GST TCS",
    s7: "7. ادائیگی تصفیہ کے چکر اور بینک ٹرانسفر",
    s8: "8. ریٹرن ٹو اوریجن (RTO)، معیار کے تنازعات اور کلیمز",
    s9: "9. منسوخی کی پالیسی اور جرمانے",
    s10: "10. تاجر کی دانشورانہ ملکیت اور برانڈ کے حقوق",
    s11: "11. ممنوعہ مصنوعات اور انسداد جعلی پالیسی",
    s12: "12. اسٹور معطلی اور اکاؤنٹ کا خاتمہ",
    s13: "13. ذمہ داری کی حد اور معاوضہ",
    s14: "14. لاگو قانون اور دائرہ اختیار",
  },
};

const enBodies: Record<TermsSectionKey, TermsBodyNode> = {
  s1: {
    paragraphs: [
      "To register and sell on ANGA9, you must be a legally recognized commercial entity operating in India with a valid GSTIN, PAN, and active business bank account.",
      "All sellers must successfully complete the ANGA9 Seller KYC process by providing valid shop/warehouse photographs and business proofs before listings go live.",
    ],
  },
  s2: {
    paragraphs: [
      "Sellers warrant that all listed wholesale garments, textiles, and merchandise are 100% genuine, new, and compliant with Indian consumer safety and labeling standards.",
      "Counterfeit goods, unauthorized brand replicas, and misleading product descriptions are strictly prohibited and result in immediate permanent store ban.",
    ],
  },
  s3: {
    paragraphs: [
      "All prices listed on the ANGA9 wholesale platform must be inclusive of all applicable Goods and Services Tax (GST).",
      "Sellers have complete freedom to define tiered wholesale lot pricing, bulk volume discounts, and Minimum Order Quantities (MOQs).",
    ],
  },
  s4: {
    paragraphs: [
      "Sellers must accept or reject incoming wholesale orders within 24 hours of placement.",
      "Orders must be packed using industry-standard B2B wholesale packaging with tamper-evident tape and generated ANGA9 barcode shipping labels attached.",
      "Standard dispatch handover to our designated courier partner must occur within the agreed dispatch SLA (maximum 48 hours from order confirmation).",
    ],
  },
  s5: {
    paragraphs: [
      "Doorstep logistics pickup is coordinated through ANGA9 integrated courier partners.",
      "Sellers must hand over packages only upon scanning and receiving an official digital pickup manifest confirmation from the logistics agent.",
      "For consignments exceeding ₹50,000 in value, sellers must generate and attach mandatory GST e-way bills.",
    ],
  },
  s6: {
    paragraphs: [
      "ANGA9 charges a competitive flat platform commission fee on successful wholesale deliveries.",
      "Under Section 52 of the Central Goods and Services Tax (CGST) Act, ANGA9 deducts 1% Tax Collection at Source (TCS) on net taxable supplies, which is directly credited to your GST portal.",
    ],
  },
  s7: {
    paragraphs: [
      "Payouts for delivered wholesale orders are automatically calculated and disbursed to your registered bank account on a T+2 business day cycle following order delivery.",
      "Detailed settlement sheets, commission invoices, and GST credit ledgers are downloadable anytime from your Seller Dashboard.",
    ],
  },
  s8: {
    paragraphs: [
      "Wholesale buyers can raise return requests within 48 hours of delivery only for defective, damaged, or mismatched bulk lots.",
      "Sellers are provided 72 hours to inspect returned consignments. In case of fraudulent buyer claims, sellers can submit video unboxing evidence for ANGA9 dispute arbitration.",
    ],
  },
  s9: {
    paragraphs: [
      "Seller-initiated order cancellations due to stockouts damage marketplace reliability and incur a standard service penalty fee.",
      "Repeated out-of-stock cancellations will lead to temporary de-ranking or listing deactivation.",
    ],
  },
  s10: {
    paragraphs: [
      "Sellers retain full intellectual property ownership of their brand logos, trademark names, and proprietary catalog imagery.",
      "By listing on ANGA9, sellers grant ANGA9 a non-exclusive license to display product images across our marketplace and promotional channels.",
    ],
  },
  s11: {
    paragraphs: [
      "Selling stolen, infringing, counterfeit, expired, or hazardous goods is strictly banned.",
      "ANGA9 cooperates fully with brand owners and law enforcement agencies for trademark infringement inquiries.",
    ],
  },
  s12: {
    paragraphs: [
      "ANGA9 reserves the right to suspend or permanently terminate seller accounts involved in fraudulent activities, repeated SLA failures, or non-compliance with Indian laws.",
      "Sellers may close their store anytime upon fulfilling all active pending orders and settling outstanding accounts.",
    ],
  },
  s13: {
    paragraphs: [
      "Sellers agree to indemnify and hold harmless ANGA9, its directors, and affiliates against any third-party claims arising from product defects, tax defaults, or IP infringements.",
    ],
  },
  s14: {
    paragraphs: [
      "This Agreement is governed by the laws of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the courts in Bengaluru, Karnataka.",
    ],
  },
};

const METAS: Record<LangCode, SellerTermsMeta> = {
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

export function getSellerTermsMeta(lang: LangCode): SellerTermsMeta {
  return METAS[lang] || METAS.en;
}

export function getSellerTermsBody(lang: LangCode, key: TermsSectionKey): TermsBodyNode {
  return enBodies[key] || { paragraphs: [] };
}
