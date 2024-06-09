import { t } from "elysia";

const ServeQueryValidator = {
    query: t.Object({
        domain_name: t.String({
            error: {
                error: true,
                name: "error.missing",
                message: "Domain name is missing in query",
            },
        }),
        tld: t.String({
            error: {
                error: true,
                name: "error.missing",
                message: "TLD is missing in query",
            },
        }),
        path: t.String({
            error: {
                error: true,
                name: "error.missing",
                message: "Path is missing in query",
            },
        }),
        router_group: t.String({
            error: {
                error: true,
                name: "error.missing",
                message: "Route type is missing in query",
            },
        }),
    }),
};

export default ServeQueryValidator;
