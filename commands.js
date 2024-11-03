const os = require("os");
const fs = require('fs');
const child_process = require('child_process');
const inspector = require("inspector");
const path = require('path');

let { readdir } = require("./helpers.js");

module.exports = {
    // TODO: Each object in this object should have a '.help' so we can get help
    help: {
        fn: function () { console.log("Coming soon...") },
        //binding: "get", // the binding is default at "get" // MAYBE: could we change this to a get proxy or something so we can go `help.command` ?
        help: "Shows this help message"
    },
    // TODO: I would absolutely love a way to get and change the config
    config: {
        fn: function () { console.log("Coming soon...") },
        help: "Gets and sets the config"
    },
    clear: {
        fn: console.clear,
        help: "Clear's the screen"
    },
    exit: {
        fn: process.exit,
        help: "Exit's the nodeterm"
    },
    cd: {
        fn: function (dir) {
            if (typeof dir !== "undefined") process.chdir(dir.replace("~", os.homedir()));
            return process.cwd();
        },
        binding: "value",
        help: "Changes directories"
    },
    pwd: {
        fn: function () {
            let p = process.cwd();
            console.log(p);
            return p;
        },
        help: "Prints working directory"
    },
    ls: {
        fn: function () {
            let objects = readdir(() => true);
            console.log(objects.length > 0 ? objects.join("\n") : "  Nothing here...");
            return objects.length;
        },
        help: "Lists everything in the current directory"
    },
    lsf: {
        fn: function () {
            let objects = readdir(stats => !stats.isDirectory());
            console.log(objects.length > 0 ? objects.join("\n") : "  No files...");
            return objects.length;
        },
        help: "Lists only non-directories (ie, files) in the current directory"
    },
    lsd: {
        fn: function () {
            let objects = readdir(stats => stats.isDirectory());
            console.log(objects.length > 0 ? objects.join("\n") : "  No files...");
            return objects.length;
        },
        help: "Lists only directories in the current directory"
    },
    inspect: {
        fn: function () {
            let host = config.inspect.host;
            let port = Math.floor(Math.random() * (65535 - 1024) + 1024);

            let cmd = config.inspect.cmd.replace("${target}", `${host}:${port}`);
            let terminal = config.inspect.console.replace("${cmd}", cmd);

            console.log(terminal);

            // TODO: Ideally I'd like to decouple the process.exec from this.
            // Or at least the reliance on using a command.
            inspector.open(port, host, false);
            child_process.exec(terminal);
            inspector.waitForDebugger();
            return true;
        },
        help: "Exposes this session to be inspected, and opens the configured inspector"
    },
    requireReload: {
        fn: function (module) {
            const reqCache = Object.keys(require.cache);
            const deleteCache = (c) => (delete require.cache[c]);

            if (module === undefined) {
                let ret = 0;
                for (const c of reqCache) {
                    deleteCache(reqCache[c]);
                    if (fs.existsSync(c)) {
                        require(path.resolve(c));
                        ret++;
                    }
                }
                return ret;
            } else {
                if (module.startsWith("./") || module.startsWith("../" || module.startsWith("/"))) {
                    try {
                        module = fs.realpathSync(module.startsWith("/") ? module : path.resolve(process.cwd(), module));
                        if (path.extname(module) == "") module += ".js";
                    } catch (e) { }
                }

                deleteCache(module);
                return require(module);
            }
        },
        binding: "value",
        help: "Deletes a modules from the require cache, so you can reload an updated version of that module"
    },
};