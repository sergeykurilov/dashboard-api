import { IsString } from 'class-validator';

export class UserTokenDto {
	@IsString()
	refreshToken: string;
}
