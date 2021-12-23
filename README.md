<p align="center">
  NBM
  <a href="http://nodejs.org" target="_blank">Node.js</a> Boilerplate Manager
</p>

## Description
NBM can save your project and make to reusable.
also can declare own variables simply and replace all in text files.

## Installing NBM
```
npm install -g @ahas/nbm
```

## How to use

Save files in the current working directory
```
nbm save [name]
```

Clone from saved boilerplate by name or id
```
nbm clone <name_or_id>
```

List saved boilerplates
```
nbm list
```

Remove saved boilerplate by name or id
```
nbm remove <name_or_id>
```

## nbm.js
You can apply variable using nbm.js
create nbm.js in the root of project directory

You can use variable for NBM with this format
${nbm variable_name}

NBM will find this format and replace

For example
index.js

```
const options = {
  ...
  app_name: "${nbm app_name}"
  ...
};
```

nbm.js
```
module.exports = {
    vars: {
        app_name: {
            message: "application name",
            default: "default-application-name",
        },
        title: {
            message: "client title name",
            default: "default-client-title",
        },
    },
};
```

nbm.js exports the object having 'vars' property

When you run ```nbm save <name>```
NBM ask variable replacement values

```
nbm clone <name>
? application name default-application-name
? client title name default-client-title
replace ${nbm app_name} to default-application-name
replace ${nbm title} to default-client-title
cloned
```

then index.js will be replaced with 'default-application-name'
```
const options = {
  ...
  app_name: "default-application-name"
  ...
};
```

