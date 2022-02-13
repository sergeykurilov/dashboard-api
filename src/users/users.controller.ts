import { NextFunction, Request, Response } from 'express';
import { HTTPError } from '../errors/http-error.class';
import { LoggerService } from '../logger/logger.service';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import 'reflect-metadata';
import { IUsersInterface } from './users.controller.interface';
import { BaseController } from '../common/base.controller';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegiserDto } from './dto/user-register.dto';
import { UsersService } from './users.service';
import { ValidateMiddleware } from '../common/validate.middleware';
import { sign } from 'jsonwebtoken';
import { ConfigService } from '../config/config.service';
import { AuthGuard } from '../common/auth.guard';

@injectable()
export class UserController extends BaseController implements IUsersInterface {
	constructor(
		@inject(TYPES.UsersService) private usersService: UsersService,
		@inject(TYPES.ILogger) private loggerService: LoggerService,
		@inject(TYPES.ConfigService) private configService: ConfigService,
	) {
		super(loggerService);
		this.bindRoutes([
			{
				path: '/register',
				method: 'post',
				func: this.register,
				middlewares: [new ValidateMiddleware(UserRegiserDto)],
			},
			{
				path: '/login',
				method: 'post',
				func: this.login,
				middlewares: [new ValidateMiddleware(UserLoginDto)],
			},
			{
				path: '/info',
				method: 'get',
				func: this.info,
				middlewares: [new AuthGuard()],
			},
		]);
	}

	async login(
		req: Request<{}, {}, UserLoginDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.usersService.validateUser(req.body);
		if (!result) {
			return next(new HTTPError(401, 'ошибка авторизации', 'login'));
		}
		const jwt = await this.signJWT(req.body.email, this.configService.get('SECRET'));
		this.ok(res, { jwt: jwt });
	}

	async register(
		{ body }: Request<{}, {}, UserRegiserDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.usersService.createUser(body);
		if (!result) {
			return next(new HTTPError(422, 'Такой пользователь уже существует.'));
		}
		this.ok(res, { email: result.email, id: result.id });
	}

	async info(
		{ user }: Request<{}, {}, UserRegiserDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const userInfo = await this.usersService.getUserInfo(user);

		this.ok(res, {
			id: userInfo?.id,
			email: userInfo?.email,
		});
	}

	private signJWT(email: string, secret: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			sign(
				{
					email,
					iat: Math.floor(Date.now() / 1000),
				},
				secret,
				{
					algorithm: 'HS256',
				},
				(err, token) => {
					if (err) {
						reject(err);
					}
					resolve(token as string);
				},
			);
		});
	}
}
