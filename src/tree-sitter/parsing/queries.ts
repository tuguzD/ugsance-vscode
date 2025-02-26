export function functionNames(node: Map<string, string>): string {
    let result = '';
    node.forEach((value, key) => {
        result += `( ${key} ( ${value} ) @name)\n`
    });
    return result;
}
