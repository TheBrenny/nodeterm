const path = require('path');
const fs = require('fs');
const child_process = require('child_process');
const inspector = require("inspector");

let config = fs.readFileSync(path.join(__dirname, 'config.json')) || "{}";
config = JSON.parse(config);

let inspectorSession = null;

Object.defineProperties(globalThis, {
    clear: {
        get: console.clear
    },
    exit: {
        get: process.exit
    },
    pwd: {
        get: process.cwd,
    },
    cd: {
        value: (dir) => (typeof dir === "undefined" ? process.cwd() : process.chdir(dir), process.cwd()),
    },
    ls: {
        get: () => {
            let objects = readdir(() => true);
            console.log(objects.length > 0 ? objects.join("\n") : "  Nothing here...");
            return objects.length;
        }
    },
    lsf: {
        get: () => {
            let objects = readdir(stats => !stats.isDirectory());
            console.log(objects.length > 0 ? objects.join("\n") : "  No files...");
            return objects.length;
        }
    },
    lsd: {
        get: () => {
            let objects = readdir(stats => stats.isDirectory());
            console.log(objects.length > 0 ? objects.join("\n") : "  No directories...");
            return objects.length;
        }
    },
    inspect: {
        get: () => {
            let host = config.inspect.host;
            let port = Math.floor(Math.random() * (65535 - 1024) + 1024);

            let cmd = config.inspect.cmd.replace("${target}", `${host}:${port}`);
            let terminal = config.inspect.console.replace("${cmd}", cmd);

            console.log(terminal);

            inspector.open(port, host, false);
            child_process.exec(terminal);
            inspector.waitForDebugger();
        }
    },
    requireReload: {
        value: function (v) {
            const reqCache = Object.keys(require.cache);
            const deleteCache = (c) => (delete require.cache[c]);

            if (v === undefined) {
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
                if (v.startsWith("./")) {
                    try {
                        v = fs.realpathSync(path.resolve(pwd, v));
                        if (path.extname(v) == "") v += ".js";
                    } catch (e) { }
                }

                deleteCache(v);
                return require(v);
            }
        }
    }
});

// globalThis.cd._ = () => globalThis.cd("..");

Object.defineProperties(globalThis.cd, {
    "_": {
        get: () => globalThis.cd("..")
    }
});

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

let readdir = (predicate) => {
    let objects = fs.readdirSync(process.cwd()) || [];
    let bigSize = 0;

    objects = objects.map((o, i) => {
        let ret = [];
        let t = "";
        let stats = fs.statSync(path.join(process.cwd(), o));
        if (!predicate(stats)) {
            objects[i] = null;
            return;
        }

        // Filetype
        // chmod
        let mode = stats.mode;
        t = stats.isFile() ? "-" : stats.isDirectory() ? "D" : stats.isSymbolicLink() ? "L" : "?";
        t += (mode >> 8 & 0b1) == 1 ? "r" : "-";
        t += (mode >> 7 & 0b1) == 1 ? "w" : "-";
        t += (mode >> 6 & 0b1) == 1 ? "x" : "-";
        t += (mode >> 5 & 0b1) == 1 ? "r" : "-";
        t += (mode >> 4 & 0b1) == 1 ? "w" : "-";
        t += (mode >> 3 & 0b1) == 1 ? "x" : "-";
        t += (mode >> 2 & 0b1) == 1 ? "r" : "-";
        t += (mode >> 1 & 0b1) == 1 ? "w" : "-";
        t += (mode >> 0 & 0b1) == 1 ? "x" : "-";
        ret.push(t);

        // last modified
        let mtime = new Date(Math.max(stats.mtime, stats.ctime));
        t = "";
        t += (mtime.getDate() + "").padStart(2, "0") + " ";
        t += mtime.toLocaleString('default', {
            month: 'long'
        }).substr(0, 3) + " ";
        t += (mtime.getFullYear() + "").substr(2) + " ";
        t += (mtime.getHours() + "").padStart(2, "0") + ":";
        t += (mtime.getMinutes() + "").padStart(2, "0") + ":";
        t += (mtime.getSeconds() + "").padStart(2, "0");
        ret.push(t);

        // Filesize
        t = stats.isFile() ? stats.size + "b" : "--";
        ret.push(t);
        bigSize = Math.max(bigSize, t.length);

        // The actual name
        ret.push(o);
        return ret;
    }).filter(e => e != null).map((e) => {
        e[0] = "  " + e[0];
        e[2] = ("" + e[2]).padStart(bigSize, " ");
        return e.join("  ");
    });
    return objects;
};