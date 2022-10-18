import * as readline from 'readline';

export class InteractiveCommands {

	stdin: readline.Interface;
	state: { [key: string]: string } = {};

	constructor() {
		this.stdin = readline.createInterface(process.stdin, process.stdout);
	}

	interogate = async (prompts: Prompt[]): Promise<{ [key: string]: string }> => {
		var state: {[key: string]: string} = {};
		for (var i = 0; i < prompts.length; i++) {
			var response = await this.question(prompts[i]);
			state[response.key] = response.value;
		}
		return state;
	}

	private question = (prompt: Prompt): Promise<{key: string, value: string}> => {
		return new Promise(res => {
			this.stdin.question(prompt.prompt, answer => {
				answer = answer.trim();
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
