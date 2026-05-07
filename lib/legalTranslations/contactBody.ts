import type { LangCode } from "@/lib/i18n";

export interface ContactT {
  title: string;
  intro: string;

  hero: {
    title: string;
    desc: string;
    ctaEmail: string;
    hours: string;
  };

  channels: {
    seller: { title: string; desc: string; linkLabel: string };
    business: { title: string; desc: string };
    press: { title: string; desc: string };
  };

  grievance: {
    heading: string;
    intro: string;
    nameLabel: string;
    nameValue: string;
    emailLabel: string;
    hoursLabel: string;
    hoursValue: string;
  };

  office: {
    heading: string;
    line1: string;
    line2: string;
  };

  faqLine: string;
}

const en: ContactT = {
  title: "Contact Us",
  intro:
    "We\u2019re here to help. Whether you have a question about an order, want to sell on ANGA9, or have a partnership idea \u2014 pick the channel that fits and we\u2019ll get back to you.",
  hero: {
    title: "Customer Support",
    desc: "Order tracking, payments, shipping, refunds \u2014 we\u2019ve got you.",
    ctaEmail: "support@anga9.com",
    hours: "Mon \u2013 Sat, 10:00 AM \u2013 7:00 PM IST",
  },
  channels: {
    seller: {
      title: "Seller Support",
      desc: "Onboarding, listings, payouts, or growth queries",
      linkLabel: "seller.anga9.com",
    },
    business: {
      title: "Business & Partnerships",
      desc: "Logistics, brand collaborations, bulk procurement",
    },
    press: {
      title: "Press & Media",
      desc: "Press inquiries, interviews, company info",
    },
  },
  grievance: {
    heading: "Grievance Officer",
    intro:
      "In accordance with the Information Technology Act, 2000 and Consumer Protection (E-Commerce) Rules, 2020, the contact details of the Grievance Officer are:",
    nameLabel: "Name:",
    nameValue: "Sumit Shaw",
    emailLabel: "Email:",
    hoursLabel: "Hours:",
    hoursValue: "Mon\u2013Fri, 10:00 AM \u2013 6:00 PM IST",
  },
  office: {
    heading: "Registered Office",
    line1: "ANGA9",
    line2: "New Delhi, India",
  },
  faqLine:
    "Before reaching out, you might find your answer faster on our [FAQ page](/faq).",
};

const hi: ContactT = {
  title: "हमसे संपर्क करें",
  intro:
    "हम यहाँ मदद के लिए हैं। चाहे आपका ऑर्डर के बारे में कोई सवाल हो, ANGA9 पर बेचना हो, या कोई साझेदारी का विचार हो \u2014 उचित चैनल चुनें और हम आपसे जल्द संपर्क करेंगे।",
  hero: {
    title: "ग्राहक सहायता",
    desc: "ऑर्डर ट्रैकिंग, भुगतान, शिपिंग, रिफंड \u2014 हम आपकी मदद करेंगे।",
    ctaEmail: "support@anga9.com",
    hours: "सोम \u2013 शनि, सुबह 10:00 \u2013 शाम 7:00 IST",
  },
  channels: {
    seller: {
      title: "विक्रेता सहायता",
      desc: "ऑनबोर्डिंग, लिस्टिंग, भुगतान, या विकास संबंधी प्रश्न",
      linkLabel: "seller.anga9.com",
    },
    business: {
      title: "व्यवसाय और साझेदारी",
      desc: "लॉजिस्टिक्स, ब्रांड सहयोग, थोक खरीद",
    },
    press: {
      title: "प्रेस और मीडिया",
      desc: "प्रेस पूछताछ, साक्षात्कार, कंपनी जानकारी",
    },
  },
  grievance: {
    heading: "शिकायत अधिकारी",
    intro:
      "सूचना प्रौद्योगिकी अधिनियम, 2000 और उपभोक्ता संरक्षण (ई-कॉमर्स) नियम, 2020 के अनुसार, शिकायत अधिकारी के संपर्क विवरण निम्नलिखित हैं:",
    nameLabel: "नाम:",
    nameValue: "Sumit Shaw",
    emailLabel: "ईमेल:",
    hoursLabel: "समय:",
    hoursValue: "सोम\u2013शुक्र, सुबह 10:00 \u2013 शाम 6:00 IST",
  },
  office: {
    heading: "पंजीकृत कार्यालय",
    line1: "ANGA9",
    line2: "नई दिल्ली, भारत",
  },
  faqLine:
    "संपर्क करने से पहले, आप हमारे [FAQ पृष्ठ](/faq) पर अपना उत्तर जल्दी पा सकते हैं।",
};

