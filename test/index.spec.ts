import MillenniumDB from '../src/index';
import Driver from '../src/driver';

describe('Entry point', () => {
    it('driver method is an exported and its a function', () => {
        expect(MillenniumDB.driver).toBeDefined();
        expect(typeof MillenniumDB.driver).toBe('function');
    });

    it('driver returns an instance of Driver', () => {
        expect(MillenniumDB.driver('http://www.example.com/')).toBeInstanceOf(Driver);
    });
});
