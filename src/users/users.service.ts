import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { UserRegisterDto } from "./dto/user.register.dto";
import { User } from "./user.entity";
import { IUserService } from "./users.service.interface";
import { IConfigurationService } from "../config/configuration.service.interface";
import "reflect-metadata";

@injectable()
export class UserService implements IUserService {
	constructor(
		@inject(TYPES.IConfigurationService) private configurationService: IConfigurationService,
	) {}

	async createUser({ name, email, password }: UserRegisterDto): Promise<User | null> {
		const newUser = new User(email, name);
		const salt = this.configurationService.get<number>("PASS-SALT");
		await newUser.setPassword(password, Number(salt));
		return newUser;
		return null;
	}

	async validateUser(dto: UserRegisterDto): Promise<boolean> {
		return true;
	}
}
