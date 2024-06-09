import {
    ConnectionFindBody,
    ConnectionRegisterBody,
    ConnectionUpdateBody,
    RouterRecacheBody,
} from "../Types";
import Connection from "../entities/connection.schema";
import Helpers from "../helpers/helpers";

export default class ConnectionService {
    public async create(body: ConnectionRegisterBody, error: any) {
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

            if (!Helpers.checkValidTld(tld, isPrivate ?? false)) {
                throw new Error("error.validation|Invalid TLD");
            }

            const existingConnection = await Connection.findOne({
                domain_name,
                tld,
            });

            if (existingConnection) {
                throw new Error("error.duplicate|Domain name already exists");
            }

            const { ghuser, ghrepo } = Helpers.extractGhUri(github_repo);

            const ghrawrouter = Helpers.getGhRawRouterUri(
                ghuser,
                ghrepo,
                branch
            );

            const routerRes = await Helpers.softValidateRouter(
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
                    newConnection.github_repo = Helpers.getGhRepoUri(
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
        } catch (err: any) {
            return Helpers.makeErrorResponse(error, { message: err.message });
        }
    }

    public async update(body: ConnectionUpdateBody, error: any) {
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

            const { ghuser, ghrepo } = Helpers.extractGhUri(github_repo);
            // const ghrepouri = Helpers.getGhRepoUri(ghuser, ghrepo);

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

            const ghrawrouter = Helpers.getGhRawRouterUri(
                ghuser,
                ghrepo,
                branch
            );

            const routerRes = await Helpers.softValidateRouter(
                ghrawrouter,
                async (resBody: any) => {
                    existingConnection.domain_name = domain_name;
                    existingConnection.github_repo = Helpers.getGhRepoUri(
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
            return Helpers.makeErrorResponse(error, { message: err.message });
        }
    }

    public async find(body: ConnectionFindBody, error: any) {
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
            return Helpers.makeErrorResponse(error, { message: err.message });
        }
    }

    public async recacheRoutes(body: RouterRecacheBody, error: any) {
        const { isPrivate, secret, private_secret } = body;
        try {
            if (private_secret && isPrivate) {
                if (private_secret !== process.env.PRIVATE_SECRET) {
                    throw new Error("error.validation|Invalid private secret");
                }
            }

            const existingConnection = await Connection.findOne({
                secret,
                isPrivate: isPrivate ?? false,
            });
            if (!existingConnection) {
                throw new Error(
                    "error.notfound|There are no connection with the secret"
                );
            }
            const { ghuser, ghrepo } = Helpers.extractGhUri(
                existingConnection.github_repo
            );

            const ghrawrouter = Helpers.getGhRawRouterUri(
                ghuser,
                ghrepo,
                existingConnection.branch
            );

            const routerRes = await Helpers.softValidateRouter(
                ghrawrouter,
                async (resBody: any) => {
                    const jsonOfOldData = JSON.stringify(
                        existingConnection.router
                    );
                    const jsonOfNewData = JSON.stringify(resBody);
                    if (jsonOfOldData === jsonOfNewData) {
                        throw new Error(
                            "error.nochanges|No changes in the router"
                        );
                    } else {
                        existingConnection.router = resBody;
                        if (!(await existingConnection.save())) {
                            throw new Error(
                                "error.store|Failed to save connection"
                            );
                        }
                        return {
                            error: false,
                            name: "success",
                            message: "Routes recached successfully",
                            data: {
                                domain_name: existingConnection.domain_name,
                                tld: existingConnection.tld,
                                router: resBody,
                                isPrivate,
                            },
                        };
                    }
                }
            );
            if (routerRes.error) {
                throw new Error(routerRes.msg);
            } else {
                return routerRes;
            }
        } catch (err: any) {
            return Helpers.makeErrorResponse(error, { message: err.message });
        }
    }
}
