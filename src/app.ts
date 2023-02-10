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
import { AuthMiddleware } from "./common/auth.middleware";

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

	useMiddleware(): void {
		this.app.use(express.json());
		const authMiddleware = new AuthMiddleware(this.configurationService.get("TOKEN-SECRET"));
		this.app.use(authMiddleware.execute.bind(authMiddleware));
	}

	useRoutes(): void {
		this.app.use("/users", this.userController.router);
	}

	useExeptionFilters(): void {
		this.app.use(this.exceptionFilter.catch.bind(this.exceptionFilter));
	}

	public init(): void {
		this.useMiddleware();
		this.useRoutes();
		this.useExeptionFilters();
		this.prismaService.connect();
		this.server = this.app.listen(this.port);
		this.logger.log(`Сервер запущен на http://localhost:${this.port}`);
	}
}
