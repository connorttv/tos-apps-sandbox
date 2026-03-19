import { type Category, type TriviaItem } from '../data/trivia';
type Phase = 'entering' | 'visible' | 'exiting';
interface UseTriviaRotationOptions {
    selectedCategories: Category[];
    contentMode: string;
    transitionSpeed: number;
    answerRevealDelay: number;
}
interface UseTriviaRotationResult {
    currentItem: TriviaItem | null;
    showAnswer: boolean;
    phase: Phase;
    index: number;
    queueLength: number;
}
export declare function useTriviaRotation({ selectedCategories, contentMode, transitionSpeed, answerRevealDelay, }: UseTriviaRotationOptions): UseTriviaRotationResult;
export {};
