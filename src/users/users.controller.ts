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

@injectable()
export class UserController extends BaseController implements IUsersInterface {
	constructor(
		@inject(TYPES.UsersService) private usersService: UsersService,
		@inject(TYPES.ILogger) private loggerService: LoggerService,
	) {
		super(loggerService);
		this.bindRoutes([
			{
				path: '/register',
				method: 'post',
				func: this.register,
				middlewares: [new ValidateMiddleware(UserRegiserDto)],
			},
			{ path: '/login', method: 'post', func: this.login },
		]);
	}

	login(req: Request<{}, {}, UserLoginDto>, res: Response, next: NextFunction): void {
		next(new HTTPError(401, 'Ошибка авторизации', 'login'));
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
		this.ok(res, { email: result.email });
	}
}
