const fs = require('fs');
const path = require('path');

module.exports = {};
// This is our readdir function that's used above.
module.exports.readdir = (predicate) => {
    let objects = fs.readdirSync(process.cwd()) || [];
    let filesizeMaxSize = 0;

    objects = objects.map((o, i) => {
        let ret = [];
        let t = "";
        let stats = fs.statSync(path.join(process.cwd(), o));
        if(!predicate(stats)) {
            objects[i] = null;
            return;
        }

        // Filetype
        // chmod
        t = "";
        let mode = stats.mode;
        if(stats.isFile()) t += "-";
        else if(stats.isDirectory()) t += "D";
        else if(stats.isSymbolicLink()) t += "L";
        else if(stats.isSocket()) t += "S";
        else t += "?";
        // t = stats.isFile() ? "-" : (stats.isDirectory() ? "D" : (stats.isSymbolicLink() ? "L" : "?"));
        mode = mode.toString(2).padStart(9, "0").slice(-9);
        t += "rwxrwxrwx".split("").map((e,i) => mode.charAt(i) === "1" ? e : "-").join("")
        ret.push(t);

        // last modified
        let mtime = new Date(Math.max(stats.mtime, stats.ctime));
        t = "";
        t += (mtime.getDate() + "").padStart(2, "0") + " ";
        t += mtime.toLocaleString('default', {month: 'long'}).substring(0, 3) + " ";
        t += (mtime.getFullYear() + "").substring(2) + " ";
        t += (mtime.getHours() + "").padStart(2, "0") + ":";
        t += (mtime.getMinutes() + "").padStart(2, "0") + ":";
        t += (mtime.getSeconds() + "").padStart(2, "0");
        ret.push(t);

        // Filesize
        t = stats.isFile() ? stats.size + "b" : "--";
        ret.push(t);
        filesizeMaxSize = Math.max(filesizeMaxSize, t.length);

        // The actual name
        ret.push(o);
        return ret;
    }).filter(e => e != null).map((e) => {
        e[0] = "  " + e[0];
        e[2] = ("" + e[2]).padStart(filesizeMaxSize, " ");
        return e.join("  ");
    });
    return objects;
};
