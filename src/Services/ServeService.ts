import ContentTypes from "../ContentTypes";
import { ServeQuery } from "../Types";
import Connection from "../entities/connection.schema";
import { rtrim } from "../helpers/functions";
import Helpers, { FetchType } from "../helpers/helpers";
import pathHelper from "path";

export default class ServeService {
    public async serve(
        set: { headers: Record<string, string> },
        query: ServeQuery,
        error: any
    ) {
        try {
            const { domain_name, tld, path, router_group } = query;
            const connection = await Connection.findOne({
                domain_name,
                tld,
            });
            if (!connection) {
                throw new Error("error.noconnection|Connection not found");
            }
            const router = connection.router;
            const { github_repo, branch } = connection;
            const { ghuser, ghrepo } = Helpers.extractGhUri(github_repo);

            let currentRoutePath = "";
            const currentAllowedRouteGroups = [
                "routes",
                "css",
                "js",
                "images",
                "fonts",
            ];
            if (!currentAllowedRouteGroups.includes(router_group)) {
                throw new Error("error.wronggroup|Invalid router group");
            }
            currentRoutePath = router[router_group][path];
            if (
                currentRoutePath !== undefined &&
                currentRoutePath !== null &&
                currentRoutePath !== ""
            ) {
                const extension = pathHelper.extname(currentRoutePath).slice(1);
                const uri = Helpers.getGhRawFile(
                    ghuser,
                    ghrepo,
                    branch,
                    currentRoutePath
                );
                const serverBaseUrl =
                    rtrim(Helpers.SiteUrl(), "/") +
                    `/serve?domain_name=${domain_name}&tld=${tld}&router_group={group}&path={path}`;

                const res = await Helpers.fetch(
                    uri,
                    FetchType.RAW,
                    serverBaseUrl
                );
                set.headers = {
                    "content-type": ContentTypes.all().get(extension),
                };
                return res;
            } else {
                throw new Error("error.notfound|Route not found!!");
            }
        } catch (err: any) {
            return Helpers.makeErrorResponse(error, { message: err.message });
        }
    }
}
