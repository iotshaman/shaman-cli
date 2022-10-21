export class CommandLineArguments {
    public command: string;
    private args: {[key: string]: string} = {};
    private argRegex: RegExp = /-{2}[a-zA-Z]+=.+/;

    constructor(argv: string[]) {
        this.command = argv[2];
        if (!this.command) throw new Error('No command provided.');
        let args = argv.slice(3);
        args.forEach(arg => {
            if (Object.keys(this.flags).includes(arg)) return this.flags[arg] = true;
            if (!this.argRegex.test(arg)) throw new Error(`Invalid argument :: ${arg}`);
            let splitArg: string[] = arg.split('=');
            let key: string = splitArg[0].slice(2);
            let value: string = splitArg[1];
            this.args[key] = value; 
        });
    }

    public getValueOrDefault = <T>(key: string, defaultValue?: T): string | T => {
        if (!!this.args[key]) return this.args[key];
        if (!!defaultValue) return defaultValue;
        return this.keyDefaults[key];
    }

    getDefault = (key: string): string => {
        return this.keyDefaults[key];
    }

    public getFlag = (key: string): boolean => {
        return this.flags[key];
    }

    private keyDefaults = {
        echo: 'No echo string provided.',
        environment: '*',
        filePath: './shaman.json',
        recipe: 'default-recipe',
        template: null,
        script: 'start'
    }

    private flags = {
        '-add': false,
    }
}
