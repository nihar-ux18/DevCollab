import type { ReactNode } from "react";

export interface StatCard{
    title: string;
    value : number | string;
    icon?: ReactNode;
}

export interface LearningItem {
    name : string;
    progress : number;
}

export interface FocusStat{
    today:number;
    week:number;
}