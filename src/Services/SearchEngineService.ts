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
                "domain_name tld router.routes github_repo branch"
            );

            let round = 0;
            await SEO.deleteMany({});
            for await (const connection of allConnections) {
                let homePageTitle: string | Object | undefined;
                const domain = `${connection.domain_name}.${connection.tld}`;
                const { ghuser, ghrepo } = Helpers.extractGhUri(
                    connection.github_repo
                );

                const routes = connection.router.routes;

                let RouteRecord: Map<string, Object> = new Map<
                    string,
                    Object
                >();
                let SeoTextRecord: Array<Object> = [];
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
                    if (data && data.size > 0) {
                        if (key === "/") {
                            homePageTitle = data.get("title");
                        }
                        SeoTextRecord.push(Object.fromEntries(data));
                        RouteRecord.set(key, {
                            api_point:
                                rtrim(Helpers.SiteUrl(), "/") +
                                `/serve?domain_name=${connection.domain_name}&tld=${connection.tld}&router_group=routes&path=${key}`,
                            data,
                        });
                    }
                }

                const seo = await new SEO({
                    domain,
                    title:
                        typeof homePageTitle === "string"
                            ? homePageTitle
                            : domain,
                    api_point: serverBaseUrl
                        .replace("{group}", "routes")
                        .replace("{path}", "/"),
                    seo_data: RouteRecord,
                    seo_text: JSON.stringify(SeoTextRecord)
                        .replace(/"/g, " ")
                        .replace(/'/g, " ")
                        .replace(/,/g, " | ")
                        .replace(/\[/g, " ")
                        .replace(/\]/g, " ")
                        .replace(/\{/g, " ")
                        .replace(/\}/g, " ")
                        .replace(/\s\s+/g, " ")
                        .trim(),
                }).save();
                if (!seo) {
                    throw new Error("error.validation|Invalid SEO data");
                }
                round++;
            }
            return { message: "SEO data stored successfully", round };
        } catch (err: any) {
            return Helpers.makeErrorResponse(error, { message: err.message });
        }
    }

    public async search(query: { q: string }, error: any) {
        const { q } = query;
        try {
            if (q === "__show_all_domains__") {
                const seo = await SEO.find({});

                Helpers.shuffleArray(seo);

                const response = seo.map((s) => {
                    return {
                        domain: s.domain,
                        title: s.title,
                        api_point: s.api_point,
                    };
                });

                return { error: false, data: response };
            } else {
                const regex = new RegExp(q, "i");

                const seo = await SEO.find({
                    $or: [
                        { domain: { $regex: regex } },
                        { seo_text: { $regex: regex } },
                    ],
                });

                const response = seo.map((s) => {
                    return {
                        domain: s.domain,
                        title: s.title,
                        api_point: s.api_point,
                    };
                });
                return { error: false, data: response };
            }
        } catch (err: any) {
            return Helpers.makeErrorResponse(error, { message: err.message });
        }
    }
}
