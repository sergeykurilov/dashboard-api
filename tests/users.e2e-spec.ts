import { App } from '../src/app';
import { boot } from '../src/main';
import request from 'supertest';

let application: App;

beforeAll(async () => {
	const { app } = await boot;
	application = app;
});

describe('Users e2e', () => {
	// it('Register - success', async () => {
	// 	const res = await request(application.app).post('/users/register').send({
	// 		name: 'Vasia',
	// 		email: 'Vasia@a.ru',
	// 		password: '1',
	// 	});
	// 	expect(res.statusCode).toBe(200);
	// });
	it('Register - error', async () => {
		const res = await request(application.app).post('/users/register').send({
			email: 'a@a.ru',
			password: '1',
		});
		expect(res.statusCode).toBe(422);
	});
	it('login - success', async () => {
		const res = await request(application.app).post('/users/login').send({
			email: 'as2@email.ru',
			password: 'asdadad2',
		});
		expect(res.body.jwt).not.toBeUndefined();
	});
	it('login - success', async () => {
		const res = await request(application.app).post('/users/login').send({
			email: 'as2@email.ru',
			password: '1',
		});
		expect(res.statusCode).toBe(401);
	});
	it('info - success', async () => {
		const login = await request(application.app).post('/users/login').send({
			email: 'as2@email.ru',
			password: 'asdadad2',
		});
		const res = await request(application.app)
			.get('/users/info')
			.set('Authorization', `Bearer ${login.body.jwt}`);
		expect(res.body.email).toBe('as2@email.ru');
	});
	it('info - error', async () => {
		const res = await request(application.app).get('/users/info').set('Authorization', `Bearer 1`);
		expect(res.statusCode).toBe(401);
	});
});

afterAll(() => {
	application.close();
});
