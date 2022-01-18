import { resolve } from "path";

const cwd = process.cwd();

export { cwd };

export function rootDir(...paths: string[]): string {
    return resolve(__dirname, "..", ...paths);
}
