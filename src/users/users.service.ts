import { IUserService } from './users.service.interface';
import { UserRegiserDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { User } from './user.entity';
import { injectable } from 'inversify';
import 'reflect-metadata';

@injectable()
export class UsersService implements IUserService {
	async createUser({ email, name, password }: UserRegiserDto): Promise<User | null> {
		const newUser = new User(email, name);
		await newUser.setPassword(password);
		return null;
	}

	async validateUser(dto: UserLoginDto): Promise<boolean> {
		return true;
	}
}
