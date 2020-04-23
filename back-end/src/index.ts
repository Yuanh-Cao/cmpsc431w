import './LoadEnv'; // Must be the first import
import app from '@server';
import logger from '@shared/Logger';
import { connect } from './dateabase-ops';

// Start the server
const port = Number(process.env.PORT || 3000);


app.listen(port, async () => {
    await connect("prod.sqlite");
    logger.info('Express server started on port: ' + port);
});
