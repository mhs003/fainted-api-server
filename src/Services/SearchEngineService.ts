import Connection from "../entities/connection.schema";
import SEO from "../entities/seo.schema";
import { rtrim } from "../helpers/functions";
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

            let round = 0;
            await SEO.deleteMany({});
            for await (const connection of allConnections) {
                const domain = `${connection.domain_name}.${connection.tld}`;
                const { ghuser, ghrepo } = Helpers.extractGhUri(
                    connection.github_repo
                );

                const routes = connection.router.routes;

                let RouteRecord: Map<string, Object> = new Map<
                    string,
                    Object
                >();
                const serverBaseUrl =
                    rtrim(Helpers.SiteUrl(), "/") +
                    `/serve?domain_name=${connection.domain_name}&tld=${connection.tld}&router_group={group}&path={path}`;

                for await (const key of Object.keys(routes)) {
                    const uri = Helpers.getGhRawFile(
                        ghuser,
                        ghrepo,
                        connection.branch,
                        routes[key]
                    );
                    const data = await Helpers.fetchSeoData(uri, serverBaseUrl);
                    RouteRecord.set(domain + key, {
                        api_point:
                            rtrim(Helpers.SiteUrl(), "/") +
                            `/serve?domain_name=${connection.domain_name}&tld=${connection.tld}&router_group=routes&path=${key}`,
                        data,
                    });
                }
                console.log(
                    "-----------------------------------------------------"
                );
                // TODO: Complete these implementation, the RouteRecord is not being saved to the database
                const seo = await new SEO({
                    domain,
                    seo_data: RouteRecord.values(),
                }).save();
                if (!seo) {
                    throw new Error("error.validation|Invalid SEO data");
                }
                round++;
            }
            return { message: "SEO data stored successfully", round };
        } catch (err: any) {
            console.log(err.message);
            return Helpers.makeErrorResponse(error, { message: err.message });
        }
    }
}
