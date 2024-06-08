import { RegisterBody, UpdateBody } from "../Types";
import Connection from "../entities/connection.schema";

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

        try {
            if (private_secret && isPrivate) {
                if (private_secret !== process.env.PRIVATE_SECRET) {
                    throw new Error("error.validation|Invalid private secret");
                }
            }

            const ghuser = github_repo.split("/").slice(-2)[0];
            const ghrepo = github_repo.split("/").slice(-1)[0];

            const ghrawrouter = `https://raw.githubusercontent.com/${ghuser}/${ghrepo}/${branch}/router.json`;

            const res = await fetch(ghrawrouter);
            if (res.status === 200) {
                let resBody = await res.json();
                if (!resBody) {
                    throw new Error("error.validation|Invalid json data");
                }
                if (resBody.routes === undefined) {
                    throw new Error("error.validation|Invalid json data");
                }
                const generatedSecret = new Bun.CryptoHasher("md5")
                    .update(
                        Math.random().toString(36).substring(2) + Date.now()
                    )
                    .digest("hex");
                const newConnection = new Connection();
                newConnection.domain_name = domain_name;
                newConnection.tld = tld;
                newConnection.github_repo = github_repo;
                newConnection.branch = branch;
                newConnection.router = resBody;
                newConnection.secret = await Bun.password.hash(generatedSecret);
                newConnection.isPrivate = isPrivate ?? false;
                if (!(await newConnection.save())) {
                    throw new Error("error.store|Failed to save connection");
                }
                return {
                    error: false,
                    name: "success",
                    message: "Service registered successfully",
                    data: {
                        domain_name,
                        tld,
                        secret: generatedSecret,
                        isPrivate: isPrivate ?? false,
                    },
                };
            } else {
                throw new Error(
                    "error.notfound|Invalid github repository url or router.json not found"
                );
            }
        } catch (err: any) {
            if (err.name === "MongoServerError" && err.code === 11000) {
                return {
                    error: true,
                    name: "error.duplicate",
                    message: "Domain name already exists",
                };
            }
            if (err.message.startsWith("error.")) {
                return {
                    error: true,
                    name: err.message.split("|")[0],
                    message: err.message.split("|")[1],
                };
            } else {
                return {
                    error: true,
                    name: "error.unidefined",
                    message: err.message,
                };
            }
        }
    }

    public async update(body: UpdateBody) {
        return {};
    }
}
