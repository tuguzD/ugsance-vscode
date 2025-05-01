export function nullCheck(condition: any, message: string): asserts condition {
    if (!condition) { throw new Error(message); }
}

// combine arrays, while retaining both their index and order
export function mergeOrdered(...args: any[]) {
    var logic = (a = [], ...b: any[]): any[] =>
        b.length ? a.length ? [a[0], ...logic(...b, a.slice(1))] : logic(...b) : a;
    return logic(...args);
}

// build nested array with (grouped) items of input array
export function nestSeq(result: any[], length: number): any[][] {
    return result.reduce((result, value, index, sourceArray) =>
        index % length === 0 ? [...result, sourceArray.slice(index, index + length)] : result, []
    );
}

// remove line breaks and multiple spaces (>1)
export function clean(input: string): string {
    return input
        .replace(/(\r\n|\n|\r)/gm, '')
        .replace(/ +(?= )/g, '');
}
