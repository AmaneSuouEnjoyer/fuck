interface AnswerEffectModel {
    answerEffectType: string,
    candidateId: number,
    issueId: number,
    stateId: number,
    amount: number;
	counterName?: string;      // The name of the counter
    counterAmount?: number;    // Amount to add (positive) or subtract (negative)
    questionId?: number;
    questionEnabled?: boolean;
    weight? : number;
}

export type { AnswerEffectModel };

