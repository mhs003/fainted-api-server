import { RegisterBody, UpdateBody } from "../Types";

export default class RegisterService {
    public async create(body: RegisterBody) {
        return { body };
    }

    public async update(body: UpdateBody) {
        return {};
    }
}
