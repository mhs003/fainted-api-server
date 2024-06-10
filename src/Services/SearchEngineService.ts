import Connection from "../entities/connection.schema";
import Helpers from "../helpers/helpers";

export default class SearchEngineService {
    public async store_seo(body: { private_secret: string }, error: any) {
        const { private_secret } = body;
        try {
            if (private_secret !== process.env.PRIVATE_SECRET) {
                throw new Error("error.validation|Invalid private secret");
            }
            const allConnections = await Connection.find().select(
                "domain_name tld router.routes github_repo branch -_id"
            );

            allConnections.forEach((element) => {
                const domain = `${element.domain_name}.${element.tld}`;
                const { ghuser, ghrepo } = Helpers.extractGhUri(
                    element.github_repo
                );
                console.log({
                    domain,
                    ghuser,
                    ghrepo,
                });
                const routes = element.router.routes;

                // TODO: complete these implementations
                let RouteRecord = new Map<string, Object>();

                Object.keys(routes).forEach((key) => {
                    RouteRecord.set(domain + key, {
                        ar: routes[key],
                        data: "data",
                    });
                    // console.log(key, "=>", routes[key]);
                });
                console.log(RouteRecord);
            });
        } catch (err: any) {
            return Helpers.makeErrorResponse(error, { message: err.message });
        }
    }
}
