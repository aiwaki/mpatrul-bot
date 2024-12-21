import { HfInference, type ZeroShotClassificationOutput } from '@huggingface/inference';
import { REPORTS, CONTEXTS, type ReportType } from './constants';

const hf = new HfInference(process.env.HUGGING_FACE_TOKEN as string);

const zeroShotClassification = async (
    text: string,
    candidateLabels: string[]
): Promise<ZeroShotClassificationOutput> =>
    await hf.zeroShotClassification({
        model: 'cointegrated/rubert-base-cased-nli-threeway',
        inputs: text,
        parameters: { candidate_labels: candidateLabels },
    });

export interface ClassificationOutput {
    label: string;
    content: ReportType;
    score: number;
}

export const classifyText = async (
    text: string
): Promise<ClassificationOutput> => {
    const out = (await zeroShotClassification(text.toLowerCase(), REPORTS))[0];
    const maxIndex = out.scores.indexOf(Math.max(...out.scores));
    const label = out.labels[maxIndex]

    return {
        label,
        content: CONTEXTS[label],
        score: out.scores[maxIndex]
    };
};