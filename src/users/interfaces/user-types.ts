/* eslint-disable prettier/prettier */
export interface SocialLinks {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    google?: string;
    github?: string;
}

export interface UserPreferences {
    language?: string;
    timezone?: string;
    notifications?: boolean;
    theme?: string;
}

export interface SecurityQuestions {
    question1: string;
    answer1: string;
    question2?: string;
    answer2?: string;
    question3?: string;
    answer3?: string;
}