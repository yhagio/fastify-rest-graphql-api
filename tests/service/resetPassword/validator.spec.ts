import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';

import ResetPasswordValidator from '../../../src/service/resetPassword/validator';
import { InvalidError } from '../../../src/common/error/invalid';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('ResetPasswordValidator', () => {
  const sandbox = sinon.createSandbox();

  const dataAccess: any = {
    getOneByTokenTrx: sandbox.stub(),
    deleteTrx: sandbox.stub(),
    create: sandbox.stub()
  };

  let validator: ResetPasswordValidator;

  const trx: any = {};
  const token = 'token';
  const userId = 'user123';
  const newPass = 'pass1234';
  let resetPass: any;
  beforeEach(() => {
    resetPass = {
      user_id: userId,
      token
    };
    dataAccess.getOneByTokenTrx.withArgs(trx, token).resolves(resetPass);
    dataAccess.deleteTrx.withArgs(trx, userId).resolves();
    dataAccess.create.withArgs(newPass).resolves();

    validator = new ResetPasswordValidator(dataAccess);
  });

  afterEach(() => {
    sandbox.reset();
  });

  describe('getOneByTokenTrx', () => {
    it('get resetPassword record', async () => {
      const result = await validator.getOneByTokenTrx(trx, token);
      expect(result).to.be.eql(resetPass);
    });

    it('throws invalid error if no transaction is passed as argument', () =>
      expect(
        validator.getOneByTokenTrx(null as any, token)
      ).to.eventually.be.rejectedWith(InvalidError, 'Transaction is required'));

    it('throws invalid error if no token is passed as argument', () =>
      expect(validator.getOneByTokenTrx(trx, null as any)).to.eventually.be.rejectedWith(
        InvalidError,
        'Token is required'
      ));
  });

  describe('deleteTrx', () => {
    it('deletes successfully', async () =>
      expect(validator.deleteTrx(trx, userId)).to.eventually.be.fulfilled);

    it('throws invalid error if no transaction is passed as argument', () =>
      expect(validator.deleteTrx(null as any, userId)).to.eventually.be.rejectedWith(
        InvalidError,
        'Transaction is required'
      ));

    it('throws invalid error if no userId is passed as argument', () =>
      expect(validator.deleteTrx(trx, null as any)).to.eventually.be.rejectedWith(
        InvalidError,
        'User ID is required'
      ));
  });

  describe('create', () => {
    it('deletes successfully', async () =>
      expect(validator.create(resetPass)).to.eventually.be.fulfilled);

    it('throws invalid error if no resetPassword object is passed as argument', () =>
      expect(validator.create(null as any)).to.eventually.be.rejectedWith(
        InvalidError,
        'ResetPassword object is invalid'
      ));

    it('throws invalid error if no userId is passed as argument', () => {
      resetPass.user_id = undefined;
      return expect(validator.create(resetPass)).to.eventually.be.rejectedWith(
        InvalidError,
        'ResetPassword object is invalid'
      );
    });

    it('throws invalid error if no token is passed as argument', () => {
      resetPass.token = undefined;
      return expect(validator.create(resetPass)).to.eventually.be.rejectedWith(
        InvalidError,
        'ResetPassword object is invalid'
      );
    });
  });
});
