export interface TaskInfo {
    id: string;
    status: string;
    progress?: number;
    message?: string;
    result?: any;
}