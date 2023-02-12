import { boot } from "../src/main";
import { App } from "../src/app";
import request from "supertest";

let application: App;

beforeAll(async () => {
	const res = await boot;
	application = res.app;
});

let jwtToken;

describe("Users e2e", () => {
	it("Register error", async () => {
		const res = await request(application.app)
			.post("/users/register")
			.send({ email: "asdasd@mail.ru", password: "hi", name: "dto" });
		expect(res.statusCode).toBe(422);
	});

	it("Login - success", async () => {
		const res = await request(application.app)
			.post("/users/login")
			.send({ email: "asdasd@mail.ru", password: "hi" });
		jwtToken = res.body.jwt;
		expect(jwtToken).not.toBeUndefined();
		expect(res.statusCode).toBe(200);
	});

	it("Login - error", async () => {
		const res = await request(application.app)
			.post("/users/login")
			.send({ email: "asdasd@mail.ru", password: "hi1" });
		expect(res.statusCode).toBe(401);
	});

	it("Info - success", async () => {
		const loginRes = await request(application.app)
			.post("/users/login")
			.send({ email: "asdasd@mail.ru", password: "hi" });
		const res = await request(application.app)
			.get("/users/info")
			.set("Authorization", `Bearer ${loginRes.body.jwt}`)
			.send();
		expect(res.body.email).toBe("asdasd@mail.ru");
		expect(res.statusCode).toBe(200);
	});

	it("Info - error", async () => {
		const res = await request(application.app).get("/users/info").send();
		expect(res.statusCode).toBe(401);
	});
});

afterAll(() => {
	application.close();
});
