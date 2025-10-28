import MillenniumDB, { IRI } from '../src/index';
import Driver from '../src/driver';

describe('Entry point', () => {
    it('driver method is an exported and its a function', () => {
        expect(MillenniumDB.driver).toBeDefined();
        expect(typeof MillenniumDB.driver).toBe('function');
    });

    it('driver returns an instance of Driver', () => {
        expect(MillenniumDB.driver('http://www.example.com/')).toBeInstanceOf(Driver);
    });

    it('Can create an IRI', () => {
        const str = 'http://example.com';
        const iri = new IRI(str);
        expect(iri.iri).toBe(str);
    });
});