const bn: ContactT = {
  title: "আমাদের সাথে যোগাযোগ করুন",
  intro:
    "আমরা সাহায্য করতে এখানে আছি। অর্ডার সম্পর্কে প্রশ্ন থাকুক, ANGA9-এ বিক্রি করতে চাইুন, বা অংশীদারিত্বের ধারণা থাকুক \u2014 উপযুক্ত চ্যানেল বেছে নিন এবং আমরা আপনার সাথে যোগাযোগ করব।",
  hero: {
    title: "গ্রাহক সহায়তা",
    desc: "অর্ডার ট্র্যাকিং, পেমেন্ট, শিপিং, রিফান্ড \u2014 আমরা আপনার পাশে আছি।",
    ctaEmail: "support@anga9.com",
    hours: "সোম \u2013 শনি, সকাল ১০:০০ \u2013 সন্ধ্যা ৭:০০ IST",
  },
  channels: {
    seller: {
      title: "বিক্রেতা সহায়তা",
      desc: "অনবোর্ডিং, লিস্টিং, পেআউট, বা বৃদ্ধি সংক্রান্ত প্রশ্ন",
      linkLabel: "seller.anga9.com",
    },
    business: {
      title: "ব্যবসা ও অংশীদারিত্ব",
      desc: "লজিস্টিক্স, ব্র্যান্ড সহযোগিতা, বাল্ক ক্রয়",
    },
    press: {
      title: "প্রেস ও মিডিয়া",
      desc: "প্রেস অনুসন্ধান, সাক্ষাৎকার, কোম্পানির তথ্য",
    },
  },
  grievance: {
    heading: "অভিযোগ অফিসার",
    intro:
      "তথ্যপ্রযুক্তি আইন, ২০০০ এবং ভোক্তা সুরক্ষা (ই-কমার্স) বিধিমালা, ২০২০ অনুসারে, অভিযোগ অফিসারের যোগাযোগের বিবরণ:",
    nameLabel: "নাম:",
    nameValue: "Sumit Shaw",
    emailLabel: "ইমেইল:",
    hoursLabel: "সময়:",
    hoursValue: "সোম\u2013শুক্র, সকাল ১০:০০ \u2013 সন্ধ্যা ৬:০০ IST",
  },
  office: {
    heading: "নিবন্ধিত কার্যালয়",
    line1: "ANGA9",
    line2: "নতুন দিল্লি, ভারত",
  },
  faqLine:
    "যোগাযোগ করার আগে, আমাদের [FAQ পৃষ্ঠায়](/faq) দ্রুত আপনার উত্তর পেতে পারেন।",
};

