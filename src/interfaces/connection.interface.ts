import { RouterType } from "../Types";

export default interface IConnection extends Document {
    domain_name: string;
    tld: string;
    github_repo: string;
    branch: string;
    router: RouterType;
    secret: string;
    isPrivate: boolean;
}
