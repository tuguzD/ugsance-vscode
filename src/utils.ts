export function nullCheck(condition: any, message: string): asserts condition {
    if (!condition)
        throw new Error(message);
}

// combine arrays, while retaining both their index and order
export function mergeOrdered<T>(first: T[], second: T[]) {
    var min = Math.min(first.length, second.length),
        i = 0, result = [];
    while (i < min) {
        result.push(first[i], second[i]);
        ++i;
    }
    return result.concat(
        first.slice(min), second.slice(min),
    );
}

// build nested array with (grouped) items of input array
export function nestSeq(result: any[], length: number): any[][] {
    return result.reduce((result, value, index, sourceArray) =>
        index % length === 0 ? [...result, sourceArray.slice(index, index + length)] : result, []
    );
}
