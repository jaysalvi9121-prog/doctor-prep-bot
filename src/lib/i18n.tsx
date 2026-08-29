import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Language } from "./types";

/**
 * Centralised translation structure.
 * To add another Indian language: add a key (e.g. `mr`, `ta`) with the same
 * shape and register it in `languageOptions`.
 */
export const translations = {
  en: {
    appName: "MediKiosk",
    tagline: "Let's prepare your medical history before you meet the doctor.",
    disclaimer:
      "MediKiosk helps collect your medical information before you meet the doctor. It does not diagnose or prescribe.",
    disclaimerLong:
      "MediKiosk collects and organizes your medical information. It does not provide a diagnosis. Your doctor makes all clinical decisions.",
    chooseLanguage: "Choose your language",
    start: "Start",
    next: "Next",
    back: "Back",
    skip: "Skip",
    repeat: "Repeat question",
    speak: "Tap and speak",
    listening: "Listening…",
    stop: "Stop recording",
    record: "Record",
    retry: "Try again",
    typeInstead: "Type instead",
    typeAnswer: "Type your answer",
    upload: "Upload document",
    yourDetails: "Your details",
    name: "Name",
    age: "Age",
    sex: "Sex",
    male: "Male",
    female: "Female",
    other: "Other",
    phone: "Phone number (optional)",
    hospitalId: "Hospital / Patient ID (optional)",
    chiefComplaintTitle: "What brings you to the doctor today?",
    chiefComplaintHint: "Please tell us what problem you are having.",
    documentsTitle: "Do you have any previous medical documents?",
    docPrescription: "Prescription",
    docBlood: "Blood report",
    docImaging: "X-ray / scan report",
    docDischarge: "Discharge summary",
    docOther: "Other document",
    noDocuments: "I have no documents",
    processing: "Extracting information…",
    uploaded: "Uploaded",
    extracted: "Information extracted",
    reviewExtracted: "Please check the information we read from your documents",
    aiExtractedLabel: "AI/OCR extracted — please verify",
    edit: "Edit",
    save: "Save",
    confirm: "Confirm",
    confirmed: "Confirmed",
    summaryTitle: "Medical history summary",
    editInformation: "Edit information",
    sendToDoctor: "Confirm & send to doctor",
    sentTitle: "Your information has been sent to the doctor.",
    sentBody: "Please wait for your name to be called.",
    queueNumber: "Queue number",
    done: "Finish",
    redFlagTitle: "Please wait. A healthcare staff member will assist you.",
    redFlagBody:
      "Based on what you told us, staff have been informed so they can see you sooner. This is not a diagnosis.",
    callStaff: "Staff have been alerted",
    micUnavailable: "The microphone is not available on this kiosk.",
    speechFailed: "We couldn't understand the recording.",
    uploadFailed: "The document could not be uploaded.",
    ocrFailed: "We couldn't read this document.",
    networkFailed: "Connection problem. Please try again.",
    sessionTimeout: "Session closed for your privacy",
    sessionTimeoutBody: "Your temporary information was cleared. Please start again.",
    startAgain: "Start again",
    step: "Step",
    of: "of",
    yes: "Yes",
    no: "No",
    noneReported: "None reported",
    demoBadge: "DEMO DATA",
  },
  hi: {
    appName: "मेडीकियोस्क",
    tagline: "डॉक्टर से मिलने से पहले आइए आपकी चिकित्सा जानकारी तैयार करें।",
    disclaimer:
      "मेडीकियोस्क डॉक्टर से मिलने से पहले आपकी जानकारी इकट्ठा करता है। यह बीमारी नहीं बताता और दवा नहीं लिखता।",
    disclaimerLong:
      "मेडीकियोस्क आपकी चिकित्सा जानकारी इकट्ठा और व्यवस्थित करता है। यह कोई निदान नहीं देता। सभी चिकित्सकीय निर्णय आपके डॉक्टर लेते हैं।",
    chooseLanguage: "अपनी भाषा चुनें",
    start: "शुरू करें",
    next: "आगे",
    back: "पीछे",
    skip: "छोड़ें",
    repeat: "प्रश्न दोहराएँ",
    speak: "छूकर बोलें",
    listening: "सुन रहे हैं…",
    stop: "रिकॉर्डिंग रोकें",
    record: "रिकॉर्ड करें",
    retry: "फिर कोशिश करें",
    typeInstead: "टाइप करके बताएँ",
    typeAnswer: "अपना उत्तर लिखें",
    upload: "दस्तावेज़ अपलोड करें",
    yourDetails: "आपकी जानकारी",
    name: "नाम",
    age: "उम्र",
    sex: "लिंग",
    male: "पुरुष",
    female: "महिला",
    other: "अन्य",
    phone: "फ़ोन नंबर (वैकल्पिक)",
    hospitalId: "अस्पताल / मरीज़ आईडी (वैकल्पिक)",
    chiefComplaintTitle: "आज आप डॉक्टर के पास किस समस्या के लिए आए हैं?",
    chiefComplaintHint: "कृपया बताएँ आपको क्या तकलीफ़ है।",
    documentsTitle: "क्या आपके पास पहले के कोई मेडिकल दस्तावेज़ हैं?",
    docPrescription: "पर्चा (प्रिस्क्रिप्शन)",
    docBlood: "खून की जाँच रिपोर्ट",
    docImaging: "एक्स-रे / स्कैन रिपोर्ट",
    docDischarge: "डिस्चार्ज समरी",
    docOther: "अन्य दस्तावेज़",
    noDocuments: "मेरे पास कोई दस्तावेज़ नहीं है",
    processing: "जानकारी निकाली जा रही है…",
    uploaded: "अपलोड हो गया",
    extracted: "जानकारी निकाल ली गई",
    reviewExtracted: "कृपया दस्तावेज़ों से पढ़ी गई जानकारी जाँच लें",
    aiExtractedLabel: "एआई/ओसीआर से पढ़ी गई — कृपया जाँच लें",
    edit: "बदलें",
    save: "सहेजें",
    confirm: "पक्का करें",
    confirmed: "पक्का हो गया",
    summaryTitle: "चिकित्सा इतिहास सारांश",
    editInformation: "जानकारी बदलें",
    sendToDoctor: "पक्का करें और डॉक्टर को भेजें",
    sentTitle: "आपकी जानकारी डॉक्टर को भेज दी गई है।",
    sentBody: "कृपया अपने नाम की पुकार का इंतज़ार करें।",
    queueNumber: "क्रम संख्या",
    done: "समाप्त करें",
    redFlagTitle: "कृपया रुकें। अस्पताल का स्टाफ़ आपकी सहायता करेगा।",
    redFlagBody:
      "आपने जो बताया उसके आधार पर स्टाफ़ को सूचित कर दिया गया है ताकि आपको जल्दी देखा जा सके। यह कोई निदान नहीं है।",
    callStaff: "स्टाफ़ को सूचित कर दिया गया है",
    micUnavailable: "इस कियोस्क पर माइक्रोफ़ोन उपलब्ध नहीं है।",
    speechFailed: "हम रिकॉर्डिंग समझ नहीं पाए।",
    uploadFailed: "दस्तावेज़ अपलोड नहीं हो सका।",
    ocrFailed: "हम यह दस्तावेज़ पढ़ नहीं सके।",
    networkFailed: "कनेक्शन में समस्या है। कृपया फिर कोशिश करें।",
    sessionTimeout: "आपकी निजता के लिए सत्र बंद कर दिया गया",
    sessionTimeoutBody: "आपकी अस्थायी जानकारी मिटा दी गई है। कृपया फिर से शुरू करें।",
    startAgain: "फिर से शुरू करें",
    step: "चरण",
    of: "/",
    yes: "हाँ",
    no: "नहीं",
    noneReported: "कुछ नहीं बताया गया",
    demoBadge: "डेमो जानकारी",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];

export const languageOptions: { code: Language; label: string }[] = [
  { code: "hi", label: "हिन्दी" },
  { code: "en", label: "English" },
];

interface LanguageContextValue {
  language: Language;
  setLanguage: (l: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key) => translations[language][key] ?? translations.en[key],
    }),
    [language],
  );
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
