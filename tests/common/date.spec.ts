import { expect } from 'chai';
import { isMoreThanXHours } from '../../src/common/date';

describe('date', () => {
  describe('isMoreThanXHours', () => {
    it('should be true if given date has passed 10 days', () => {
      const past = new Date('2000-01-15');
      const result = isMoreThanXHours(past, 10);
      expect(result).to.be.true;
    });
  });
});
