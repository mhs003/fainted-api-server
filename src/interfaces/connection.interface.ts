export default interface IConnection extends Document {
    domain_name: string;
    tld: string;
    github_repo: string;
    branch: string;
    router: object;
    secret: string;
    isPrivate: boolean;
}