const ta: ContactT = {
  title: "எங்களை தொடர்புகொள்ளுங்கள்",
  intro:
    "உதவ நாங்கள் இங்கே இருக்கிறோம். ஆர்டர் பற்றி கேள்வி இருந்தாலும், ANGA9-ல் விற்க விரும்பினாலும், அல்லது கூட்டுறவு யோசனை இருந்தாலும் \u2014 பொருத்தமான சேனலை தேர்ந்தெடுங்கள், நாங்கள் உங்களை தொடர்புகொள்வோம்.",
  hero: {
    title: "வாடிக்கையாளர் ஆதரவு",
    desc: "ஆர்டர் கண்காணிப்பு, கட்டணங்கள், ஷிப்பிங், ரீஃபண்ட் \u2014 நாங்கள் உங்களுக்கு உதவுவோம்.",
    ctaEmail: "support@anga9.com",
    hours: "திங்கள் \u2013 சனி, காலை 10:00 \u2013 மாலை 7:00 IST",
  },
  channels: {
    seller: {
      title: "விற்பனையாளர் ஆதரவு",
      desc: "ஆன்போர்டிங், லிஸ்டிங்கள், பேஅவுட்கள் அல்லது வளர்ச்சி கேள்விகள்",
      linkLabel: "seller.anga9.com",
    },
    business: {
      title: "வணிகம் & கூட்டுறவு",
      desc: "லாஜிஸ்டிக்ஸ், பிராண்ட் ஒத்துழைப்பு, மொத்த கொள்முதல்",
    },
    press: {
      title: "பத்திரிக்கை & ஊடகம்",
      desc: "பத்திரிக்கை விசாரணைகள், நேர்காணல்கள், நிறுவன தகவல்",
    },
  },
  grievance: {
    heading: "புகார் அலுவலர்",
    intro:
      "தகவல் தொழில்நுட்ப சட்டம், 2000 மற்றும் நுகர்வோர் பாதுகாப்பு (மின்-வணிக) விதிகள், 2020 ஆகியவற்றின்படி, புகார் அலுவலரின் தொடர்பு விவரங்கள்:",
    nameLabel: "பெயர்:",
    nameValue: "Sumit Shaw",
    emailLabel: "மின்னஞ்சல்:",
    hoursLabel: "நேரம்:",
    hoursValue: "திங்கள்\u2013வெள்ளி, காலை 10:00 \u2013 மாலை 6:00 IST",
  },
  office: {
    heading: "பதிவு செய்யப்பட்ட அலுவலகம்",
    line1: "ANGA9",
    line2: "புது தில்லி, இந்தியா",
  },
  faqLine:
    "தொடர்புகொள்வதற்கு முன், எங்கள் [FAQ பக்கத்தில்](/faq) விரைவாக உங்கள் பதிலை காணலாம்.",
};

const te: ContactT = {
  title: "మమ్మల్ని సంప్రదించండి",
  intro:
    "మేము సహాయం చేయడానికి ఇక్కడ ఉన్నాము. ఆర్డర్ గురించి ప్రశ్న ఉన్నా, ANGA9లో అమ్మాలనుకున్నా, లేదా భాగస్వామ్య ఆలోచన ఉన్నా \u2014 తగిన ఛానెల్ ఎంచుకోండి, మేము మీతో సంప్రదిస్తాము.",
  hero: {
    title: "కస్టమర్ సపోర్ట్",
    desc: "ఆర్డర్ ట్రాకింగ్, చెల్లింపులు, షిప్పింగ్, రీఫండ్ \u2014 మేము మీకు సహాయం చేస్తాము.",
    ctaEmail: "support@anga9.com",
    hours: "సోమ \u2013 శని, ఉదయం 10:00 \u2013 సాయంత్రం 7:00 IST",
  },
  channels: {
    seller: {
      title: "విక్రేత సపోర్ట్",
      desc: "ఆన్‌బోర్డింగ్, లిస్టింగ్‌లు, పేఔట్‌లు లేదా వృద్ధి ప్రశ్నలు",
      linkLabel: "seller.anga9.com",
    },
    business: {
      title: "వ్యాపారం & భాగస్వామ్యాలు",
      desc: "లాజిస్టిక్స్, బ్రాండ్ సహకారాలు, బల్క్ సేకరణ",
    },
    press: {
      title: "ప్రెస్ & మీడియా",
      desc: "ప్రెస్ విచారణలు, ఇంటర్వ్యూలు, కంపెనీ సమాచారం",
    },
  },
  grievance: {
    heading: "ఫిర్యాదుల అధికారి",
    intro:
      "ఇన్ఫర్మేషన్ టెక్నాలజీ యాక్ట్, 2000 మరియు కన్జ్యూమర్ ప్రొటెక్షన్ (ఇ-కామర్స్) రూల్స్, 2020కి అనుగుణంగా, ఫిర్యాదుల అధికారి సంప్రదింపు వివరాలు:",
    nameLabel: "పేరు:",
    nameValue: "Sumit Shaw",
    emailLabel: "ఇమెయిల్:",
    hoursLabel: "సమయాలు:",
    hoursValue: "సోమ\u2013శుక్ర, ఉదయం 10:00 \u2013 సాయంత్రం 6:00 IST",
  },
  office: {
    heading: "నమోదైన కార్యాలయం",
    line1: "ANGA9",
    line2: "న్యూ ఢిల్లీ, భారతదేశం",
  },
  faqLine:
    "సంప్రదించే ముందు, మా [FAQ పేజీలో](/faq) వేగంగా మీ సమాధానం కనుగొనవచ్చు.",
};

