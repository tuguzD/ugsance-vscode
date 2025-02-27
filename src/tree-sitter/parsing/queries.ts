import { Language } from "./languages";

export function functions(language: Language): string {
    let result = '';
    language.function.forEach((value, key) => {
        result += `( ${key} ( ${value} ) @name ) @function \n`
    });
    return result;
}
