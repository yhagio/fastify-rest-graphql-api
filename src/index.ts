import app from './app';

const start = async () => {
  try {
    const address = await app.listen(process.env.PORT || (3000 as any), '0.0.0.0');
    app.log.info(`server listening on ${address}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
