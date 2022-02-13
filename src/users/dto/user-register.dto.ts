import { IsEmail, IsString } from 'class-validator';

export class UserRegiserDto {
	@IsEmail({}, { message: 'Неверно указан email' })
	email: string;
	@IsString({ message: 'Неверно указано имя' })
	name: string;
	@IsString({ message: 'Неверно указан пароль' })
	password: string;
}
