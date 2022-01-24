import { NextFunction, Request, Response } from "express";
import { injectable } from "inversify";
import { LoggerService } from "../logger/logger.service";
import { IExeptionFilter } from "./exception.filter.interface";
import { HTTPError } from "./http-error.class";



@injectable()
export class ExceptionFilter implements IExeptionFilter {

	logger: LoggerService;

	constructor(
		logger: LoggerService
	){
		this.logger = logger;
	}

	catch(err: Error | HTTPError, req: Request, res: Response, next: NextFunction) {
		if(err instanceof HTTPError){
			this.logger.error(`[${err.context}]: Ошибка ${err.statusCode}: ${err.message}`)
			res.status(err.statusCode).send({err: err.message})
		} else {
			this.logger.error(`${err.message}`)
			res.status(500).send({err: err.message})
		}
	}
}