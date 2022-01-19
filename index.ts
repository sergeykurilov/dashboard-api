import express, {Request, Response, NextFunction} from 'express';
import { userRouter } from './users/users.js';

const port = 8000;
const app = express();

app.use((req, res, next) => {
	console.log('время ', Date.now());
	next();
})

app.get('/hello' ,function(req, res) {
	throw new Error('error')
})

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	console.log(err.message);
	res.status(401).send(err.message);
})

app.use('/users',userRouter);

app.listen(port, function() {
	console.log(`Сервер запущен на http://localhost:${port}`);
})