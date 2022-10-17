import * as readline from 'readline';
// import { IObserver } from './generate/generate.command';

// export interface ISubject {
// 	attach(observer: IObserver): void;
// 	detach(observer: IObserver): void;
// 	notify(): void;
// }

export class InteractiveCommands {

	stdin: readline.Interface;
	state: { [key: string]: string } = {};
	// private observers: IObserver[] = [];

	constructor(private prompts: Prompt[]) {
		this.stdin = readline.createInterface(process.stdin, process.stdout);
	}

	// attach = (observer: IObserver) => {
	// 	let isExists = this.observers.includes(observer);
	// 	if (isExists) {
	// 		return Promise.reject(console.error("InteractiveCommands: observer already attached."));
	// 	}
	// 	this.observers.push(observer);
	// 	return Promise.resolve();
	// }

	// detach = (observer: IObserver) => {
	// 	const observerIndex = this.observers.indexOf(observer);
	// 	if (observerIndex === -1) {
	// 		return Promise.reject(console.log('InteractiveCommands: Nonexistent observer.'));
	// 	}
	// 	this.observers.splice(observerIndex, 1);
	// 	return Promise.resolve();
	// }

	// notify = () => {
	// 	console.log('\n\nSubject: Notifying observers...\n\n');
	// 	for (const observer of this.observers) {
	// 		observer.update(this);
	// 	}
	// }

	interogate = (): Promise<{ [key: string]: string }> => {
		this.state = {};
		let taskChain = this.prompts.reduce((a, b) => {
			return a.then(_ => this.question(b))
		}, Promise.resolve());
		return taskChain
			.then(_ => {return this.state});
	}

	private question = (prompt: Prompt): Promise<void> => {
		return new Promise(res => {
			this.stdin.question(prompt.prompt, answer => {
				if (!prompt.validator(answer)) {
					console.warn('Invalid response.');
					return res(this.question(prompt));
				}
				this.state[prompt.key] = answer
				return res();
			});
		})
	}

}

export class Prompt {
	constructor(public prompt: string, public key: string, public validator: (answer: string) => boolean) {
		this.prompt = this.prompt.replace("$", key);
	}

}