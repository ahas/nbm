import fs from "fs-extra";
import { resolve } from "path";
import inquirer from "inquirer";
import glob from "glob";

const cwd = process.cwd();

export function readIgnoreFile(filename: string = ".nbmignore"): string[] {
    return fs
        .readFileSync(resolve(cwd, filename))
        .toString()
        .split("\n")
        .map((x) => x.trim())
        .filter((x) => !x.startsWith("#") && !!x);
}

export async function inputIgnoreFiles(): Promise<string[]> {
    let ignoreList: string[];
    do {
        const { text }: { text: string } = await inquirer.prompt({
            type: "input",
            name: "text",
            message: "input files will be ingored",
            default: "",
        });
        ignoreList = text.split(/\s|,/).filter((x) => x.trim().length > 0);

        if (ignoreList.length > 0) {
            console.log("you ignored files below".warn);
            for (const file of ignoreList) {
                console.log(file);
            }

            const { proceed }: { proceed: boolean } = await inquirer.prompt({
                type: "confirm",
                name: "proceed",
                message: "are you sure ?",
                default: false,
            });

            if (proceed) {
                break;
            }
        }
    } while (true);

    return ignoreList;
}

export function excludeIgnoreFiles(ignoreList: string[]) {
    const ignoreFiles: string[] = [];
    for (const ignore of ignoreList) {
        ignoreFiles.push(...glob.sync(ignore, { cwd, dot: true, absolute: true }));
    }
    const files = glob.sync("**/*", { cwd, dot: true, absolute: true });
    for (const ignoreFile of ignoreFiles) {
        for (let i = files.length - 1; i >= 0; i--) {
            const file = files[i];
            if (file.startsWith(ignoreFile)) {
                files.splice(i, 1);
            }
        }
    }

    return fs.readdirSync(cwd).filter((x) => !ignoreList.find((y) => y == x));
}
