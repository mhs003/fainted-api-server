import { ServeQuery } from "../Types";
import Connection from "../entities/connection.schema";
import Helpers from "../helpers/helpers";

export default class ServeService {
    public async serve(query: ServeQuery, error: any) {
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

            // TODO: Complete these implementations >>
            if (router_group === "routes") {
                if (router.routes[path]) {
                }
            } else if (router_group === "css") {
            } else if (router_group === "js") {
            } else if (router_group === "images") {
            } else if (router_group === "fonts") {
            } else {
            }
            // <<

            const uri = Helpers.getGhRawFile(ghuser, ghrepo, branch, path);
            return {
                error: false,
                name: "success",
                message: "Serving file",
                data: {
                    uri,
                },
            };
        } catch (err: any) {
            return Helpers.makeErrorResponse(error, { message: err.message });
        }
    }
}
