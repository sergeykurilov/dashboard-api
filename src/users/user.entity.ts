import { compare, hash } from 'bcryptjs';

export class User {
	private _password: string;

	constructor(
		private readonly _email: string,
		private readonly _name: string,
		private passwordHash?: string,
	) {
		if (passwordHash) {
			this._password = passwordHash;
		}
	}

	get email(): string {
		return this._email;
	}

	get name(): string {
		return this._name;
	}

	get password(): string {
		return this._password;
	}

	public async setPassword(password: string, salt: number): Promise<void> {
		this._password = await hash(password, salt);
	}

	public async comparePassword(password: string): Promise<boolean> {
		return await compare(password, this._password);
	}
}
