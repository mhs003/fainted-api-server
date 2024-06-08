if (typeof Bun === "undefined") {
    throw new Error("This application only works with Bun runtime");
}

import { Elysia } from "elysia";
import TLDS from "./tlds";
import { ConnectionRegisterBody, ConnectionUpdateBody } from "./Types";
import ConnectionService from "./Services/ConnectionService";
import "./database/setup";
import {
    ConnectionRegisterValidator,
    ConnectionUpdateValidator,
} from "./Validators";

const app = new Elysia()
    .decorate({ ConnectionService: new ConnectionService() })
    .get("/", () => "Dude! You found me? Sigh...")
    .get("/available-tlds", () => TLDS)
    .guard(ConnectionRegisterValidator, (app) =>
        app.post(
            "/register-connection",
            async ({
                ConnectionService,
                body,
            }: {
                ConnectionService: ConnectionService;
                body: ConnectionRegisterBody;
            }) => await ConnectionService.create(body)
        )
    )
    .guard(ConnectionUpdateValidator, (app) =>
        app.post(
            "/update-connection",
            async ({
                ConnectionService,
                body,
            }: {
                ConnectionService: ConnectionService;
                body: ConnectionUpdateBody;
            }) => await ConnectionService.update(body)
        )
    )
    .get("/fetch", () => {}) // params: domain, tld, path+
    .get("/search", () => {})
    .listen(3000);

console.log(
    `Fainted API Server is running at http://${app.server?.hostname}:${app.server?.port}`
);
