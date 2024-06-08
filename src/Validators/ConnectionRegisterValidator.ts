import { t } from "elysia";

const ConnectionRegisterValidator = {
    body: t.Object({
        domain_name: t.String({
            minLength: 3,
            maxLength: 12,
            pattern:
                "^(?!.*\\..*)(?!.*[^a-zA-Z0-9_-])(?!.*[_-]$)(?!^[_-])(?!^\\d+$)(?=.*[a-zA-Z])[a-zA-Z0-9_-]+$",
            error({ errors }) {
                return {
                    error: true,
                    name: "error.validation",
                    message:
                        String(errors[0].value).length < 3 ||
                        String(errors[0].value).length > 12
                            ? "Domain name length must be between 3 to 12 characters long"
                            : "Invalid domain name",
                };
            },
        }),
        tld: t.String(),
        github_repo: t.String({
            pattern: "^https?://github.com/[a-zA-Z0-9._-]+/[a-zA-Z0-9._-]+/?$",
            error: {
                error: true,
                name: "error.validation",
                message: "Invalid github repository url",
            },
        }),
        branch: t.String({
            minLength: 2,
            pattern: "^[a-zA-Z0-9_]+$",
            error: {
                error: true,
                name: "error.validation",
                message: "Invalid branch name",
            },
        }),
        isPrivate: t.Optional(t.Boolean()),
        private_secret: t.Optional(t.String()),
    }),
};

export default ConnectionRegisterValidator;
