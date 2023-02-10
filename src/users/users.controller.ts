import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { BaseController } from "../common/base.controller";
import { ILogger } from "../logger/logger.interface";
import { TYPES } from "../types";
import { IUserController } from "./users.controller.interface";
import { UserLoginDto } from "./dto/user.login.dto";
import { UserRegisterDto } from "./dto/user.register.dto";
import { IUserService } from "./users.service.interface";
import { HTTPError } from "../errors/http-error.class";
import { ValidateMiddleware } from "../common/validate.middleware";
import "reflect-metadata";
import { sign } from "jsonwebtoken";
import { IConfigurationService } from "../config/configuration.service.interface";
import { AuthGuard } from "../common/auth.guard";

@injectable()
export class UserController extends BaseController implements IUserController {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.IUserService) private userService: IUserService,
		@inject(TYPES.IConfigurationService) private configurationService: IConfigurationService,
	) {
		super(loggerService);
		this.bindRoutes([
			{
				path: "/register",
				method: "post",
				func: this.register,
				middlewares: [new ValidateMiddleware(UserRegisterDto)],
			},
			{
				path: "/login",
				method: "post",
				func: this.login,
				middlewares: [new ValidateMiddleware(UserLoginDto)],
			},
			{
				path: "/info",
				method: "get",
				func: this.info,
				middlewares: [new AuthGuard()],
			},
		]);
	}

	async info({ user }: Request, res: Response, next: NextFunction): Promise<void> {
		const userInfo = await this.userService.getUserInfo(user);
		this.ok(res, {
			email: userInfo?.email,
			id: userInfo?.id,
		});
	}

	async login(
		req: Request<{}, {}, UserLoginDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.userService.validateUser(req.body);
		if (!result) {
			return next(new HTTPError(401, "Ошибка авторизации", "login"));
		}
		const jwt = await this.signJWT(req.body.email, this.configurationService.get("TOKEN-SECRET"));
		this.ok(res, {
			jwt,
		});
	}

	async register(
		req: Request<{}, {}, UserRegisterDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const body = req.body;
		const result = await this.userService.createUser(body);
		if (!result) {
			return next(new HTTPError(422, "Такой пользователь уже существует", "register"));
		}
		this.ok(res, {
			email: result.email,
			id: result.id,
		});
	}

	private signJWT(email: string, secret: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			sign(
				{
					email,
					iat: Math.floor(Date.now() / 1000),
				},
				secret,
				{
					algorithm: "HS256",
				},
				(err, token) => {
					if (err) {
						reject(err);
					}
					resolve(token as string);
				},
			);
		});
	}
}
