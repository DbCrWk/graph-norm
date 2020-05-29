// @flow
function liftingReducer<T>(a: Array<T>, b: Array<T>): Array<T> {
    return [...a, ...b];
}

export default liftingReducer;
