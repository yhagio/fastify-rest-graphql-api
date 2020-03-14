import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';

import UserValidator from '../../../src/service/user/validator';
import { InvalidError } from '../../../src/common/error/invalid';

chai.use(sinonChai);
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('UserValidator', () => {
  const sandbox = sinon.createSandbox();

  const dataAccess: any = {
    create: sandbox.stub(),
    update: sandbox.stub(),
    getByEmailWithPassword: sandbox.stub(),
    getOneById: sandbox.stub(),
    getOneByIdTrx: sandbox.stub(),
    updateTrx: sandbox.stub()
  };

  let validator: UserValidator;

  const trx: any = {};
  let user: any;

  beforeEach(() => {
    user = {
      id: 'u1',
      first_name: 'fname',
      last_name: 'lname',
      email: 'email',
      password: 'abc1234'
    };
    dataAccess.create.withArgs(user).resolves(user);
    dataAccess.update.withArgs(user.id, user).resolves();
    dataAccess.getByEmailWithPassword.withArgs(user.email).resolves(user);
    dataAccess.getOneById.withArgs(user.id).resolves(user);
    dataAccess.getOneByIdTrx.withArgs(trx, user.id).resolves(user);
    dataAccess.updateTrx.withArgs(trx, user.id, user).resolves();

    validator = new UserValidator(dataAccess);
  });

  afterEach(() => {
    sandbox.reset();
  });

  describe('create', () => {
    it('delegates it to dataAccess', async () => {
      const result = await validator.create(user);
      expect(result).to.be.eql(user);
    });

    it('throws invalid error if no user is passed as argument', () =>
      expect(validator.create({} as any)).to.eventually.be.rejectedWith(
        InvalidError,
        'user is required'
      ));
    it('throws invalid error if no user.first_name is passed as argument', () => {
      user.first_name = undefined;

      return expect(validator.create(user)).to.eventually.be.rejectedWith(
        InvalidError,
        'first_name is required'
      );
    });
    it('throws invalid error if no user.last_name is passed as argument', () => {
      user.last_name = undefined;

      return expect(validator.create(user)).to.eventually.be.rejectedWith(
        InvalidError,
        'last_name is required'
      );
    });
    it('throws invalid error if no user.email is passed as argument', () => {
      user.email = undefined;

      return expect(validator.create(user)).to.eventually.be.rejectedWith(
        InvalidError,
        'email is required'
      );
    });
    it('throws invalid error if no user.password is passed as argument', () => {
      user.password = undefined;

      return expect(validator.create(user)).to.eventually.be.rejectedWith(
        InvalidError,
        'password is required'
      );
    });
    it('throws invalid error if no user.password length is less than 4', () => {
      user.password = 'a';

      return expect(validator.create(user)).to.eventually.be.rejectedWith(
        InvalidError,
        'password must be longer than 3 characters'
      );
    });
  });

  describe('update', () => {
    it('delegates it to dataAccess', () =>
      expect(validator.update(user.id, user)).to.eventually.be.fulfilled);

    it('throws invalid error if no id is passed as argument', () => {
      user.id = undefined;
      return expect(validator.update(user.id, user)).to.eventually.be.rejectedWith(
        InvalidError,
        'id is required'
      );
    });

    it('throws invalid error if no update is passed as argument', () => {
      return expect(validator.update(user.id, null as any)).to.eventually.be.rejectedWith(
        InvalidError,
        'update object is required'
      );
    });

    it('throws invalid error if no first_name is passed as argument', () => {
      user.first_name = undefined;
      return expect(validator.update(user.id, user)).to.eventually.be.rejectedWith(
        InvalidError,
        'first name is required'
      );
    });

    it('throws invalid error if no last_name is passed as argument', () => {
      user.last_name = undefined;
      return expect(validator.update(user.id, user)).to.eventually.be.rejectedWith(
        InvalidError,
        'last name is required'
      );
    });

    it('throws invalid error if no email is passed as argument', () => {
      user.email = undefined;
      return expect(validator.update(user.id, user)).to.eventually.be.rejectedWith(
        InvalidError,
        'email is required'
      );
    });
  });

  describe('getByEmailWithPassword', () => {
    it('delegates it to dataAccess', async () => {
      const result = await validator.getByEmailWithPassword(user.email);
      expect(result).to.be.deep.equal(user);
    });

    it('throws invalid error if no email is passed as argument', () => {
      user.email = undefined;
      return expect(
        validator.getByEmailWithPassword(user.email)
      ).to.eventually.be.rejectedWith(InvalidError, 'email is required');
    });
  });

  describe('getOneById', () => {
    it('delegates it to dataAccess', async () => {
      const result = await validator.getOneById(user.id);
      expect(result).to.be.deep.equal(user);
    });

    it('throws invalid error if no id is passed as argument', () => {
      user.id = undefined;
      return expect(validator.getOneById(user.id)).to.eventually.be.rejectedWith(
        InvalidError,
        'id is required'
      );
    });
  });

  describe('getOneByIdTrx', () => {
    it('delegates it to dataAccess', async () => {
      const result = await validator.getOneByIdTrx(trx, user.id);
      expect(result).to.be.deep.equal(user);
    });

    it('throws invalid error if no id is passed as argument', () => {
      user.id = undefined;
      return expect(validator.getOneByIdTrx(trx, user.id)).to.eventually.be.rejectedWith(
        InvalidError,
        'id is required'
      );
    });

    it('throws invalid error if no transaction is passed as argument', () => {
      return expect(
        validator.getOneByIdTrx(null as any, user.id)
      ).to.eventually.be.rejectedWith(InvalidError, 'trx is required');
    });
  });

  describe('updateTrx', () => {
    it('delegates it to dataAccess', async () =>
      expect(validator.updateTrx(trx, user.id, user)).to.eventually.be.fulfilled);

    it('throws invalid error if no id is passed as argument', () => {
      user.id = undefined;
      return expect(
        validator.updateTrx(trx, user.id, user)
      ).to.eventually.be.rejectedWith(InvalidError, 'id is required');
    });

    it('throws invalid error if no transaction is passed as argument', () => {
      return expect(
        validator.updateTrx(null as any, user.id, user)
      ).to.eventually.be.rejectedWith(InvalidError, 'trx is required');
    });

    it('throws invalid error if no update is passed as argument', () => {
      return expect(
        validator.updateTrx(trx, user.id, null as any)
      ).to.eventually.be.rejectedWith(InvalidError, 'update object is required');
    });
  });
});
