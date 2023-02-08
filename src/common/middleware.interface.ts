import { NextFunction, Request, Response } from "express";

export interface IMiddleware {
	execute(req: Request, resp: Response, next: NextFunction): void;
}
