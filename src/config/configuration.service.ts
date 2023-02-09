import { IConfigurationService } from "./configuration.service.interface";
import { config, DotenvParseOutput } from "dotenv";
import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { ILogger } from "../logger/logger.interface";

@injectable()
export class ConfigurationService implements IConfigurationService {
	private config: DotenvParseOutput;
	constructor(@inject(TYPES.ILogger) private loggerService: ILogger) {
		const result = config();
		if (result.error) {
			this.loggerService.error("[ConfigurationService] Не удалось прочитать файл .env");
		} else {
			this.loggerService.log("[ConfigurationService] Конфигурация .env успешно загружена");
			this.config = result.parsed as DotenvParseOutput;
		}
	}

	get<T extends number | string>(key: string): T {
		return this.config[key] as T;
	}
}
