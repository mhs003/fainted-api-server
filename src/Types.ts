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

type RouterRecacheBody = {
    isPrivate: string;
    secret: string;
    private_secret: string;
};

type ServeQuery = {
    domain_name: string;
    tld: string;
    path: string;
    router_group: string;
};

type RouterType = {
    [key: string]: {
        [key: string]: string;
    };
};

export {
    ConnectionRegisterBody,
    ConnectionUpdateBody,
    ConnectionFindBody,
    ServeQuery,
    RouterRecacheBody,
    RouterType,
};
