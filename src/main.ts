import { IExeptionFilter } from './errors/exception.filter.interface';
import { ILogger } from './logger/logger.interface';
import { LoggerService } from './logger/logger.service';
import { App } from './app';
import { UserContoller } from './users/users.controller';
import { ExceptionFilter } from './errors/exception.filter';
import { Container } from 'inversify';
import { TYPES } from './types';


	const appContainer = new Container();
	appContainer.bind<ILogger>(TYPES.ILogger).to(LoggerService);
	appContainer.bind<IExeptionFilter>(TYPES.ExceptionFilter).to(ExceptionFilter);
	appContainer.bind<UserContoller>(TYPES.UserContoller).to(UserContoller);
	appContainer.bind<App>(TYPES.Application).to(App);
	const app = appContainer.get<App>(TYPES.Application);
	app.init()

	export {app, appContainer};