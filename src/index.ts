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
    .post(
        "/register-service",
        async ({
            RegisterService,
            body,
        }: {
            RegisterService: RegisterService;
            body: RegisterBody;
        }) => await RegisterService.create(body),
        {
            ...RegisterValidator,
        }
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