const mr: ContactT = {
  title: "आमच्याशी संपर्क साधा",
  intro:
    "आम्ही मदत करण्यासाठी येथे आहोत. ऑर्डरबद्दल प्रश्न असो, ANGA9 वर विक्री करायची असो, किंवा भागीदारीची कल्पना असो \u2014 योग्य चॅनेल निवडा आणि आम्ही लवकरच तुमच्याशी संपर्क साधू.",
  hero: {
    title: "ग्राहक सहाय्य",
    desc: "ऑर्डर ट्रॅकिंग, पेमेंट, शिपिंग, रिफंड \u2014 आम्ही तुमच्यासाठी आहोत।",
    ctaEmail: "support@anga9.com",
    hours: "सोम \u2013 शनि, सकाळी 10:00 \u2013 सायंकाळी 7:00 IST",
  },
  channels: {
    seller: {
      title: "विक्रेता सहाय्य",
      desc: "ऑनबोर्डिंग, लिस्टिंग, पेआउट किंवा वाढीसंबंधी प्रश्न",
      linkLabel: "seller.anga9.com",
    },
    business: {
      title: "व्यवसाय आणि भागीदारी",
      desc: "लॉजिस्टिक्स, ब्रँड सहयोग, मोठ्या प्रमाणात खरेदी",
    },
    press: {
      title: "प्रेस आणि मीडिया",
      desc: "प्रेस चौकशी, मुलाखती, कंपनी माहिती",
    },
  },
  grievance: {
    heading: "तक्रार अधिकारी",
    intro:
      "माहिती तंत्रज्ञान कायदा, 2000 आणि ग्राहक संरक्षण (ई-कॉमर्स) नियम, 2020 नुसार, तक्रार अधिकाऱ्याचे संपर्क तपशील:",
    nameLabel: "नाव:",
    nameValue: "Sumit Shaw",
    emailLabel: "ईमेल:",
    hoursLabel: "वेळ:",
    hoursValue: "सोम\u2013शुक्र, सकाळी 10:00 \u2013 सायंकाळी 6:00 IST",
  },
  office: {
    heading: "नोंदणीकृत कार्यालय",
    line1: "ANGA9",
    line2: "नवी दिल्ली, भारत",
  },
  faqLine:
    "संपर्क करण्यापूर्वी, आमच्या [FAQ पृष्ठावर](/faq) तुम्हाला जलद उत्तर मिळू शकते।",
};

