import { injectable } from "inversify";
import "reflect-metadata";
import { UserRegisterDto } from "./dto/user.register.dto";
import { User } from "./user.entity";
import { IUserService } from "./users.service.interface";

@injectable()
export class UserService implements IUserService {
	async createUser({ name, email, password }: UserRegisterDto): Promise<User | null> {
		const newUser = new User(email, name);
		await newUser.setPassword(password);
		return newUser;
		return null;
	}
	async validateUser(dto: UserRegisterDto): Promise<boolean> {
		return true;
	}
}
