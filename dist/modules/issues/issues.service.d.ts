export declare const issueService: {
    createIssueIntoDB: (payload: any) => Promise<any>;
    getAllIssuesIntoDB: () => Promise<{
        id: any;
        title: any;
        description: any;
        type: any;
        status: any;
        reporter: any;
        created_at: any;
        updated_at: any;
    }[]>;
    getSingleIssueFromDB: (id: string) => Promise<{
        id: any;
        title: any;
        description: any;
        type: any;
        status: any;
        reporter: any;
        created_at: any;
        updated_at: any;
    }>;
    updateSingleIssueFromDB: (payload: any, id: string) => Promise<import("pg").QueryResult<any>>;
    getIssueById: (id: string) => Promise<any>;
    deleteIssueIntoDB: (id: string) => Promise<import("pg").QueryResult<any>>;
};
//# sourceMappingURL=issues.service.d.ts.map