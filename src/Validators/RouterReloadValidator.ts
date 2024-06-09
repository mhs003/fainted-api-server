import { t } from "elysia";

const RouterReloadValidator = {
    body: t.Object({
        isPrivate: t.Optional(
            t.Boolean({
                error({ errors }) {
                    return {
                        error: true,
                        name: "error.validation",
                        message: errors[0].message,
                    };
                },
            })
        ),
        secret: t.String({
            error({ errors }) {
                return {
                    error: true,
                    name: "error.validation",
                    message: errors[0].message,
                };
            },
        }),
        private_secret: t.Optional(
            t.String({
                error({ errors }) {
                    return {
                        error: true,
                        name: "error.validation",
                        message: errors[0].message,
                    };
                },
            })
        ),
    }),
};

export default RouterReloadValidator;
