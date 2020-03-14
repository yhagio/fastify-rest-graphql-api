import sinon from 'sinon';
import { expect } from 'chai';

import DB from '../../../src/infra/db/knex';

describe('DB (Knex)', () => {
  const sandbox = sinon.createSandbox();

  const config: any = {
    get: sandbox.stub()
  };
  const knexClient = sandbox.stub();
  const connection: any = {
    transaction: sandbox.stub()
  };
  const trx: any = {};
  let db: DB;

  beforeEach(() => {
    config.get.withArgs('infra.knex').returns('config');
    knexClient.withArgs('config').returns(connection);
    db = new DB(knexClient, config);
  });

  afterEach(() => {
    sandbox.reset();
  });

  describe('getConnection', () => {
    it('get knex connection', () => {
      expect(db.getConnection()).to.be.eql(connection);
    });
  });

  describe('startTransaction', () => {
    it('get knex connection', async () => {
      connection.transaction.callsArgWith(0, trx);
      const result = await db.startTransaction();
      expect(result).to.be.eql(trx);
    });

    it('throw knex connection error', async () => {
      const err = new Error('OMG');
      connection.transaction.rejects(err);
      return expect(db.startTransaction()).to.eventually.be.rejectedWith(err);
    });
  });
});
