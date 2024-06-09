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
    ServeQuery,
} from "./Types";
import { ConnectionService, ServeService } from "./Services";
import {
    ConnectionRegisterValidator,
    ConnectionUpdateValidator,
    ServeQueryValidator,
} from "./Validators";
import ContentTypes from "./ContentTypes";

const app = new Elysia()
    .decorate({
        ConnectionService: new ConnectionService(),
        ServeService: new ServeService(),
    })
    .get("/", () => "Dude! You found me? Sigh...")
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
    // .get(
    //     "/test-ct",
    //     ({ set }: { set: { headers: Record<string, string> } }) => {
    //         const type = ContentTypes.all().get("css");
    //         set.headers = {
    //             "content-type": type,
    //         };
    //         return { test: "<b>Hello, World!</b>", type };
    //     }
    // )
    .get("/search", () => {})
    .listen(3000);

console.log(
    `Fainted API Server is running at http://${app.server?.hostname}:${app.server?.port}`
);
