export class CommandLineArguments {
    public command: string;
    public args: {[key: string]: string} = {};
    private argRegex: RegExp = /-{2}[a-zA-Z]+=.+/;

    constructor(argv: string[]) {
        this.command = argv[2];
        if (!this.command) throw new Error('No command provided.');
        let args = argv.slice(3);
        args.forEach(arg => {
            if (!this.argRegex.test(arg)) throw new Error(`Invalid argument :: ${arg}`);
            let splitArg: string[] = arg.split('=');
            let key: string = splitArg[0].slice(2);
            let value: string = splitArg[1];
            this.args[key] = value; 
        });
    }
}
