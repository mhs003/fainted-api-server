import { RouterType } from "../Types";
import TLDS from "../tlds";

export enum FetchType {
    RAW,
    JSON,
}

export default class Helpers {
    public static SiteUrl(
        defaultUrl: string = "http://localhost:4000"
    ): string {
        return process.env.SITE_URL ? process.env.SITE_URL : defaultUrl;
    }

    public static async sleep(ms: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    public static extractGhUri(github_repo: string): {
        ghuser: string;
        ghrepo: string;
    } {
        const ghuser = github_repo.split("/").slice(-2)[0];
        const ghrepo = github_repo.split("/").slice(-1)[0];
        return { ghuser, ghrepo };
    }

    public static getGhRepoUri(ghuser: string, ghrepo: string): string {
        return `https://github.com/${ghuser}/${ghrepo}`;
    }

    public static getGhRawRouterUri(
        ghuser: string,
        ghrepo: string,
        branch: string
    ): string {
        return Helpers.getGhRawFile(ghuser, ghrepo, branch, "router.json");
    }

    public static getGhRawFile(
        ghuser: string,
        ghrepo: string,
        branch: string,
        path: string
    ): string {
        path = !path.startsWith("/") ? path : path.slice(1);
        return `https://raw.githubusercontent.com/${ghuser}/${ghrepo}/${branch}/${path}`;
    }

    public static async fetch(
        url: string,
        type: FetchType,
        serverBaseUrl: string
    ): Promise<string | void | RouterType> {
        const res = await fetch(url);
        if (res.status === 200) {
            if (type === FetchType.JSON) {
                let resBody = await res.json();
                if (resBody) {
                    return resBody;
                } else {
                    throw new Error("error.wrongresponse|Invalid JSON data");
                }
            } else if (type === FetchType.RAW) {
                let resBody = await res.text();
                if (resBody) {
                    return Helpers.replaceGroup(resBody, serverBaseUrl);
                } else {
                    throw new Error("error.wrongresponse|Invalid text data");
                }
            } else {
                throw new Error("error.validation|Invalid fetch type");
            }
        } else {
            throw new Error("error.notfound|Resource not found");
        }
    }

    public static replaceGroup(data: string, baseUrl: string): string {
        var pattern = /@\{\s*(.*?)\s*\|\s*(.*?)\s*\}@/g;

        return data.replace(pattern, (match, group, path) => {
            return baseUrl
                .replace("{group}", group)
                .replace("{path}", encodeURIComponent(path));
        });
    }

    public static checkValidTld(tld: string, isPrivate: boolean): boolean {
        if (isPrivate) {
            return TLDS.private.includes(tld) || TLDS.public.includes(tld);
        } else {
            return TLDS.public.includes(tld);
        }
    }

    public static makeErrorResponse(
        error: any,
        errBody: { message: string }
    ): any {
        const errSerials: Record<string, number> = {
            "error.validation": 400,
            "error.duplicate": 409,
            "error.notfound": 404,
            "error.noconnection": 404,
            "error.wronggroup": 404,
            "error.wrongresponse": 500,
            "error.nochanges": 204,
            "error.unidentified": 500,
        };
        if (errBody.message.startsWith("error.")) {
            const err_name = errBody.message.split("|")[0];
            const err_message = errBody.message.split("|")[1];
            return error(errSerials[err_name] ?? 500, {
                error: true,
                name: err_name,
                message: err_message,
            });
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
    ): Promise<{ error: boolean; msg: string } | Function> {
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
