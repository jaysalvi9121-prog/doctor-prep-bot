import type { Language, RedFlagState } from "./types";

/**
 * Rule-based safety layer.
 *
 * This is deliberately NOT an LLM. Rules are configuration data so they can be
 * moved to the backend (FastAPI / n8n "Workflow 4 — Red Flag") without touching
 * any UI code. The engine only decides "this needs a human now"; it never
 * names a disease, never suggests treatment.
 */
export interface RedFlagRule {
  id: string;
  /** Human-readable, staff-facing description. Never shown to the patient. */
  staffLabel: string;
  severity: "emergency" | "urgent";
  match: {
    en: string[];
    hi: string[];
  };
}

export const redFlagRules: RedFlagRule[] = [
  {
    id: "RF_BREATHING_SEVERE",
    staffLabel: "Reported severe difficulty breathing",
    severity: "emergency",
    match: {
      en: ["can't breathe", "cannot breathe", "difficulty breathing", "breathless", "gasping"],
      hi: ["सांस नहीं", "साँस नहीं", "सांस लेने में", "साँस फूल", "दम घुट"],
    },
  },
  {
    id: "RF_CHEST_PAIN_SEVERE",
    staffLabel: "Reported severe chest pain / pressure",
    severity: "emergency",
    match: {
      en: ["chest pain", "chest pressure", "crushing pain", "pain in chest"],
      hi: ["सीने में दर्द", "छाती में दर्द", "सीने में भारी"],
    },
  },
  {
    id: "RF_LOSS_OF_CONSCIOUSNESS",
    staffLabel: "Reported loss of consciousness / fainting",
    severity: "emergency",
    match: {
      en: ["unconscious", "fainted", "passed out", "blacked out", "collapsed"],
      hi: ["बेहोश", "चक्कर आकर गिर", "होश नहीं"],
    },
  },
  {
    id: "RF_UNCONTROLLED_BLEEDING",
    staffLabel: "Reported severe or uncontrolled bleeding",
    severity: "emergency",
    match: {
      en: ["heavy bleeding", "bleeding a lot", "won't stop bleeding", "vomiting blood", "blood in vomit"],
      hi: ["बहुत खून", "खून बंद नहीं", "खून की उल्टी"],
    },
  },
  {
    id: "RF_NEURO_SEVERE",
    staffLabel: "Reported new severe neurological symptoms",
    severity: "emergency",
    match: {
      en: ["one side weak", "cannot speak", "slurred speech", "face drooping", "sudden numbness", "seizure", "fits"],
      hi: ["एक तरफ कमजोर", "बोल नहीं", "लकवा", "झटके आ", "मिर्गी"],
    },
  },
  {
    id: "RF_PREGNANCY_BLEEDING",
    staffLabel: "Reported bleeding during pregnancy",
    severity: "emergency",
    match: {
      en: ["pregnant and bleeding", "bleeding in pregnancy"],
      hi: ["गर्भावस्था में खून", "प्रेगनेंसी में खून"],
    },
  },
  {
    id: "RF_INFANT_UNWELL",
    staffLabel: "Reported infant not feeding / very drowsy",
    severity: "urgent",
    match: {
      en: ["baby not feeding", "child not waking", "infant very drowsy"],
      hi: ["बच्चा दूध नहीं", "बच्चा उठ नहीं"],
    },
  },
];

export function evaluateRedFlags(texts: string[], language: Language): RedFlagState {
  const haystack = texts.join(" \n ").toLowerCase();
  for (const rule of redFlagRules) {
    const phrases = [...rule.match[language], ...rule.match.en];
    if (phrases.some((p) => haystack.includes(p.toLowerCase()))) {
      return {
        red_flag: true,
        rule_triggered: rule.id,
        requires_human_review: true,
        detected_at: new Date().toISOString(),
      };
    }
  }
  return { red_flag: false, rule_triggered: null, requires_human_review: false };
}

export function ruleById(id: string | null) {
  return redFlagRules.find((r) => r.id === id) ?? null;
}
