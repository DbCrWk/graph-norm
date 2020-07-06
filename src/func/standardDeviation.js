// @flow
function average(values: Array<number>) {
    const sum = values.reduce((acc, value) => acc + value, 0);

    const avg = sum / values.length;
    return avg;
}

function standardDeviation(values: Array<number>) {
    const avg = average(values);

    const squareDiffs = values.map(value => {
        const diff = value - avg;
        const sqrDiff = diff * diff;
        return sqrDiff;
    });

    const avgSquareDiff = average(squareDiffs);

    const stdDev = Math.sqrt(avgSquareDiff);
    return stdDev;
}

export default standardDeviation;
