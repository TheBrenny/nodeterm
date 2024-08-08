let {spawnSync} = require("child_process");
let {writeFile, access, chmod} = require("fs/promises");
let {homedir} = require("os");
let {join} = require("path");


(async () => {
    const IS_WIN = process.platform === "win32";

    if(IS_WIN) {
        // BUG: Running as admin will output an error, but it'll still work?
        let target = "User";
        if(opt("-m", "--machine")) target = "Machine";
        let command = `[Environment]::SetEnvironmentVariable("Path", [Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::${target}) + ";${__dirname}", [System.EnvironmentVariableTarget]::${target})`;
        if(!opt("-d", "--dryrun")) {
            let returns = spawnSync("pwsh", ["-Command", command], {
                stdio: ["ignore", "pipe", "pipe"],
            });
            console.log(returns);
            if(returns.stdout) console.log(returns.stdout.toString());
            if(returns.stderr) console.log(returns.stderr.toString());
            if(returns.status === 0) console.log("Success!");
            else console.error("Something went wrong...");
            process.exit(returns.status);
        } else {
            console.log(command);
        }
    } else {
        console.log("Making ./nodeterm executable");
        await chmod(join(__dirname, "nodeterm"), fsConsts.S_IXUSR);
        let bpPath = join(homedir(), ".bash_profile");
        let bpExists = await access(bpPath).then(() => true).catch(() => false);
        if(bpExists) await writeFile(bpPath, `\n\nPATH=$PATH:${__dirname}/nodeterm`);
        else {
            console.log("Put the following in your `~/.bash_profile` equivalent:");
            console.log(`PATH=$PATH:${__dirname}/nodeterm`);
        }
    }
})();

function opt(...opts) {
    return process.argv.some((arg) => opts.includes(arg));
}