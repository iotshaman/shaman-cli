export interface IValidatorService {
    projectNameValidator: (answer: string) => boolean;
    pathValidator: (answer: string) => boolean;
    environmentValidator: (answer: string) => boolean;
    templateNameValidator: (answer: string) => boolean;
    yesNoValidator: (answer: string) => boolean;
}

export class ValidatorService implements IValidatorService {
    // TODO: make a factory 
    projectNameValidator = (answer: string): boolean => {
        let regex = RegExp('^[\\w-]+$');
        return regex.test(answer);
    }

    pathValidator = (answer: string): boolean => {
        let regex = RegExp('^[\\w-./\\\\]+$');
        return regex.test(answer);
    }

    environmentValidator = (answer: string): boolean => {
        let regex = RegExp('^[\\w]+$');
        return regex.test(answer);
    }

    templateNameValidator = (answer: string): boolean => {
        return answer.length != 0;
    }

    yesNoValidator = (answer: string): boolean => {
        let regex = RegExp('^[yYnN]{1}$');
        return regex.test(answer);
    }
}