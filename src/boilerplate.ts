import fs from "fs";
import { rootDir } from "./paths";

export function getBoilerplate(name_or_id: string): string | null {
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
