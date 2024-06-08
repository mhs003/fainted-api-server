import {
    ConnectionFindBody,
    ConnectionRegisterBody,
    ConnectionUpdateBody,
} from "../Types";
import Connection from "../entities/connection.schema";
import TLDS from "../tlds";

export default class ConnectionService {
    public async create(body: ConnectionRegisterBody) {
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

            if (!this.checkValidTld(tld, isPrivate ?? false)) {
                throw new Error("error.validation|Invalid TLD");
            }

            const existingConnection = await Connection.findOne({
                domain_name,
                tld,
            });

            if (existingConnection) {
                throw new Error("error.duplicate|Domain name already exists");
            }

            const { ghuser, ghrepo } = this.extractGhUri(github_repo);

            const ghrawrouter = this.getGhRawRouterUri(ghuser, ghrepo, branch);

            //  ---------------------------------------------
            const routerRes = await this.getRoutes(
                ghrawrouter,
                async (resBody: any) => {
                    const generatedSecret = new Bun.CryptoHasher("md5")
                        .update(
                            Math.random().toString(36).substring(2) + Date.now()
                        )
                        .digest("hex");
                    const newConnection = new Connection();
                    newConnection.domain_name = domain_name;
                    newConnection.tld = tld;
                    newConnection.github_repo = this.getGhRepoUri(
                        ghuser,
                        ghrepo
                    );
                    newConnection.branch = branch;
                    newConnection.router = resBody;
                    newConnection.secret = generatedSecret;
                    newConnection.isPrivate = isPrivate ?? false;
                    if (!(await newConnection.save())) {
                        throw new Error(
                            "error.store|Failed to save connection"
                        );
                    }
                    return {
                        error: false,
                        name: "success",
                        message: "Connection registered successfully",
                        data: {
                            domain_name,
                            tld,
                            secret: generatedSecret,
                            isPrivate,
                        },
                    };
                }
            );

            if (routerRes.error) {
                throw new Error(routerRes.msg);
            } else {
                return routerRes;
            }
            //  ---------------------------------------------

            /* const res = await fetch(ghrawrouter);
            if (res.status === 200) {
                let resBody = await res.json();
                console.log(ghrawrouter, resBody);
                if (!resBody) {
                    throw new Error(
                        "error.validation|router.json contains invalid data"
                    );
                }
                if (resBody.routes === undefined) {
                    throw new Error(
                        "error.validation|There are no `routes` object in router.json"
                    );
                }

                if (typeof resBody.routes !== "object") {
                    throw new Error(
                        "error.validation|`routes` property must be an object in router.json"
                    );
                }
                if (resBody.routes["/"] === undefined) {
                    throw new Error(
                        "error.validation|There is no `/` route in router.json"
                    );
                }

                const generatedSecret = new Bun.CryptoHasher("md5")
                    .update(
                        Math.random().toString(36).substring(2) + Date.now()
                    )
                    .digest("hex");
                const newConnection = new Connection();
                newConnection.domain_name = domain_name;
                newConnection.tld = tld;
                newConnection.github_repo = this.getGhRepoUri(ghuser, ghrepo);
                newConnection.branch = branch;
                newConnection.router = resBody;
                newConnection.secret = generatedSecret;
                newConnection.isPrivate = isPrivate ?? false;
                if (!(await newConnection.save())) {
                    throw new Error("error.store|Failed to save connection");
                }
                return {
                    error: false,
                    name: "success",
                    message: "Connection registered successfully",
                    data: {
                        domain_name,
                        tld,
                        secret: generatedSecret,
                        isPrivate,
                    },
                };
            } else {
                throw new Error(
                    "error.notfound|Repository does not exists or router.json file not found"
                );
            } */
        } catch (err: any) {
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

    public async update(body: ConnectionUpdateBody) {
        const {
            id,
            domain_name,
            github_repo,
            branch,
            isPrivate,
            secret,
            private_secret,
        } = body;
        try {
            if (private_secret && isPrivate) {
                if (private_secret !== process.env.PRIVATE_SECRET) {
                    throw new Error("error.validation|Invalid private secret");
                }
            }

            const { ghuser, ghrepo } = this.extractGhUri(github_repo);
            // const ghrepouri = this.getGhRepoUri(ghuser, ghrepo);

            const existingConnection = await Connection.findOne({
                _id: id,
                secret,
            });
            if (!existingConnection) {
                throw new Error("error.notfound|Connection not found");
            }

            const domainExists = await Connection.findOne({
                domain_name,
                tld: existingConnection.tld,
            });

            if (domainExists && domainExists.id !== id) {
                throw new Error("error.duplicate|Domain name already exists");
            }

            const ghrawrouter = this.getGhRawRouterUri(ghuser, ghrepo, branch);

            const routerRes = await this.getRoutes(
                ghrawrouter,
                async (resBody: any) => {
                    existingConnection.domain_name = domain_name;
                    existingConnection.github_repo = this.getGhRepoUri(
                        ghuser,
                        ghrepo
                    );
                    existingConnection.branch = branch;
                    existingConnection.router = resBody;
                    existingConnection.isPrivate = isPrivate ?? false;
                    if (!(await existingConnection.save())) {
                        throw new Error(
                            "error.store|Failed to save connection"
                        );
                    }
                    return {
                        error: false,
                        name: "success",
                        message: "Connection updated successfully",
                        data: {
                            domain_name,
                            tld: existingConnection.tld,
                            isPrivate,
                        },
                    };
                }
            );

            if (routerRes.error) {
                throw new Error(routerRes.msg);
            } else {
                return routerRes;
            }
        } catch (err: any) {
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

    public async find(body: ConnectionFindBody) {
        const { secret } = body;
        try {
            const existingConnection = await Connection.findOne({
                secret,
            });
            if (!existingConnection) {
                throw new Error("error.notfound|Connection not found");
            }

            return {
                error: false,
                name: "success",
                message: "Connection found",
                data: {
                    id: existingConnection._id,
                    domain_name: existingConnection.domain_name,
                    tld: existingConnection.tld,
                    github_repo: existingConnection.github_repo,
                    branch: existingConnection.branch,
                    isPrivate: existingConnection.isPrivate,
                    router: existingConnection.router,
                },
            };
        } catch (err: any) {
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

    // Private methods

    private extractGhUri(github_repo: string) {
        const ghuser = github_repo.split("/").slice(-2)[0];
        const ghrepo = github_repo.split("/").slice(-1)[0];
        return { ghuser, ghrepo };
    }

    private getGhRepoUri(ghuser: string, ghrepo: string) {
        return `https://github.com/${ghuser}/${ghrepo}`;
    }

    private getGhRawRouterUri(ghuser: string, ghrepo: string, branch: string) {
        return `https://raw.githubusercontent.com/${ghuser}/${ghrepo}/${branch}/router.json`;
    }

    private async getRoutes(ghRawRouterUri: string, callback: Function) {
        const res = await fetch(ghRawRouterUri);

        if (res.status === 200) {
            let resBody = await res.json();

            if (!resBody) {
                return {
                    error: true,
                    msg: "error.validation|router.json contains invalid data",
                };
            }
            if (resBody.routes === undefined) {
                return {
                    error: true,
                    msg: "error.validation|There are no `routes` object in router.json",
                };
            }

            if (typeof resBody.routes !== "object") {
                return {
                    error: true,
                    msg: "error.validation|`routes` property must be an object in router.json",
                };
            }
            if (resBody.routes["/"] === undefined) {
                return {
                    error: true,
                    msg: "error.validation|There is no `/` route in router.json",
                };
            }

            return await callback(resBody);
        } else {
            return {
                error: true,
                msg: "error.notfound|Repository does not exists or router.json file not found",
            };
        }
    }

    private checkValidTld(tld: string, isPrivate: boolean) {
        if (isPrivate) {
            return TLDS.private.includes(tld) || TLDS.public.includes(tld);
        } else {
            return TLDS.public.includes(tld);
        }
    }
}
