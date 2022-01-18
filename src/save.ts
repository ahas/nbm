import inquirer from "inquirer";
import fs from "fs-extra";
import { resolve, basename } from "path";
import { excludeIgnoreFiles, inputIgnoreFiles, readIgnoreFile } from "./ignore";
import { rootDir, cwd } from "./paths";

export async function save(boilerplate: string) {
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
}
