import { resolve } from "path";

export function rootDir(...paths: string[]): string {
    return resolve(__dirname, "..", ...paths);
}
