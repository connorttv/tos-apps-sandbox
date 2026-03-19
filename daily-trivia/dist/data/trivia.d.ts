export type Category = 'science' | 'history' | 'geography' | 'pop-culture' | 'technology' | 'nature' | 'food-drink' | 'sports' | 'space' | 'animals';
export interface TriviaItem {
    id: string;
    category: Category;
    type: 'fact' | 'qa';
    text: string;
    answer?: string;
    source?: string;
}
export declare const CATEGORY_LABELS: Record<Category, string>;
export declare const ALL_CATEGORIES: Category[];
export declare const triviaItems: TriviaItem[];
