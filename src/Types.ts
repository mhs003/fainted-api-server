type ConnectionRegisterBody = {
    domain_name: string;
    tld: string;
    github_repo: string;
    branch: string;
    isPrivate?: boolean;
    private_secret?: string;
};

type ConnectionUpdateBody = {
    id: string;
    domain_name: string;
    github_repo: string;
    branch: string;
    isPrivate?: boolean;
    secret: string;
    private_secret?: string;
};

type ConnectionFindBody = {
    secret: string;
};

export { ConnectionRegisterBody, ConnectionUpdateBody, ConnectionFindBody };
