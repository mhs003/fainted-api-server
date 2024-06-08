type RegisterBody = {
    domain_name: string;
    tld: string;
    github_repo: string;
    branch: string;
    isPrivate?: boolean;
    private_secret?: string;
};

type UpdateBody = {
    id: string;
    domain_name: string;
    github_repo: string;
    branch: string;
    isPrivate: boolean;
    secret: string;
    private_secret: string;
};

export { RegisterBody, UpdateBody };
