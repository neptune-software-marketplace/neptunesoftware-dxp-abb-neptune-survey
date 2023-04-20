declare const nep: any;

type QuestionType = 'SingleChoice' | 'Date' | 'Text' | 'Likert' | 'MultipleChoice' | 'Rating' | 'NPS' | 'Numeric';

interface AnswerOption {
    id: string;
    title: string;
    value: number;
}

interface QuestionDefinition {
    id: string;
    items: AnswerOption[];
    required: boolean;
    title: string;
    enableSubtitle: boolean;
    subtitle: string;
    enableLongAnswer: string;
    textLow: string;
    textHigh: string;
    levelsInt: number;
    type: QuestionType;
    validationType?: string;
    validationParam?: string;
}

interface SurveyData {
    id: string;
    name: string;
    description: string;
    questions: QuestionDefinition[],
    setup: {
        backgroundImage: string;
        headerColor: string;
        textColor: string;
    },
    distribution: {
        anonymous: boolean,
        emailTemplate: string,
    }
}