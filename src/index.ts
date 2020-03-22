import app from './app';
import { AddressInfo } from 'net';

const start = async () => {
  try {
    await app.listen(process.env.PORT || process.env.APP_PORT || (3000 as any));
    const server = app.server.address() as AddressInfo;
    app.log.info(`server listening on ${server.address}:${server.port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
