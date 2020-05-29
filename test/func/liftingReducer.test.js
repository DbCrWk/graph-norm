// @flow
import liftingReducer from '../../src/func/liftingReducer';

describe('liftingReducer', () => {
    it('extracts nested array elements in order', () => {
        expect.assertions(1);

        const input = [[1, 2], [3, 4]];
        const actual = input.reduce(liftingReducer);

        const expected = [1, 2, 3, 4];

        expect(actual).toStrictEqual(expected);
    });
});
