// @flow

function doesSet<U>(a: Set<U>): { dominate: Set<U> => boolean, equal: Set<U> => boolean } {
    function dominate(b: Set<U>): boolean {
        return Array.from(b).every(x => a.has(x));
    }

    function equal(b: Set<U>): boolean {
        if (a.size !== b.size) return false;
        return dominate(b);
    }

    return { dominate, equal };
}

export default doesSet;
