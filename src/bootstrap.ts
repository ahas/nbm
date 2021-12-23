import fs from "fs";
import { rootDir } from "./paths";
import colors from "colors";
import { program } from "commander";

declare global {
    interface String {
        get success(): string;
        get start(): string;
        get info(): string;
        get done(): string;
        get delete(): string;
        get error(): string;
        get warn(): string;
    }
}

export default () => {
    fs.mkdirSync(rootDir("templates"), { recursive: true });

    colors.setTheme({
        success: "brightGreen",
        start: "brightCyan",
        info: "brightCyan",
        done: "brightGreen",
        delete: "brightRed",
        error: "brightRed",
        warn: "brightYellow",
    });
    colors.enable();

    const pkg = require("../package.json");
    program.version(pkg.version);
    program.description("NBM node.js template manager");
    program.usage("[options] <args...>");
};
