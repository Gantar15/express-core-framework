import { IsEmail, IsString } from "class-validator";

export class UserLoginDto {
	@IsEmail({}, { message: "Некорректный email" })
	email: string;

	@IsString({ message: "Не указан пароль" })
	password: string;
}
