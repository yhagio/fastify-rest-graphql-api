import sinon from 'sinon';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

import UserService from '../../../src/service/user/service';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('UserService', () => {
  const sandbox = sinon.createSandbox();
  const validator: any = {
    create: sandbox.stub(),
    update: sandbox.stub(),
    getByEmailWithPassword: sandbox.stub(),
    getOneById: sandbox.stub(),
    getOneByIdTrx: sandbox.stub(),
    updateTrx: sandbox.stub()
  };
  let service: UserService;

  const trx: any = {};
  const user: any = {
    id: 'u1',
    email: 'email'
  };

  beforeEach(() => {
    validator.create.withArgs(user).resolves(user);
    validator.update.withArgs(user.id, user).resolves();
    validator.getByEmailWithPassword.withArgs(user.email).resolves(user);
    validator.getOneById.withArgs(user.id).resolves(user);
    validator.getOneByIdTrx.withArgs(trx, user.id).resolves(user);
    validator.updateTrx.withArgs(trx, user.id, user).resolves();

    service = new UserService(validator);
  });

  afterEach(() => {
    sandbox.reset();
  });

  describe('create', () => {
    it('delegates it to validator', async () => {
      const result = await service.create(user);
      expect(result).to.be.deep.equal(user);
    });
  });

  describe('update', () => {
    it('delegates it to validator', () =>
      expect(service.update(user.id, user)).to.eventually.be.fulfilled);
  });

  describe('getByEmailWithPassword', () => {
    it('delegates it to validator', async () => {
      const result = await service.getByEmailWithPassword(user.email);
      expect(result).to.be.deep.equal(user);
    });
  });

  describe('getOneById', () => {
    it('delegates it to validator', async () => {
      const result = await service.getOneById(user.id);
      expect(result).to.be.deep.equal(user);
    });
  });

  describe('getOneByIdTrx', () => {
    it('delegates it to validator', async () => {
      const result = await service.getOneByIdTrx(trx, user.id);
      expect(result).to.be.deep.equal(user);
    });
  });

  describe('updateTrx', () => {
    it('delegates it to validator', async () =>
      expect(service.updateTrx(trx, user.id, user)).to.eventually.be.fulfilled);
  });
});
