import type { TriviaItem } from '../data/trivia';
interface TriviaCardProps {
    item: TriviaItem;
    showAnswer: boolean;
    showSource: boolean;
    density: 'full' | 'comfortable' | 'compact' | 'minimal';
    isPortrait: boolean;
}
export declare function TriviaCard({ item, showAnswer, showSource, density, isPortrait }: TriviaCardProps): import("react/jsx-runtime").JSX.Element;
export {};