const kn: ContactT = {
  title: "ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ",
  intro:
    "ಸಹಾಯ ಮಾಡಲು ನಾವು ಇಲ್ಲಿದ್ದೇವೆ. ಆರ್ಡರ್ ಬಗ್ಗೆ ಪ್ರಶ್ನೆ ಇರಲಿ, ANGA9ನಲ್ಲಿ ಮಾರಾಟ ಮಾಡಲು ಬಯಸಲಿ, ಅಥವಾ ಪಾಲುದಾರಿಕೆ ಕಲ್ಪನೆ ಇರಲಿ \u2014 ಸೂಕ್ತ ಚಾನೆಲ್ ಆಯ್ಕೆ ಮಾಡಿ, ನಾವು ನಿಮ್ಮನ್ನು ತಲುಪುತ್ತೇವೆ.",
  hero: {
    title: "ಗ್ರಾಹಕ ಬೆಂಬಲ",
    desc: "ಆರ್ಡರ್ ಟ್ರ್ಯಾಕಿಂಗ್, ಪಾವತಿಗಳು, ಶಿಪ್ಪಿಂಗ್, ಮರುಪಾವತಿ \u2014 ನಾವು ನಿಮ್ಮ ಜೊತೆ ಇದ್ದೇವೆ.",
    ctaEmail: "support@anga9.com",
    hours: "ಸೋಮ \u2013 ಶನಿ, ಬೆಳಿಗ್ಗೆ 10:00 \u2013 ಸಂಜೆ 7:00 IST",
  },
  channels: {
    seller: {
      title: "ಮಾರಾಟಗಾರ ಬೆಂಬಲ",
      desc: "ಆನ್‌ಬೋರ್ಡಿಂಗ್, ಪಟ್ಟಿಗಳು, ಪೇಔಟ್‌ಗಳು ಅಥವಾ ಬೆಳವಣಿಗೆ ಪ್ರಶ್ನೆಗಳು",
      linkLabel: "seller.anga9.com",
    },
    business: {
      title: "ವ್ಯವಹಾರ & ಪಾಲುದಾರಿಕೆ",
      desc: "ಲಾಜಿಸ್ಟಿಕ್ಸ್, ಬ್ರಾಂಡ್ ಸಹಯೋಗ, ಸಗಟು ಖರೀದಿ",
    },
    press: {
      title: "ಪ್ರೆಸ್ & ಮೀಡಿಯಾ",
      desc: "ಪ್ರೆಸ್ ವಿಚಾರಣೆಗಳು, ಸಂದರ್ಶನಗಳು, ಕಂಪನಿ ಮಾಹಿತಿ",
    },
  },
  grievance: {
    heading: "ದೂರು ಅಧಿಕಾರಿ",
    intro:
      "ಮಾಹಿತಿ ತಂತ್ರಜ್ಞಾನ ಕಾಯಿದೆ, 2000 ಮತ್ತು ಗ್ರಾಹಕ ಸಂರಕ್ಷಣೆ (ಇ-ಕಾಮರ್ಸ್) ನಿಯಮಗಳು, 2020ರ ಪ್ರಕಾರ, ದೂರು ಅಧಿಕಾರಿಯ ಸಂಪರ್ಕ ವಿವರಗಳು:",
    nameLabel: "ಹೆಸರು:",
    nameValue: "Sumit Shaw",
    emailLabel: "ಇಮೇಲ್:",
    hoursLabel: "ಸಮಯ:",
    hoursValue: "ಸೋಮ\u2013ಶುಕ್ರ, ಬೆಳಿಗ್ಗೆ 10:00 \u2013 ಸಂಜೆ 6:00 IST",
  },
  office: {
    heading: "ನೋಂದಾಯಿತ ಕಚೇರಿ",
    line1: "ANGA9",
    line2: "ನವ ದೆಹಲಿ, ಭಾರತ",
  },
  faqLine:
    "ಸಂಪರ್ಕಿಸುವ ಮೊದಲು, ನಮ್ಮ [FAQ ಪುಟದಲ್ಲಿ](/faq) ನಿಮ್ಮ ಉತ್ತರವನ್ನು ಬೇಗನೆ ಕಾಣಬಹುದು.",
};

