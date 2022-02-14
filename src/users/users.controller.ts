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
import { UserTokenDto } from './dto/user-token.dto';

@injectable()
export class UserController extends BaseController implements IUsersInterface {
	private tokens = {};
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
			{
				path: '/token',
				method: 'post',
				func: this.token,
				middlewares: [],
			},
		]);
	}

	async token(req: Request<{}, {}, UserTokenDto & UserLoginDto>, res: Response): Promise<void> {
		const { refreshToken } = req.body;
		if (refreshToken) {
			const jwt = await this.signJWT(
				req.body.email,
				this.configService.get('SECRET'),
				this.configService.get('tokenLife'),
			);
			const refresh = await this.signJWT(
				req.body.email,
				this.configService.get('refreshTokenSecret'),
				this.configService.get('refreshTokenLife'),
			);
			const response = {
				token: jwt,
				refresh: refresh,
			};

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			this.tokens.refreshToken.token = jwt;
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			this.tokens.refreshToken.refreshToken = refresh;

			res.status(200).json(response);
		} else {
			res.status(404).send('Invalid request');
		}
	}

	async login(
		req: Request<{}, {}, UserLoginDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.usersService.validateUser(req.body);
		if (!result) {
			return next(new HTTPError(401, 'ошибка авторизации.', 'login'));
		}
		const jwt = await this.signJWT(
			req.body.email,
			this.configService.get('SECRET'),
			this.configService.get('tokenLife'),
		);
		const refreshJWT = await this.signJWT(
			req.body.email,
			this.configService.get('refreshTokenSecret'),
			this.configService.get('refreshTokenLife'),
		);

		const response = {
			status: 'Logged in',
			token: jwt,
			refreshToken: refreshJWT,
		};
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		this.tokens['refreshToken'] = response;
		console.log(this.tokens);
		this.ok(res, response);
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

	private signJWT(email: string, secret: string, tokenLife: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			sign(
				{
					email,
					iat: Math.floor(Date.now() / 1000),
				},
				secret,
				{
					algorithm: 'HS256',
					expiresIn: tokenLife,
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
