import { ILogger } from './logger/logger.interface';
import express, { Express } from 'express';
import { Server } from 'http';
import { ExceptionFilter } from './errors/exception.filter';
import { LoggerService } from './logger/logger.service';
import { UserContoller } from './users/users.controller';

export class App {
	app: Express;
	server: Server;
	port: number;
	logger: ILogger;
	userController: UserContoller;
	exeptionFilter: ExceptionFilter;

	constructor(logger: ILogger, 
				userController: UserContoller,
				exeptionFilter: ExceptionFilter
		) {
		this.logger = logger;
		this.app = express();
		this.port = 8000;
		this.userController = userController;
		this.exeptionFilter = exeptionFilter;
	}

	useRoutes() {
		this.app.use('/users', this.userController.router);
	}

	useExeptionFilters() {
		this.app.use(this.exeptionFilter.catch.bind(this.exeptionFilter));
	}

	public async init() {
		this.useRoutes();
		this.useExeptionFilters();
		this.server = this.app.listen(this.port);
		this.logger.log(`Сервер запущен на http://localhost:${this.port}`)
	}
}