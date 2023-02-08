import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { BaseController } from "../common/base.controller";
import { ILogger } from "../logger/logger.interface";
import { TYPES } from "../types";
import { IUserController } from "./users.controller.interface";
import { UserLoginDto } from "./dto/user.login.dto";
import { UserRegisterDto } from "./dto/user.register.dto";
import { IUserService } from "./users.service.interface";
import { User } from "./user.entity";
import "reflect-metadata";
import { HTTPError } from "../errors/http-error.class";

@injectable()
export class UserController extends BaseController implements IUserController {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.IUserService) private userService: IUserService,
	) {
		super(loggerService);
		this.bindRoutes([
			{ path: "/register", method: "post", func: this.register },
			{ path: "/login", method: "post", func: this.login },
		]);
	}

	login(req: Request<{}, {}, UserLoginDto>, res: Response, next: NextFunction): void {
		console.log(req.body);
		this.ok(res, "login");
	}

	async register(
		req: Request<{}, {}, UserRegisterDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const body = req.body;
		const result = await this.userService.createUser(body);
		if (!result) {
			return next(new HTTPError(422, "Такой пользователь уже существует"));
		}
		this.ok(res, {
			email: result.email,
		});
	}
}
