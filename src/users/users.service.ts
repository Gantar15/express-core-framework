import { inject, injectable } from "inversify";
import { TYPES } from "../types";
import { UserRegisterDto } from "./dto/user.register.dto";
import { User } from "./user.entity";
import { IUserService } from "./users.service.interface";
import { IConfigurationService } from "../config/configuration.service.interface";
import { IUsersRepository } from "./users.repository.interface";
import { UserModel } from "@prisma/client";
import { UserLoginDto } from "./dto/user.login.dto";
import "reflect-metadata";

@injectable()
export class UserService implements IUserService {
	constructor(
		@inject(TYPES.IConfigurationService) private configurationService: IConfigurationService,
		@inject(TYPES.IUsersRepository) private usersRepository: IUsersRepository,
	) {}

	async createUser({ name, email, password }: UserRegisterDto): Promise<UserModel | null> {
		const existedUser = await this.usersRepository.find(email);
		if (existedUser) return null;
		const newUser = new User(email, name);
		const salt = this.configurationService.get<number>("PASS-SALT");
		await newUser.setPassword(password, Number(salt));
		return this.usersRepository.create(newUser);
	}

	async validateUser(user: UserLoginDto): Promise<boolean> {
		const existedUser = await this.usersRepository.find(user.email);
		if (!existedUser) {
			return false;
		}
		const newUser = new User(existedUser.email, existedUser.name, existedUser.password);
		return newUser.comparePassword(user.password);
	}

	getUserInfo(email: string): Promise<UserModel | null> {
		return this.usersRepository.find(email);
	}
}