const pa: ContactT = {
  title: "ਸਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰੋ",
  intro:
    "ਅਸੀਂ ਮਦਦ ਕਰਨ ਲਈ ਇੱਥੇ ਹਾਂ। ਆਰਡਰ ਬਾਰੇ ਸਵਾਲ ਹੋਵੇ, ANGA9 'ਤੇ ਵੇਚਣਾ ਹੋਵੇ, ਜਾਂ ਭਾਈਵਾਲੀ ਦਾ ਵਿਚਾਰ ਹੋਵੇ \u2014 ਢੁਕਵਾਂ ਚੈਨਲ ਚੁਣੋ ਅਤੇ ਅਸੀਂ ਜਲਦੀ ਤੁਹਾਡੇ ਨਾਲ ਸੰਪਰਕ ਕਰਾਂਗੇ।",
  hero: {
    title: "ਗਾਹਕ ਸਹਾਇਤਾ",
    desc: "ਆਰਡਰ ਟ੍ਰੈਕਿੰਗ, ਭੁਗਤਾਨ, ਸ਼ਿਪਿੰਗ, ਰਿਫੰਡ \u2014 ਅਸੀਂ ਤੁਹਾਡੇ ਨਾਲ ਹਾਂ।",
    ctaEmail: "support@anga9.com",
    hours: "ਸੋਮ \u2013 ਸ਼ਨੀ, ਸਵੇਰੇ 10:00 \u2013 ਸ਼ਾਮ 7:00 IST",
  },
  channels: {
    seller: {
      title: "ਵਿਕਰੇਤਾ ਸਹਾਇਤਾ",
      desc: "ਆਨਬੋਰਡਿੰਗ, ਲਿਸਟਿੰਗ, ਭੁਗਤਾਨ, ਜਾਂ ਵਿਕਾਸ ਸੰਬੰਧੀ ਪ੍ਰਸ਼ਨ",
      linkLabel: "seller.anga9.com",
    },
    business: {
      title: "ਕਾਰੋਬਾਰ ਅਤੇ ਭਾਈਵਾਲੀ",
      desc: "ਲੌਜਿਸਟਿਕਸ, ਬ੍ਰਾਂਡ ਸਹਿਯੋਗ, ਥੋਕ ਖਰੀਦ",
    },
    press: {
      title: "ਪ੍ਰੈਸ ਅਤੇ ਮੀਡੀਆ",
      desc: "ਪ੍ਰੈਸ ਪੁੱਛਗਿੱਛ, ਇੰਟਰਵਿਊ, ਕੰਪਨੀ ਜਾਣਕਾਰੀ",
    },
  },
  grievance: {
    heading: "ਸ਼ਿਕਾਇਤ ਅਧਿਕਾਰੀ",
    intro:
      "ਸੂਚਨਾ ਤਕਨਾਲੋਜੀ ਐਕਟ, 2000 ਅਤੇ ਖਪਤਕਾਰ ਸੁਰੱਖਿਆ (ਈ-ਕਾਮਰਸ) ਨਿਯਮ, 2020 ਦੇ ਅਨੁਸਾਰ, ਸ਼ਿਕਾਇਤ ਅਧਿਕਾਰੀ ਦੇ ਸੰਪਰਕ ਵੇਰਵੇ:",
    nameLabel: "ਨਾਮ:",
    nameValue: "Sumit Shaw",
    emailLabel: "ਈਮੇਲ:",
    hoursLabel: "ਸਮਾਂ:",
    hoursValue: "ਸੋਮ\u2013ਸ਼ੁੱਕਰ, ਸਵੇਰੇ 10:00 \u2013 ਸ਼ਾਮ 6:00 IST",
  },
  office: {
    heading: "ਰਜਿਸਟਰਡ ਦਫ਼ਤਰ",
    line1: "ANGA9",
    line2: "ਨਵੀਂ ਦਿੱਲੀ, ਭਾਰਤ",
  },
  faqLine:
    "ਸੰਪਰਕ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ, ਸਾਡੇ [FAQ ਪੰਨੇ](/faq) 'ਤੇ ਤੁਸੀਂ ਆਪਣਾ ਜਵਾਬ ਜਲਦੀ ਲੱਭ ਸਕਦੇ ਹੋ।",
};

