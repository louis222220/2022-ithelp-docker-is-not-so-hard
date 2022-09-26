import express from 'express';
import router from './src/router.js';

const app = express();

app.use(express.json());

app.use('/', router);

app.set('port', process.env.PORT || 3000);

const server = app.listen(app.get('port'), () => {
	console.log('Listening on port ' + server.address().port);
})
