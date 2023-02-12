import "reflect-metadata";
import { UserModel } from "@prisma/client";
import { IConfigurationService } from "config/configuration.service.interface";
import { Container } from "inversify";
import { TYPES } from "../types";
import { User } from "./user.entity";
import { IUsersRepository } from "./users.repository.interface";
import { UserService } from "./users.service";
import { IUserService } from "./users.service.interface";

const ConfigurationServiceMock: IConfigurationService = {
	get: jest.fn(),
};

const UsersRepositoryMock: IUsersRepository = {
	find: jest.fn(),
	create: jest.fn(),
};

const container = new Container();
let usersService: IUserService;
let configurationService: IConfigurationService;
let usersRepository: IUsersRepository;

beforeAll(() => {
	container.bind<IUserService>(TYPES.IUserService).to(UserService);
	container
		.bind<IConfigurationService>(TYPES.IConfigurationService)
		.toConstantValue(ConfigurationServiceMock);
	container.bind<IUsersRepository>(TYPES.IUsersRepository).toConstantValue(UsersRepositoryMock);

	usersService = container.get<IUserService>(TYPES.IUserService);
	configurationService = container.get<IConfigurationService>(TYPES.IConfigurationService);
	usersRepository = container.get<IUsersRepository>(TYPES.IUsersRepository);
});

let createdUser: UserModel | null;

describe("User service", () => {
	it("createUser - existed user", async () => {
		configurationService.get = jest.fn().mockReturnValueOnce("secure");
		usersRepository.find = jest.fn().mockReturnValueOnce({});
		const createdUser = await usersService.createUser({
			email: "egor@mail.ru",
			password: "pass",
			name: "egor",
		});
		expect(createdUser).toBeNull();
	});

	it("createUser - seccess", async () => {
		configurationService.get = jest.fn().mockReturnValueOnce("secure");
		usersRepository.create = jest.fn().mockImplementationOnce(
			(user: User): UserModel => ({
				name: user.name,
				email: user.email,
				password: user.password,
				id: 1,
			}),
		);
		createdUser = await usersService.createUser({
			email: "egor@mail.ru",
			password: "pass",
			name: "egor",
		});
		expect(createdUser?.id).toEqual(1);
		expect(createdUser?.password).not.toEqual("pass");
	});

	it("validateUser - wrong user", async () => {
		usersRepository.find = jest.fn().mockReturnValueOnce(null);
		const validateResult = await usersService.validateUser({
			email: "egor@mail.ru",
			password: "pass",
		});
		expect(validateResult).toBeFalsy();
	});

	it("validateUser - wrong password", async () => {
		usersRepository.find = jest.fn().mockReturnValueOnce(createdUser);
		const validateResult = await usersService.validateUser({
			email: "egor@mail.ru",
			password: "pass2",
		});
		expect(validateResult).toBeFalsy();
	});

	it("validateUser - success", async () => {
		usersRepository.find = jest.fn().mockReturnValueOnce(createdUser);
		const validateResult = await usersService.validateUser({
			email: "egor@mail.ru",
			password: "pass",
		});
		expect(validateResult).toBeTruthy();
	});
});
