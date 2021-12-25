#!/usr/bin/env node

import { program } from "commander";
import fs from "fs-extra";
import bootstrap from "./bootstrap";
import inquirer from "inquirer";
import { rootDir } from "./paths";
import { resolve } from "path";
import { excludeIgnoreFiles, inputIgnoreFiles, readIgnoreFile } from "./ignore";
import { printList } from "./list";
import { basename, dirname } from "path";
import glob from "glob";

bootstrap();

const cwd = process.cwd();

program.command("save [boilerplate]").action(async (boilerplate) => {
    const config = {
        name: "",
        ignore: [] as string[],
        destination: "",
    };

    // Check package.js exists
    if (!fs.existsSync("./package.json") && !fs.existsSync("nbm.js") && !fs.existsSync(".nbmignore")) {
        console.log("it is not seems to node.js or nbm project.".warn);

        const { proceed }: { proceed: boolean } = await inquirer.prompt({
            type: "confirm",
            name: "proceed",
            message: "keep going ?",
            default: false,
        });

        if (!proceed) {
            return;
        }
    }

    // Input boilerplate name
    do {
        const { name }: { name: string } = await inquirer.prompt({
            type: "input",
            name: "name",
            message: "please input your boilerplate name",
            default: boilerplate,
        });

        if (!name) {
            console.log("boilerplate name must not be empty".warn);
            continue;
        } else {
            config.destination = rootDir("boilerplates", name);
            if (fs.existsSync(config.destination)) {
                console.log(`boilerplate ${name} already exists`.warn);
                continue;
            }
        }
        config.name = name;
        break;
    } while (true);

    // Check .nbmignore
    if (fs.existsSync("./.nbmignore")) {
        config.ignore = readIgnoreFile();
    } else {
        console.log("there is no ignore file (.nbmignore)".warn);
        config.ignore = await inputIgnoreFiles();
    }
    const copyList = excludeIgnoreFiles(config.ignore);
    fs.mkdirSync(config.destination);

    for (const file of copyList) {
        if (basename(file) === ".nbmignore") {
            continue;
        }
        fs.copySync(resolve(cwd, file), resolve(config.destination, file), { recursive: true });
    }

    console.log(`saved boilerplate ${config.name} to ${rootDir()}`.success);
});

program.command("list").action(() => {
    printList();
});

function getBoilerplate(name_or_id: string): string | null {
    const id = +name_or_id;
    const name: string | undefined = name_or_id;

    const boilerplates = fs.readdirSync(rootDir("boilerplates"));
    let boilerplate: string | undefined;

    if (isNaN(id)) {
        boilerplate = boilerplates.find((x) => x == name);
        if (!boilerplate) {
            console.log(`boilerplate name ${name} does not exist`.warn);
            return null;
        }
    } else {
        boilerplate = boilerplates[id];
        if (!boilerplate) {
            console.log(`boilerplate id ${id} does not exist`.warn);
            return null;
        }
    }

    return rootDir("boilerplates", boilerplate);
}

program.command("remove <name_or_id>").action((name_or_id: string) => {
    const boilerplate = getBoilerplate(name_or_id);
    if (boilerplate) {
        console.log(`boilerplate ${name_or_id} has been removed`);
        fs.removeSync(boilerplate);
        printList();
    }
});

program.command("clone <name_or_id>").action(async (name_or_id) => {
    const boilerplate = getBoilerplate(name_or_id);

    if (!boilerplate) {
        return;
    }

    const emptyDir = fs.readdirSync(cwd).length == 0;
    if (!emptyDir) {
        console.log("it is not empty directory.".warn);

        const { proceed }: { proceed: boolean } = await inquirer.prompt({
            type: "confirm",
            name: "proceed",
            message: "are you sure you want to install ?",
            default: false,
        });

        if (!proceed) {
            return;
        }
    }

    try {
        for (const file of fs.readdirSync(boilerplate)) {
            if (basename(file) === "nbm.js") {
                continue;
            }
            fs.copySync(resolve(boilerplate, file), resolve(cwd, basename(file)));
        }

        const files = glob.sync("**/*", { cwd, dot: true, absolute: true });
        const configPath = rootDir(boilerplate, "nbm.js");

        if (fs.existsSync(configPath)) {
            const config = require(configPath);
            const vars = {} as any;

            for (const key in config.vars) {
                const { value } = await inquirer.prompt({
                    type: "input",
                    name: "value",
                    message: config.vars[key].message,
                    default: config.vars[key].default,
                });
                vars[key] = value;
            }

            for (const key in vars) {
                const regex = new RegExp("\\${nbm\\s+" + key + "}", "gi");
                console.log(`replace \${nbm ${key}} to ${vars[key]}`.info);
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    if (fs.lstatSync(file).isDirectory()) {
                        continue;
                    }
                    const text = fs.readFileSync(file).toString().replace(regex, vars[key]);
                    fs.writeFileSync(file, text);

                    const newFile = resolve(dirname(file), basename(file).replace(regex, vars[key])).replaceAll(
                        "\\",
                        "/",
                    );
                    if (file != newFile) {
                        files[i] = newFile;
                    }
                    fs.renameSync(file, newFile);
                }
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
});

program.parse(process.argv);
