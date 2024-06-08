import { RegisterBody, UpdateBody } from "../Types";
import Connection, { IConnection } from "../entities/connection.schema";

export default class RegisterService {
    public async create(body: RegisterBody) {
        const {
            domain_name,
            tld,
            github_repo,
            branch,
            isPrivate,
            private_secret,
        } = body;

        const ghuser = github_repo.split("/").slice(-2)[0];
        const ghrepo = github_repo.split("/").slice(-1)[0];

        const ghrawrouter = `https://raw.githubusercontent.com/${ghuser}/${ghrepo}/${branch}/router.json`;

        const res = await fetch(ghrawrouter);
        if (res.status === 200) {
            try {
                let resBody = await res.json();
                if (!resBody) {
                    throw new Error("error.validation|Invalid json data");
                }
                if (resBody.rotues === undefined) {
                    throw new Error("error.validation|Invalid json data");
                }
                const newConnection = new Connection();
                newConnection.domain_name = domain_name;
                newConnection.tld = tld;
                newConnection.github_repo = github_repo;
                newConnection.branch = branch;
                newConnection.router = resBody;
                // generate secret >>
            } catch (err: any) {
                return {
                    error: true,
                    name: err.message.split("|")[0],
                    message: err.message.split("|")[1],
                };
            }
        } else {
            return {
                error: true,
                name: "error.notfound",
                message:
                    "Invalid github repository url or router.json not found",
            };
        }
    }

    public async update(body: UpdateBody) {
        return {};
    }
}
