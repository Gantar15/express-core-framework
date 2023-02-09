import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { UserRegisterDto } from "./dto/user.register.dto";
import { User } from "./user.entity";
import { IUserService } from "./users.service.interface";
import { IConfigurationService } from "../config/configuration.service.interface";
import "reflect-metadata";
import { IUsersRepository } from "./users.repository.interface";
import { UserModel } from "@prisma/client";

@injectable()
export class UserService implements IUserService {
	constructor(
		@inject(TYPES.IConfigurationService) private configurationService: IConfigurationService,
		@inject(TYPES.IUsersRepository) private usersRepository: IUsersRepository,
	) {}

	async createUser({ name, email, password }: UserRegisterDto): Promise<UserModel | null> {
		const newUser = new User(email, name);
		const salt = this.configurationService.get<number>("PASS-SALT");
		await newUser.setPassword(password, Number(salt));
		const existedUser = await this.usersRepository.find(email);
		if (existedUser) return null;
		return this.usersRepository.create(newUser);
	}

	async validateUser(dto: UserRegisterDto): Promise<boolean> {
		return true;
	}
}
