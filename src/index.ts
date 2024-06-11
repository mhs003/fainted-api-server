if (typeof Bun === "undefined") {
    throw new Error("This application only works with Bun runtime");
}

import { Elysia, t } from "elysia";
import TLDS from "./tlds";
import "./database/setup";
import {
    ConnectionFindBody,
    ConnectionRegisterBody,
    ConnectionUpdateBody,
    RouterRecacheBody,
    ServeQuery,
} from "./Types";
import {
    ConnectionService,
    SearchEngineService,
    ServeService,
} from "./Services";
import {
    ConnectionRegisterValidator,
    ConnectionUpdateValidator,
    RouterReloadValidator,
    ServeQueryValidator,
} from "./Validators";

const app = new Elysia()
    .decorate({
        ConnectionService: new ConnectionService(),
        ServeService: new ServeService(),
        SearchEngineService: new SearchEngineService(),
    })
    .get(
        "/",
        () =>
            "Dude! You found me? Sigh... MongoDB Url: " +
            process.env.MONGODB_URI
    )
    .get("/available-tlds", () => TLDS)
    .guard(ConnectionRegisterValidator, (app) =>
        app.post(
            "/register-connection",
            async ({
                ConnectionService,
                body,
                error,
            }: {
                ConnectionService: ConnectionService;
                body: ConnectionRegisterBody;
                error: any;
            }) => await ConnectionService.create(body, error)
        )
    )
    .guard(ConnectionUpdateValidator, (app) =>
        app.put(
            "/update-connection",
            async ({
                ConnectionService,
                body,
                error,
            }: {
                ConnectionService: ConnectionService;
                body: ConnectionUpdateBody;
                error: any;
            }) => await ConnectionService.update(body, error)
        )
    )
    .guard(
        {
            body: t.Object({
                secret: t.String({
                    error({ errors }) {
                        return {
                            error: true,
                            name: "error.validation",
                            message: errors[0].message,
                        };
                    },
                }),
            }),
        },
        (app) =>
            app.post(
                "/find-connection",
                async ({
                    ConnectionService,
                    body,
                    error,
                }: {
                    ConnectionService: ConnectionService;
                    body: ConnectionFindBody;
                    error: any;
                }) => await ConnectionService.find(body, error)
            )
    )
    .guard(RouterReloadValidator, (app) =>
        app.put(
            "/recache-routes",
            async ({
                ConnectionService,
                body,
                error,
            }: {
                ConnectionService: ConnectionService;
                body: RouterRecacheBody;
                error: any;
            }) => await ConnectionService.recacheRoutes(body, error)
        )
    )
    .guard(ServeQueryValidator, (app) =>
        app.get(
            "/serve",
            async ({
                set,
                ServeService,
                query,
                error,
            }: {
                set: { headers: Record<string, string> };
                ServeService: ServeService;
                query: ServeQuery;
                error: any;
            }) => await ServeService.serve(set, query, error)
        )
    )
    .guard(
        {
            body: t.Object({
                private_secret: t.String({
                    error({ errors }) {
                        return {
                            error: true,
                            name: "error.validation",
                            message: errors[0].message,
                        };
                    },
                }),
            }),
        },
        (app) =>
            app.post(
                "/store-seo-data",
                async ({
                    SearchEngineService,
                    body,
                    error,
                }: {
                    SearchEngineService: SearchEngineService;
                    body: { private_secret: string };
                    error: any;
                }) => await SearchEngineService.store_seo(body, error)
            )
    )
    .guard(
        {
            query: t.Object({
                q: t.String({
                    error({ errors }) {
                        return {
                            error: true,
                            name: "error.validation",
                            message: "Query is missing",
                        };
                    },
                }),
            }),
        },
        (app) =>
            app.get(
                "/search",
                async ({
                    SearchEngineService,
                    query,
                    error,
                }: {
                    SearchEngineService: SearchEngineService;
                    query: { q: string };
                    error: any;
                }) => await SearchEngineService.search(query, error)
            )
    )
    .listen(3000);

console.log(
    `Fainted API Server is running on http://${app.server?.hostname}:${app.server?.port}`
);
