import type { Language, MedicalHistory } from "./types";

/**
 * Adaptive history-taking engine.
 *
 * In production this lives behind `POST /api/session/{id}/next-question`
 * (FastAPI -> n8n -> Mugen API). The rules below are the local fallback so the
 * kiosk keeps working when the AI service is unavailable.
 *
 * SAFETY: questions only. No diagnosis, no disease naming, no medicine advice.
 */
export interface Question {
  id: string;
  field: keyof MedicalHistory | "none";
  text: Record<Language, string>;
  /** Multi-value answers get split on commas / "और" / "and". */
  list?: boolean;
  optional?: boolean;
  quickAnswers?: Record<Language, string[]>;
}

const q = (
  id: string,
  field: Question["field"],
  en: string,
  hi: string,
  extra: Partial<Question> = {},
): Question => ({ id, field, text: { en, hi }, ...extra });

export const baseQuestions: Question[] = [
  q("onset", "onset", "When did this problem start?", "यह समस्या कब शुरू हुई?", {
    quickAnswers: {
      en: ["Today", "2–3 days ago", "About a week ago", "More than a month ago"],
      hi: ["आज", "2–3 दिन पहले", "लगभग एक सप्ताह पहले", "एक महीने से ज़्यादा"],
    },
  }),
  q("progression", "progression", "Is it getting better, worse, or staying the same?", "यह ठीक हो रहा है, बढ़ रहा है, या वैसा ही है?", {
    quickAnswers: { en: ["Better", "Worse", "Same"], hi: ["ठीक हो रहा है", "बढ़ रहा है", "वैसा ही है"] },
  }),
  q("severity", "severity", "How much does it trouble you — mild, moderate, or severe?", "यह आपको कितना परेशान करता है — हल्का, मध्यम, या तेज़?", {
    quickAnswers: { en: ["Mild", "Moderate", "Severe"], hi: ["हल्का", "मध्यम", "तेज़"] },
  }),
  q("modifying_factors", "modifying_factors", "Does anything make it better or worse?", "किसी चीज़ से यह कम या ज़्यादा होता है?", { optional: true }),
  q("associated_symptoms", "associated_symptoms", "Are you having any other problems along with this?", "इसके साथ आपको कोई और तकलीफ़ भी है?", { list: true, optional: true }),
  q("past_medical_history", "past_medical_history", "Do you have any existing medical conditions, or have you had this problem before?", "क्या आपको पहले से कोई बीमारी है, या यह समस्या पहले भी हुई है?", { list: true, optional: true }),
  q("current_medications", "current_medications", "Are you taking any medicines at present?", "क्या आप अभी कोई दवा ले रहे हैं?", { list: true, optional: true }),
  q("allergies", "allergies", "Do you have any allergies to medicines or food?", "क्या आपको किसी दवा या खाने से एलर्जी है?", { list: true, optional: true }),
  q("family_history", "family_history", "Does anyone in your family have a similar or long-term illness?", "आपके परिवार में किसी को ऐसी या पुरानी बीमारी है?", { list: true, optional: true }),
  q("relevant_social_history", "relevant_social_history", "Do you use tobacco, alcohol, or work in dust or smoke?", "क्या आप तंबाकू, शराब लेते हैं, या धूल-धुएँ में काम करते हैं?", { list: true, optional: true }),
];

/** Complaint-specific follow-ups, inserted right after onset. */
const followUpPacks: { keys: { en: string[]; hi: string[] }; questions: Question[] }[] = [
  {
    keys: { en: ["fever", "temperature"], hi: ["बुखार", "बुख़ार"] },
    questions: [
      q("fever_temp", "associated_symptoms", "Do you know how high the fever went?", "क्या आपको पता है बुखार कितना था?", { optional: true }),
      q("fever_chills", "associated_symptoms", "Do you get chills or shivering with the fever?", "बुखार के साथ ठंड या कंपकंपी लगती है?", { list: true, optional: true }),
      q("fever_assoc", "associated_symptoms", "Do you also have cough, sore throat, vomiting, loose motions, or body pain?", "आपको खांसी, गले में दर्द, उल्टी, दस्त या शरीर में दर्द भी है?", { list: true, optional: true }),
    ],
  },
  {
    keys: { en: ["cough", "breath", "chest"], hi: ["खांसी", "खाँसी", "सांस", "साँस"] },
    questions: [
      q("cough_sputum", "associated_symptoms", "Is the cough dry, or does something come out?", "खांसी सूखी है या बलगम आता है?", { optional: true }),
      q("cough_breath", "associated_symptoms", "Do you feel short of breath while walking or resting?", "चलते या आराम करते समय सांस फूलती है?", { list: true, optional: true }),
      q("cough_fever", "associated_symptoms", "Do you also have fever, night sweats, or weight loss?", "आपको बुखार, रात में पसीना या वज़न कम होना भी है?", { list: true, optional: true }),
    ],
  },
  {
    keys: { en: ["pain in stomach", "abdominal", "stomach", "vomit", "loose"], hi: ["पेट", "उल्टी", "दस्त"] },
    questions: [
      q("abd_site", "associated_symptoms", "Where exactly is the pain in your stomach?", "पेट में दर्द कहाँ होता है?", { optional: true }),
      q("abd_food", "modifying_factors", "Is the pain related to eating food?", "दर्द खाने से जुड़ा है?", { optional: true }),
      q("abd_assoc", "associated_symptoms", "Do you also have vomiting, loose motions, or difficulty passing stool?", "आपको उल्टी, दस्त या शौच में परेशानी भी है?", { list: true, optional: true }),
    ],
  },
  {
    keys: { en: ["knee", "joint", "back pain", "body pain"], hi: ["घुटने", "जोड़", "कमर", "शरीर में दर्द"] },
    questions: [
      q("joint_swelling", "associated_symptoms", "Is there any swelling or stiffness in the joint?", "जोड़ में सूजन या अकड़न है?", { list: true, optional: true }),
      q("joint_walk", "modifying_factors", "Does walking or climbing stairs make it worse?", "चलने या सीढ़ी चढ़ने से दर्द बढ़ता है?", { optional: true }),
      q("joint_morning", "associated_symptoms", "Is it worse in the morning or at the end of the day?", "दर्द सुबह ज़्यादा होता है या शाम को?", { optional: true }),
    ],
  },
  {
    keys: { en: ["headache", "head pain", "dizzy"], hi: ["सिर दर्द", "सिरदर्द", "चक्कर"] },
    questions: [
      q("head_site", "associated_symptoms", "Which part of the head hurts?", "सिर के किस हिस्से में दर्द है?", { optional: true }),
      q("head_assoc", "associated_symptoms", "Do you have vomiting, blurred vision, or light bothering you?", "आपको उल्टी, धुंधला दिखना या रोशनी से तकलीफ़ है?", { list: true, optional: true }),
    ],
  },
];

/** Builds the adaptive question list from the chief complaint. */
export function buildQuestionPlan(chiefComplaint: string, language: Language): Question[] {
  const text = chiefComplaint.toLowerCase();
  const packs = followUpPacks.filter((p) =>
    [...p.keys[language], ...p.keys.en].some((k) => text.includes(k.toLowerCase())),
  );
  const followUps = packs.flatMap((p) => p.questions).slice(0, 4);
  const [onset, ...rest] = baseQuestions;
  return [onset!, ...followUps, ...rest];
}

export function splitListAnswer(answer: string): string[] {
  return answer
    .split(/,|;|\band\b|और|\+/gi)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
