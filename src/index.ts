if (typeof Bun === "undefined") {
    throw new Error("This application only works with Bun runtime");
}

import { Elysia } from "elysia";
import TLDS from "./tlds";
import { RegisterBody, UpdateBody } from "./Types";
import RegisterValidator from "./Validators/RegisterValidator";
import RegisterService from "./Services/RegisterService";
import UpdateValidator from "./Validators/UpdateValidator";
import "./database/setup";

const app = new Elysia()
    .decorate({ RegisterService: new RegisterService() })
    .get("/", () => "Dude! You found me? Sigh...")
    .get("/available-tlds", () => TLDS)
    .guard(RegisterValidator, (app) =>
        app.post(
            "/register-service",
            async ({
                RegisterService,
                body,
            }: {
                RegisterService: RegisterService;
                body: RegisterBody;
            }) => await RegisterService.create(body) /* ,
            {
                error({ code, error }) {
                    console.log("---");
                    console.log({ code, error });
                },
            } */
        )
    )
    .post(
        "/update-service",
        async ({
            RegisterService,
            body,
        }: {
            RegisterService: RegisterService;
            body: UpdateBody;
        }) => await RegisterService.update(body),
        {
            ...UpdateValidator,
        }
    )
    .get("/serve/{domain}/{tld}", () => {})
    .get("/search", () => {})
    .listen(3000);

console.log(
    `Fainted API Server is running at http://${app.server?.hostname}:${app.server?.port}`
);
