export interface BuildProblem {
    filePath: string;
    line: number;
    character: number;
    message: string;
    isError: boolean;
    raw: string;
} 
