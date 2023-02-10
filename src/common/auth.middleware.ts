import { IMiddleware } from "./middleware.interface";
import { NextFunction, Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";

export class AuthMiddleware implements IMiddleware {
	constructor(private secret: string) {}
	execute(req: Request, resp: Response, next: NextFunction): void {
		if (req.headers.authorization) {
			const token = req.headers.authorization.split(" ")[1];
			verify(token, this.secret, (err, payload) => {
				if (err) {
					next();
				} else if (payload) {
					req.user = (payload as JwtPayload).email;
					next();
				}
			});
		}
		next();
	}
}
