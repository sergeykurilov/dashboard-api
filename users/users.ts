import express from 'express';


const userRouter = express.Router();

userRouter.use((req, res, next) => {
	console.log('userRouter  ', Date.now());
	next();
})

userRouter.post('/login', function(req, res) {
	res.send('login')
})

userRouter.post('/register', function(req, res) {
	res.send('login')
})

export {userRouter};