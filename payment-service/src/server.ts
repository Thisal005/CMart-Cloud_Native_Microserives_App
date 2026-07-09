import app from './app';
import { config } from './config';

app.listen(config.port, () => {
  console.log(`Payment Service running on port ${config.port}`);
});
