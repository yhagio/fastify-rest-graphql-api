import { expect } from 'chai';
import { generateRandomBytes } from '../../src/common/token';

describe('token', () => {
  describe('generateRandomBytes', () => {
    it('should generate random token', () => {
      const random = generateRandomBytes();
      const random2 = generateRandomBytes();
      expect(typeof random).to.be.equal('string');
      expect(random).to.not.be.equal(random2);
    });
  });
});
