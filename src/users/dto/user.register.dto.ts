import { IsEmail, IsString } from "class-validator";
import "reflect-metadata";

export class UserRegisterDto {
	@IsEmail({}, { message: "Некорректный email" })
	email: string;

	@IsString({ message: "Не указан пароль" })
	password: string;

	@IsString({ message: "Не указано имя" })
	name: string;
}
