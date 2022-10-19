export interface IValidatorFactory {
    buildValidator: (regex: RegExp) => (answer: string) => boolean;
}

export class ValidatorFactory implements IValidatorFactory {
    buildValidator = (regex: RegExp) => {
        return (answer: string): boolean => {
            return regex.test(answer);
        }
    }
}
