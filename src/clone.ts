import fs from "fs-extra";
import { rootDir, cwd } from "./paths";
import { getBoilerplate } from "./boilerplate";
import { resolve, basename, dirname } from "path";
import glob from "glob";
import inquirer from "inquirer";

interface NbmConfig {
    vars: Record<string, any>;
}

async function checkEmptyDirectory() {
    const emptyDir = fs.readdirSync(cwd).length == 0;
    if (!emptyDir) {
        console.log("It is not empty directory.".warn);

        const { proceed }: { proceed: boolean } = await inquirer.prompt({
            type: "confirm",
            name: "proceed",
            message: "are you sure you want to install ?",
            default: false,
        });

        if (!proceed) {
            return false;
        }
    }
    return true;
}

function copyFilesExcludeNbmConfig(boilerplate: string) {
    for (const file of fs.readdirSync(boilerplate)) {
        if (basename(file) === "nbm.js") {
            continue;
        }
        fs.copySync(resolve(boilerplate, file), resolve(cwd, basename(file)));
    }
}

function readConfig(boilerplate: string) {
    const configPath = rootDir(boilerplate, "nbm.js");
    if (fs.existsSync(configPath)) {
        return require(configPath);
    }
    return null;
}

async function readUserValues(config: NbmConfig) {
    const values = {} as any;

    for (const key in config.vars) {
        const { value } = await inquirer.prompt({
            type: "input",
            name: "value",
            message: config.vars[key].message,
            default: config.vars[key].default,
        });
        values[key] = value;
    }

    return values;
}

function getFiles() {
    return glob.sync("**/*", { cwd, dot: true, absolute: true });
}

export async function clone(name_or_id: any) {
    const boilerplate = getBoilerplate(name_or_id);

    if (!boilerplate) {
        return;
    }

    if (!checkEmptyDirectory()) {
        return;
    }

    try {
        copyFilesExcludeNbmConfig(boilerplate);
        const config = readConfig(boilerplate);

        if (config) {
            const userValues = await readUserValues(config);
            const files = getFiles();

            const regex = /nbm\s*\{(.*?)\}/g;
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (fs.lstatSync(file).isDirectory()) {
                    continue;
                }
                let text = fs.readFileSync(file).toString();
                let result: RegExpExecArray | null;
                while ((result = regex.exec(text)) !== null) {
                    const startIndex = regex.lastIndex - result[0].length;
                    const endIndex = regex.lastIndex - 1;
                    const value = userValues.vars[result[2]];
                    const newText = text.substring(0, startIndex) + value + text.substring(endIndex);
                    text = newText;
                }
                fs.writeFileSync(file, text);
            }

            for (let i = 0; i < files.length; i++) {
                let file = files[i];
                let result: RegExpExecArray | null;
                while ((result = regex.exec(file)) !== null) {
                    const startIndex = regex.lastIndex - result[0].length;
                    const endIndex = regex.lastIndex - 1;
                    const value = userValues.vars[result[2]];
                    const newFile = file.substring(0, startIndex) + value + file.substring(endIndex);
                    file = newFile;
                }
                fs.renameSync(files[i], file);
            }
        }

        console.log("cloned".success);
    } catch (e) {
        console.error(e);
        for (const file of fs.readdirSync(cwd)) {
            fs.removeSync(resolve(cwd, file));
        }
        console.log("canceled".success);
    }
}
