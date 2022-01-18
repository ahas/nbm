import fs from "fs-extra";
import { getBoilerplate } from "./boilerplate";
import { printList } from "./list";

export function remove(name_or_id: string) {
    const boilerplate = getBoilerplate(name_or_id);
    if (boilerplate) {
        console.log(`boilerplate ${name_or_id} has been removed`);
        fs.removeSync(boilerplate);
        printList();
    }
}
