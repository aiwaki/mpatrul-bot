import { HfInference, type ZeroShotClassificationOutput } from '@huggingface/inference';
import { REPORTS, CONTENTS, type ReportType } from '../utils/constants';

const hf = new HfInference(process.env.HUGGING_FACE_TOKEN as string);

const zeroShotClassification = async (
    text: string,
    candidateLabels: string[]
): Promise<ZeroShotClassificationOutput> =>
    hf.zeroShotClassification({
        model: 'cointegrated/rubert-base-cased-nli-threeway',
        inputs: text,
        parameters: { candidate_labels: candidateLabels },
    });

export const classifyText = async (
    text: string
): Promise<{
    label: string;
    content: ReportType | null;
}> => {
    const out = (await zeroShotClassification(text, REPORTS))[0];
    const maxIndex = out.scores.indexOf(Math.max(...out.scores));

    return {
        label: out.labels[maxIndex],
        content: CONTENTS.find(c => c.title === out.labels[maxIndex])?.value || null
    };
};