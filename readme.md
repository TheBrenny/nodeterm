# Nodeterm

To quickly install this, run the following command in bash or pwsh:

```cmd
git clone https://github.com/TheBrenny/nodeterm
node install.js
```

## Commands

To use params with these commands, run the command as a function, such as `cd("..")`.

If a command ends with `()` then it must be run as a function.

Params wrapped in `[]` are optional, while those wrapped in `()` are mandatory.

### `help`

Shows this help message

### `config`

Gets and sets the config

### `clear`

Clear's the screen

### `exit`

`[code]` - exit code

Exit's the nodeterm

### `cd()`

`(dir)` - The directory to jump to

Changes directories

### `ls`

Lists everything in the current directory

### `lsf`

Lists only non-directories (ie, files) in the current directory

### `lsd`

Lists only directories in the current directory

### `inspect`

Exposes this session to be inspected, and opens the configured inspector

### `requireReload()`

`(module)` - The module to delete, and re-require

Deletes a modules from the require cache, so you can reload an updated version of that module
