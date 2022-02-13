import { UserRegiserDto } from './dto/user-register.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { UserModel } from '@prisma/client';

export interface IUserService {
	createUser: (dto: UserRegiserDto) => Promise<UserModel | null>;
	validateUser: (dto: UserLoginDto) => Promise<boolean>;
	getUserInfo: (email: string) => Promise<UserModel | null>;
}
