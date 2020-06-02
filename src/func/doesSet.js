// @flow

function doesSet<U>(a: Set<U>): {
    dominate: Set<U> => boolean,
    equal: Set<U> => boolean,
    contain: U => boolean,
} {
    function dominate(b: Set<U>): boolean {
        return Array.from(b).every(x => a.has(x));
    }

    function equal(b: Set<U>): boolean {
        if (a.size !== b.size) return false;
        return dominate(b);
    }

    function contain(bE: U): boolean {
        return a.has(bE);
    }

    return { dominate, equal, contain };
}

export default doesSet;
