import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import ResetPasswordService from '../../../src/service/resetPassword/service';
import { InvalidError } from '../../../src/common/error/invalid';
import { OperationError } from '../../../src/common/error/operation';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('ResetPasswordService', () => {
  const sandbox = sinon.createSandbox();

  const trx: any = {
    commit: sandbox.stub(),
    rollback: sandbox.stub()
  };
  const knex: any = {
    transaction: sandbox.stub()
  };
  const userService: any = {
    updateTrx: sandbox.stub()
  };
  const validator: any = {
    create: sandbox.stub(),
    getOneByTokenTrx: sandbox.stub(),
    deleteTrx: sandbox.stub()
  };

  let service: ResetPasswordService;

  const resetPass: any = {
    user_id: 'user_id',
    token: 'token'
  };
  beforeEach(() => {
    knex.transaction.resolves(trx);
    service = new ResetPasswordService(knex, userService, validator);
  });

  afterEach(() => {
    sandbox.reset();
  });

  describe('create', () => {
    it('delegates it to validator', () => {
      validator.create.withArgs(resetPass).resolves();
      return expect(service.create(resetPass)).to.eventually.be.fulfilled;
    });
  });

  describe('getOneByTokenTrx', () => {
    it('delegates it to validator', async () => {
      validator.getOneByTokenTrx.withArgs(trx, 'token').resolves(resetPass);
      const result = await service.getOneByTokenTrx(trx, 'token');
      expect(result).to.be.deep.equal(resetPass);
    });
  });

  describe('deleteTrx', () => {
    it('delegates it to validator', () => {
      validator.deleteTrx.withArgs(trx, 'user_id').resolves();
      return expect(service.deleteTrx(trx, 'user_id')).to.eventually.be.fulfilled;
    });
  });

  describe('completeResetPassword', () => {
    it('successfully completes resetting password', async () => {
      resetPass.created_at = new Date();
      validator.getOneByTokenTrx.withArgs(trx, 'token').resolves(resetPass);
      userService.updateTrx.resolves();

      await service.completeResetPassword('token', 'pass1234');
      expect(userService.updateTrx).to.have.been.calledWith(trx, resetPass.user_id);
      expect(userService.updateTrx.getCall(0).args[2])
        .to.have.property('password')
        .that.is.a('string')
        .and.not.be.equal('pass1234');
      expect(trx.commit).to.have.callCount(1);
    });

    it('throws invalid error if token is not found', () => {
      return expect(service.completeResetPassword('token', 'pass1234'))
        .to.eventually.be.rejectedWith(InvalidError, 'Token is already used or invalid!')
        .and.then(() => expect(trx.rollback).to.have.callCount(1));
    });

    it('throws invalid error if token is expired', () => {
      resetPass.created_at = undefined;
      validator.getOneByTokenTrx.withArgs(trx, 'token').resolves(resetPass);

      return expect(service.completeResetPassword('token', 'pass1234'))
        .to.eventually.be.rejectedWith(InvalidError, 'Token is expired!')
        .and.then(() => expect(trx.rollback).to.have.callCount(1));
    });

    it('throws operation error if fails to reset password', () => {
      resetPass.created_at = new Date();
      validator.getOneByTokenTrx.withArgs(trx, 'token').resolves(resetPass);
      userService.updateTrx.rejects(new Error('OMG'));

      return expect(service.completeResetPassword('token', 'pass1234'))
        .to.eventually.be.rejectedWith(
          OperationError,
          'Failed to complete resetting password; OMG'
        )
        .and.then(() => expect(trx.rollback).to.have.callCount(1));
    });
  });
});
