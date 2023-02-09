import { Container, ContainerModule } from "inversify";
import { App } from "./app";
import { ConfigurationService } from "./config/configuration.service";
import { IConfigurationService } from "./config/configuration.service.interface";
import { PrismaService } from "./database/prisma.service";
import { ExceptionFilter } from "./errors/exception.filter";
import { IExeptionFilter } from "./errors/exception.filter.interface";
import { ILogger } from "./logger/logger.interface";
import { LoggerService } from "./logger/logger.service";
import { TYPES } from "./types";
import { UserController } from "./users/users.controller";
import { IUserController } from "./users/users.controller.interface";
import { UsersRepository } from "./users/users.repository";
import { IUsersRepository } from "./users/users.repository.interface";
import { UserService } from "./users/users.service";
import { IUserService } from "./users/users.service.interface";

interface IBootsrtapReturn {
	app: App;
	appContainer: Container;
}

export const appBindings = new ContainerModule((bind) => {
	bind<ILogger>(TYPES.ILogger).to(LoggerService).inSingletonScope();
	bind<App>(TYPES.Application).to(App).inSingletonScope();
	bind<IExeptionFilter>(TYPES.IExeptionFilter).to(ExceptionFilter).inSingletonScope();
	bind<IUserController>(TYPES.IUserController).to(UserController).inSingletonScope();
	bind<IUserService>(TYPES.IUserService).to(UserService).inSingletonScope();
	bind<IConfigurationService>(TYPES.IConfigurationService)
		.to(ConfigurationService)
		.inSingletonScope();
	bind<PrismaService>(TYPES.PrismaService).to(PrismaService).inSingletonScope();
	bind<IUsersRepository>(TYPES.IUsersRepository).to(UsersRepository).inSingletonScope();
});

function bootstrap(): IBootsrtapReturn {
	const appContainer = new Container();
	appContainer.load(appBindings);
	const app = appContainer.get<App>(TYPES.Application);
	app.init();
	return { app, appContainer };
}

export const { app, appContainer } = bootstrap();