const gu: ContactT = {
  title: "અમારો સંપર્ક કરો",
  intro:
    "અમે મદદ કરવા માટે અહીં છીએ. ઑર્ડર અંગે પ્રશ્ન હોય, ANGA9 પર વેચવું હોય, અથવા ભાગીદારીનો વિચાર હોય \u2014 યોગ્ય ચેનલ પસંદ કરો અને અમે ટૂંક સમયમાં સંપર્ક કરીશું.",
  hero: {
    title: "ગ્રાહક સહાય",
    desc: "ઑર્ડર ટ્રૅકિંગ, ચુકવણી, શિપિંગ, રિફંડ \u2014 અમે તમારી સાથે છીએ.",
    ctaEmail: "support@anga9.com",
    hours: "સોમ \u2013 શનિ, સવારે 10:00 \u2013 સાંજે 7:00 IST",
  },
  channels: {
    seller: {
      title: "વેચાણકર્તા સહાય",
      desc: "ઑનબોર્ડિંગ, લિસ્ટિંગ, પેઆઉટ અથવા વૃદ્ધિ સંબંધિત પ્રશ્નો",
      linkLabel: "seller.anga9.com",
    },
    business: {
      title: "વ્યવસાય & ભાગીદારી",
      desc: "લૉજિસ્ટિક્સ, બ્રાન્ડ સહયોગ, બલ્ક ખરીદી",
    },
    press: {
      title: "પ્રેસ & મીડિયા",
      desc: "પ્રેસ પૂછતાછ, ઇન્ટરવ્યૂ, કંપની માહિતી",
    },
  },
  grievance: {
    heading: "ફરિયાદ અધિકારી",
    intro:
      "ઇન્ફોર્મેશન ટેક્નોલૉજી ઍક્ટ, 2000 અને કન્ઝ્યુમર પ્રોટેક્શન (ઇ-કૉમર્સ) રૂલ્સ, 2020 અનુસાર, ફરિયાદ અધિકારીની સંપર્ક વિગતો:",
    nameLabel: "નામ:",
    nameValue: "Sumit Shaw",
    emailLabel: "ઈ-મેઇલ:",
    hoursLabel: "સમય:",
    hoursValue: "સોમ\u2013શુક્ર, સવારે 10:00 \u2013 સાંજે 6:00 IST",
  },
  office: {
    heading: "નોંધાયેલ કાર્યાલય",
    line1: "ANGA9",
    line2: "નવી દિલ્હી, ભારત",
  },
  faqLine:
    "સંપર્ક કરતા પહેલાં, અમારા [FAQ પૃષ્ઠ](/faq) પર ઝડપથી તમારો જવાબ મળી શકે છે.",
};

const ml: ContactT = {
  title: "ഞങ്ങളെ ബന്ധപ്പെടുക",
  intro:
    "സഹായിക്കാൻ ഞങ്ങൾ ഇവിടെ ഉണ്ട്. ഓർഡറിനെക്കുറിച്ച് സംശയമോ, ANGA9-ൽ വിൽക്കാൻ ആഗ്രഹമോ, അല്ലെങ്കിൽ പങ്കാളിത്ത ആശയമോ ഉണ്ടെങ്കിൽ \u2014 അനുയോജ്യമായ ചാനൽ തിരഞ്ഞെടുക്കുക, ഞങ്ങൾ ബന്ധപ്പെടാം.",
  hero: {
    title: "ഉപഭോക്തൃ പിന്തുണ",
    desc: "ഓർഡർ ട്രാക്കിംഗ്, പേയ്മെന്റുകൾ, ഷിപ്പിംഗ്, റീഫണ്ട് \u2014 ഞങ്ങൾ നിങ്ങളോടൊപ്പമുണ്ട്.",
    ctaEmail: "support@anga9.com",
    hours: "തിങ്കൾ \u2013 ശനി, രാവിലെ 10:00 \u2013 വൈകിട്ട് 7:00 IST",
  },
  channels: {
    seller: {
      title: "വിൽപ്പനക്കാർക്കുള്ള പിന്തുണ",
      desc: "ഓൺബോർഡിംഗ്, ലിസ്റ്റിംഗുകൾ, പേഔട്ടുകൾ അല്ലെങ്കിൽ വളർച്ചാ ചോദ്യങ്ങൾ",
      linkLabel: "seller.anga9.com",
    },
    business: {
      title: "ബിസിനസ് & പങ്കാളിത്തങ്ങൾ",
      desc: "ലോജിസ്റ്റിക്സ്, ബ്രാൻഡ് സഹകരണം, ബൾക്ക് സംഭരണം",
    },
    press: {
      title: "പ്രസ് & മീഡിയ",
      desc: "പ്രസ് അന്വേഷണങ്ങൾ, അഭിമുഖങ്ങൾ, കമ്പനി വിവരങ്ങൾ",
    },
  },
  grievance: {
    heading: "പരാതി ഉദ്യോഗസ്ഥൻ",
    intro:
      "ഇൻഫർമേഷൻ ടെക്നോളജി ആക്ട്, 2000, കൺസ്യൂമർ പ്രൊട്ടക്ഷൻ (ഇ-കൊമേഴ്സ്) റൂൾസ്, 2020 എന്നിവ അനുസരിച്ച്, പരാതി ഉദ്യോഗസ്ഥന്റെ ബന്ധപ്പെടൽ വിശദാംശങ്ങൾ:",
    nameLabel: "പേര്:",
    nameValue: "Sumit Shaw",
    emailLabel: "ഇമെയിൽ:",
    hoursLabel: "സമയം:",
    hoursValue: "തിങ്കൾ\u2013വെള്ളി, രാവിലെ 10:00 \u2013 വൈകിട്ട് 6:00 IST",
  },
  office: {
    heading: "രജിസ്റ്റർ ചെയ്ത ഓഫീസ്",
    line1: "ANGA9",
    line2: "ന്യൂ ഡൽഹി, ഇന്ത്യ",
  },
  faqLine:
    "ബന്ധപ്പെടുന്നതിന് മുമ്പ്, ഞങ്ങളുടെ [FAQ പേജിൽ](/faq) വേഗത്തിൽ ഉത്തരം കണ്ടെത്തിയേക്കാം.",
};

