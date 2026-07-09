import app from './app';
import { config } from './config';

app.listen(config.port, () => {
  console.log(`Order Service running on port ${config.port}`);
});
