// User preference questionnaire configuration

export interface QuestionOption {
  id: string;
  label: string;
  affects: Record<string, number>; // Category weights to apply
}

export interface QuestionStep {
  id: string;
  question: string;
  questionEn: string;
  multiSelect?: boolean;
  type?: 'options' | 'address-input' | 'slider';
  optional?: boolean;
  options?: QuestionOption[];
}

export const QUESTIONNAIRE_STEPS: QuestionStep[] = [
  {
    id: 'household',
    question: 'Какъв е вашият домакински състав?',
    questionEn: 'What is your household composition?',
    type: 'options',
    options: [
      {
        id: 'single',
        label: 'Живея сам/сама',
        affects: { kindergarten: 0, school: 0, park: 5 },
      },
      {
        id: 'couple',
        label: 'Двойка без деца',
        affects: { kindergarten: 0, school: 0, restaurant: 6 },
      },
      {
        id: 'young-family',
        label: 'Семейство с малки деца',
        affects: { kindergarten: 10, school: 5, park: 8, pharmacy: 8 },
      },
      {
        id: 'family-school',
        label: 'Семейство с ученици',
        affects: { kindergarten: 0, school: 10, park: 6, busStop: 7 },
      },
      {
        id: 'retired',
        label: 'Пенсионери',
        affects: { hospital: 9, pharmacy: 9, park: 7, busStop: 8 },
      },
    ],
  },
  {
    id: 'transport',
    question: 'Как се придвижвате основно?',
    questionEn: 'How do you mainly commute?',
    type: 'options',
    options: [
      {
        id: 'car',
        label: 'С кола',
        affects: { busStop: 2, metro: 2 },
      },
      {
        id: 'public',
        label: 'С градски транспорт',
        affects: { busStop: 10, metro: 10, grocery: 8 },
      },
      {
        id: 'mixed',
        label: 'Комбинирано',
        affects: { busStop: 6, metro: 6 },
      },
      {
        id: 'walk-bike',
        label: 'Пеша или с колело',
        affects: { busStop: 4, metro: 4, grocery: 10, park: 8 },
      },
    ],
  },
  {
    id: 'lifestyle',
    question: 'Кое е най-важно за вас в ежедневието?',
    questionEn: 'What is most important in your daily life?',
    type: 'options',
    multiSelect: true,
    options: [
      {
        id: 'health',
        label: 'Здравословен начин на живот',
        affects: { gym: 8, park: 8, hospital: 7 },
      },
      {
        id: 'convenience',
        label: 'Удобство и бързина',
        affects: { grocery: 10, pharmacy: 8, metro: 8 },
      },
      {
        id: 'social',
        label: 'Социален живот',
        affects: { restaurant: 7, park: 6 },
      },
      {
        id: 'nature',
        label: 'Близост до природа',
        affects: { park: 10 },
      },
    ],
  },
];

/**
 * Calculate category weights from questionnaire answers
 */
export function calculateWeightsFromAnswers(
  answers: Record<string, string | string[]>
): Record<string, number> {
  const weights: Record<string, number> = {};

  // Start with default values
  const defaultWeights: Record<string, number> = {
    grocery: 5,
    pharmacy: 5,
    hospital: 5,
    kindergarten: 5,
    school: 5,
    busStop: 5,
    metro: 5,
    park: 5,
    gym: 3,
    restaurant: 3,
  };

  // Initialize with defaults
  Object.assign(weights, defaultWeights);

  // Apply answers
  QUESTIONNAIRE_STEPS.forEach((step) => {
    const answer = answers[step.id];
    if (!answer || !step.options) return;

    const selectedOptions = Array.isArray(answer) ? answer : [answer];

    selectedOptions.forEach((optionId) => {
      const option = step.options!.find((o) => o.id === optionId);
      if (option) {
        // Merge weights (override or boost)
        Object.entries(option.affects).forEach(([category, weight]) => {
          weights[category] = weight;
        });
      }
    });
  });

  return weights;
}