const ur: ContactT = {
  title: "ہم سے رابطہ کریں",
  intro:
    "ہم مدد کرنے کے لیے یہاں ہیں۔ آرڈر کے بارے میں سوال ہو، ANGA9 پر بیچنا چاہتے ہوں، یا شراکت داری کا خیال ہو \u2014 مناسب چینل منتخب کریں اور ہم جلد آپ سے رابطہ کریں گے۔",
  hero: {
    title: "کسٹمر سپورٹ",
    desc: "آرڈر ٹریکنگ، ادائیگیاں، شپنگ، ریفنڈ \u2014 ہم آپ کے ساتھ ہیں۔",
    ctaEmail: "support@anga9.com",
    hours: "پیر \u2013 ہفتہ، صبح 10:00 \u2013 شام 7:00 IST",
  },
  channels: {
    seller: {
      title: "فروخت کنندہ سپورٹ",
      desc: "آن بورڈنگ، لسٹنگ، ادائیگیاں، یا ترقی سے متعلق سوالات",
      linkLabel: "seller.anga9.com",
    },
    business: {
      title: "کاروبار اور شراکت داری",
      desc: "لاجسٹکس، برانڈ تعاون، بلک خریداری",
    },
    press: {
      title: "پریس اور میڈیا",
      desc: "پریس سوالات، انٹرویوز، کمپنی کی معلومات",
    },
  },
  grievance: {
    heading: "شکایات افسر",
    intro:
      "انفارمیشن ٹیکنالوجی ایکٹ، 2000 اور کنزیومر پروٹیکشن (ای-کامرس) رولز، 2020 کے مطابق، شکایات افسر کی رابطہ تفصیلات:",
    nameLabel: "نام:",
    nameValue: "Sumit Shaw",
    emailLabel: "ای میل:",
    hoursLabel: "اوقات:",
    hoursValue: "پیر\u2013جمعہ، صبح 10:00 \u2013 شام 6:00 IST",
  },
  office: {
    heading: "رجسٹرڈ دفتر",
    line1: "ANGA9",
    line2: "نئی دہلی، بھارت",
  },
  faqLine:
    "رابطہ کرنے سے پہلے، ہمارے [FAQ صفحے](/faq) پر اپنا جواب جلدی مل سکتا ہے۔",
};

const dict: Partial<Record<LangCode, ContactT>> = {
  en, hi, bn, ta, te, mr, kn, pa, gu, ml, ur,
};

export function getContactT(lang: LangCode): ContactT {
  return dict[lang] ?? dict.en!;
}