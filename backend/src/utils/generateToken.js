import crypto from "crypto";

export function genToken() {
    return crypto.randomBytes(6).toString("hex");
}
