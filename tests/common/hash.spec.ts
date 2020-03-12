import { expect } from 'chai';
import { hashString } from '../../src/common/hash';

describe('hash', () => {
  describe('hashString', () => {
    it('should hash given string', () => {
      const input = 'pass1234';
      const result = hashString(input);
      expect(result).to.not.be.equal(input);
    });
  });
});
