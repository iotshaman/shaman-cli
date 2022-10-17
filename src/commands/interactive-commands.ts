import * as readline from 'readline';

export class InteractiveCommands {

	stdin: readline.Interface;
	state: { [key: string]: string } = {};

	constructor(private prompts: Prompt[]) {
		this.stdin = readline.createInterface(process.stdin, process.stdout);
	}

	interogate = async (): Promise<{ [key: string]: string }> => {
		var state: {[key: string]: string} = {};
		for (var i = 0; i < this.prompts.length; i++) {
			var response = await this.question(this.prompts[i]);
			state[response.key] = response.value;
		}
		return state;
	}

	private question = (prompt: Prompt): Promise<{key: string, value: string}> => {
		return new Promise(res => {
			this.stdin.question(prompt.prompt, answer => {
				if (!prompt.validator(answer)) {
					console.warn('Invalid response.');
					return res(this.question(prompt));
				}
				return res({key: prompt.key, value: answer});
			});
		})
	}

}

export class Prompt {
	constructor(public prompt: string, public key: string, public validator: (answer: string) => boolean) { }
}
