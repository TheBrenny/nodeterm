const path = require('path');
const fs = require('fs');

// Config is what lets us do some cool things.
let config = fs.readFileSync(path.join(__dirname, 'config.json')) || "{}";
config = JSON.parse(config);

let commands = require("./commands.js");

let commandBindings = {};
let helpMessages = [];
let helpSizes = [0, 0, 0];
for(let cmd in commands) {
    let binding = commands[cmd].binding ?? "get";
    let fn = commands[cmd].fn
    let args = fn.toString().match(/\(.*?\)/g)[0]?.slice(1, -1) ?? "";
    let help = commands[cmd].help || "** No help given... **";

    commandBindings[cmd] = {[binding]: fn};

    let helpMsg = [cmd, args, help];

    helpSizes = helpSizes.map((v, i) => Math.max(v, helpMsg[i].length));
    helpMessages.push(helpMsg);
}
for(let i = 0; i < helpMessages.length; i++) helpMessages[i] = helpMessages[i].map((msg, p) => msg.padEnd(helpSizes[p], " "));

commandBindings.help.get = commands.help.fn = function () {
    let msg = [
        ``,
        `\n\x1b[32m>>Welcome to NodeTerm! A terminal module to give your nodeterm superpowers!\x1b[0m`,
        ``,
        `Commands`,
        helpMessages.map((line) => `  ${line[0]} ` + (line[1].trim().length > 0 ? `[${line[1]}]` : ` ${line[1]} `) + ` -- ${line[2].trim()}`).join("\n"),
        ``,
        `https://github.com/thebrenny/nodeterm`
    ];
    console.log(msg.join("\n"));
    return helpMessages.length;
}

Object.defineProperties(globalThis, commandBindings);

// This allows us to print object depth. Setting it to Infinity means our objects will always be printed fully,
// and never shorted to something like {a: [Object object]}
let fixReplCounter = 0;
let fixRepl = () => {
    try {
        repl.writer.options.depth = Infinity;
    } catch(e) {
        fixReplCounter++;
        if(fixReplCounter < 200) setTimeout(fixRepl, 300);
        else console.warn("Couldn't reset the repl.");
    }
};
fixRepl();

console.log("\n\x1b[32m>> Nodeterm activated! This term comes with super powers!\x1b[0m\n")