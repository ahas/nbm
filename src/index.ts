#!/usr/bin/env node

import bootstrap from "./bootstrap";
import { program } from "commander";
import { printList } from "./list";

import { save } from "./save";
import { clone } from "./clone";
import { remove } from "./remove";

bootstrap();

program.command("save [boilerplate]").action(async (boilerplate) => {
    await save(boilerplate);
});

program.command("list").action(() => {
    printList();
});

program.command("remove <name_or_id>").action((name_or_id: string) => {
    remove(name_or_id);
});

program.command("clone <name_or_id>").action(async (name_or_id) => {
    await clone(name_or_id);
});

program.parse(process.argv);
