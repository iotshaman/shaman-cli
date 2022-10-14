import * as readline from 'readline';
import { IObserver } from './generate/generate.command';

export interface ISubject {
	attach(observer: IObserver): void;
	detach(observer: IObserver): void;	
	notify(): void;
}

export class InteractiveCommands implements ISubject {

	state: string;
	stdin: readline.Interface;
	private observers: IObserver[] = []

	constructor(private prompts: Prompt[]) {
		this.stdin = readline.createInterface(process.stdin, process.stdout);
	}

	attach = (observer: IObserver) => {
		let isExists = this.observers.includes(observer);
		if (isExists) {
			return console.error("InteractiveCommands: observer already attached.")
		}
		console.log("InteractiveCommands: attaching observer");
		this.observers.push(observer);
	}

    public detach(observer: IObserver): void {
        const observerIndex = this.observers.indexOf(observer);
        if (observerIndex === -1) {
            return console.log('InteractiveCommands: Nonexistent observer.');
        }

        this.observers.splice(observerIndex, 1);
        console.log('InteractiveCommands: Detached an observer.');
    }

	public notify(): void {
        console.log('Subject: Notifying observers...');
        for (const observer of this.observers) {
            observer.update(this);
        }
    }

	interogate = (): Promise<void> => {
		let taskChain = this.prompts.reduce((a, b) => {
			return a.then(_ => this.question(b))
		}, Promise.resolve());
		return taskChain;
	}

	question = (prompt: Prompt): Promise<void> => {
		return new Promise(res => {
			this.stdin.question(prompt.prompt, answer => {
				if (!prompt.validator(answer)) {
					console.warn('Invalid response.');
					return this.question(prompt);
				}
				this.state = answer;
				this.notify();
				return res();
			});
		})
	}

}

export class Prompt {
	constructor(public prompt: string, public validator: (answer: string) => boolean) {

	}

}