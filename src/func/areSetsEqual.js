// @flow

function areSetsEqual<U>(a: Set<U>, b: Set<U>) {
    if (a.size !== b.size) return false;
    return Array.from(a).every(x => b.has(x));
}

export default areSetsEqual;
