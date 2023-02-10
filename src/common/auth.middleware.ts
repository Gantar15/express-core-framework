import { IMiddleware } from "./middleware.interface";
import { NextFunction, Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import { promisify } from "util";

export class AuthMiddleware implements IMiddleware {
	constructor(private secret: string) {}

	async execute(req: Request, resp: Response, next: NextFunction): Promise<void> {
		if (req.headers.authorization) {
			const token = req.headers.authorization.split(" ")[1];
			const verifyAsync = promisify(verify.bind({}, token, this.secret, {}));
			try {
				const payload = await verifyAsync();
				req.user = (payload as JwtPayload).email;
				next();
			} catch (e) {
				next();
			}
		} else {
			next();
		}
	}
}
