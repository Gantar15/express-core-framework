import express, { Express, RequestHandler } from "express";
import { Server } from "http";
import { UserController } from "./users/users.controller";
import { ILogger } from "./logger/logger.interface";
import { inject, injectable } from "inversify";
import { TYPES } from "./types";
import { IExeptionFilter } from "./errors/exception.filter.interface";
import { IConfigurationService } from "./config/configuration.service.interface";
import { PrismaService } from "./database/prisma.service";
import "reflect-metadata";

@injectable()
export class App {
	app: Express;
	server: Server;
	port: number;

	constructor(
		@inject(TYPES.ILogger) private logger: ILogger,
		@inject(TYPES.IUserController) private userController: UserController,
		@inject(TYPES.IExeptionFilter) private exceptionFilter: IExeptionFilter,
		@inject(TYPES.IConfigurationService) private configurationService: IConfigurationService,
		@inject(TYPES.PrismaService) private prismaService: PrismaService,
	) {
		this.app = express();
		this.port = 8000;
	}

	useMiddleware(middleware: RequestHandler): void {
		this.app.use(middleware);
	}

	useRoutes(): void {
		this.app.use("/users", this.userController.router);
	}

	useExeptionFilters(): void {
		this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
	}

	public init(): void {
		this.useMiddleware(express.json());
		this.useRoutes();
		this.useExeptionFilters();
		this.prismaService.connect();
		this.server = this.app.listen(this.port);
		this.logger.log(`Сервер запущен на http://localhost:${this.port}`);
	}
}
