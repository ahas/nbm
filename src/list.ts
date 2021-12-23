import Table from "cli-table";
import fs from "fs-extra";
import { rootDir } from "./paths";
import moment from "moment";

export function printList() {
    const table = new Table();
    table.push(["id", "name", "modified"]);

    const templates = fs.readdirSync(rootDir("templates"));
    if (templates.length == 0) {
        console.log("empty".warn);
        return;
    }

    for (const [id, template] of templates.entries()) {
        const mtime = fs.statSync(rootDir("templates", template)).mtime;
        table.push([id, template, moment(mtime).format("YYYY-MM-DD HH:mm:ss")]);
    }

    console.log(table.toString());
}
