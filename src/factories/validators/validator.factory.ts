export function buildValidator(regex: RegExp) {
    return (answer: string): boolean => {
        return regex.test(answer);
    }
}