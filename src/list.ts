import Table from "cli-table";
import fs from "fs-extra";
import { rootDir } from "./paths";
import moment from "moment";

export function printList() {
    const table = new Table();
    table.push(["id", "name", "modified"]);

    const boilerplates = fs.readdirSync(rootDir("boilerplates"));
    if (boilerplates.length == 0) {
        console.log("No saved boilerplates".warn);
        return;
    }

    for (const [id, boilerplate] of boilerplates.entries()) {
        const mtime = fs.statSync(rootDir("boilerplates", boilerplate)).mtime;
        table.push([id, boilerplate, moment(mtime).format("YYYY-MM-DD HH:mm:ss")]);
    }

    console.log(table.toString());
}
