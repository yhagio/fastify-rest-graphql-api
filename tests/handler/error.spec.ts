import sinon from 'sinon';
import { expect } from 'chai';

import { ErrorHandler } from '../../src/handler/error';
import { ForbiddenError } from '../../src/common/error/forbidden';
import { NotFoundError } from '../../src/common/error/notFound';

describe('ErrorHandler', () => {
  const sandbox = sinon.createSandbox();

  let err: any;
  const send: any = sandbox.stub();
  const error: any = sandbox.stub();
  const req: any = {
    log: {
      error
    }
  };
  const res: any = {
    code: sandbox.stub()
  };

  beforeEach(() => {});

  afterEach(() => {
    sandbox.reset();
  });

  it('log error- default error', () => {
    err = new Error();
    res.code.withArgs(500).returns({ send });

    ErrorHandler(err, req, res);

    expect(error).to.be.calledWith(err);
    expect(send).to.be.calledWith({
      error: {
        statusCode: 500,
        name: 'Error',
        message: 'Unexpected error happened'
      },
      data: undefined
    });
  });

  it('log error- custom error - forbidden', () => {
    err = new ForbiddenError('Nop');
    res.code.withArgs(403).returns({ send });

    ErrorHandler(err, req, res);

    expect(error).to.be.calledWith(err);
    expect(send).to.be.calledWith({
      error: {
        statusCode: 403,
        name: 'Forbidden',
        message: 'Nop'
      },
      data: undefined
    });
  });

  it('log error- custom error - not found', () => {
    err = new NotFoundError('Nop');
    res.code.withArgs(404).returns({ send });

    ErrorHandler(err, req, res);

    expect(error).to.be.calledWith(err);
    expect(send).to.be.calledWith({
      error: {
        statusCode: 404,
        name: 'NotFound',
        message: 'Nop'
      },
      data: undefined
    });
  });
});
