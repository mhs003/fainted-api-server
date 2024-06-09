import TLDS from "../tlds";

export default class Helpers {
    public static async sleep(ms: number) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    public static extractGhUri(github_repo: string) {
        const ghuser = github_repo.split("/").slice(-2)[0];
        const ghrepo = github_repo.split("/").slice(-1)[0];
        return { ghuser, ghrepo };
    }

    public static getGhRepoUri(ghuser: string, ghrepo: string) {
        return `https://github.com/${ghuser}/${ghrepo}`;
    }

    public static getGhRawRouterUri(
        ghuser: string,
        ghrepo: string,
        branch: string
    ) {
        return Helpers.getGhRawFile(ghuser, ghrepo, branch, "router.json");
    }

    public static getGhRawFile(
        ghuser: string,
        ghrepo: string,
        branch: string,
        path: string
    ) {
        path = !path.startsWith("/") ? path : path.slice(1);
        return `https://raw.githubusercontent.com/${ghuser}/${ghrepo}/${branch}/${path}`;
    }

    public static checkValidTld(tld: string, isPrivate: boolean) {
        if (isPrivate) {
            return TLDS.private.includes(tld) || TLDS.public.includes(tld);
        } else {
            return TLDS.public.includes(tld);
        }
    }

    public static makeErrorResponse(error: any, errBody: { message: string }) {
        if (errBody.message.startsWith("error.")) {
            const err_name = errBody.message.split("|")[0];
            const err_message = errBody.message.split("|")[1];
            if (err_name === "error.validation") {
                return error(400, {
                    error: true,
                    name: err_name,
                    message: err_message,
                });
            } else if (err_name === "error.duplicate") {
                return error(409, {
                    error: true,
                    name: err_name,
                    message: err_message,
                });
            } else if (err_name === "error.notfound") {
                return error(404, {
                    error: true,
                    name: err_name,
                    message: err_message,
                });
            } else if (err_name === "error.noconnection") {
                return error(404, {
                    error: true,
                    name: err_name,
                    message: err_message,
                });
            } else {
                return error(500, {
                    error: true,
                    name: err_name,
                    message: err_message,
                });
            }
        } else {
            return error(500, {
                error: true,
                name: "error.unidentified",
                message: errBody.message,
            });
        }
    }

    public static async softValidateRouter(
        ghRawRouterUri: string,
        callback: Function
    ) {
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
}
