import { IsEmail, IsString } from 'class-validator';

export class UserRegiserDto {
	@IsEmail({}, { message: 'Неверно указано имя' })
	name: string;
	@IsString({ message: 'Неверно указан email' })
	email: string;
	@IsString({ message: 'Неверно указан пароль' })
	password: string;
}
