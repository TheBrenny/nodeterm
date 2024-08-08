import {spawnSync} from "child_process";
import {chmod} from "fs/promises"
import {join as pathJoin} from "path";
import {writeFile, access, constants as fsConsts} from "fs/promises";
import {homedir} from "os";

(async () => {
    const IS_WIN = process.platform === "win32";

    if(IS_WIN) {
        let target = "User";
        if(opt("-m", "--machine")) target = "Machine";
        let command = `[Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::${target})+";${__dirname}", [System.EnvironmentVariableTarget]::${target})`;
        spawnSync(`pwsh -e "${Buffer.from(command).toString("base64")}"`);
    } else {
        console.log("Making ./nodeterm executable");
        await chmod(pathJoin(__dirname, "nodeterm"), fsConsts.S_IXUSR);
        let bpPath = pathJoin(homedir(), ".bash_profile");
        let bpExists = await access(bpPath).then(() => true).catch(() => false);
        if(bpExists) await writeFile(bpPath, `\n\nPATH=$PATH:${__dirname}/nodeterm`);
        else {
            console.log("Put the following in your `~/.bash_profile` equivalent:");
            console.log(`PATH=$PATH:${__dirname}/nodeterm`);
        }
    }
})();

function opt(...opts) {
    return opts.some((arg) => opts.includes(arg));
}