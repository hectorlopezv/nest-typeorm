import {
    IsEmail,
    IsString,
    IsStrongPassword,
    MaxLength,
    MinLength,
  } from 'class-validator';
  
  export class LoginUserDto {
    @IsEmail()
    email: string;
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    @IsStrongPassword({
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
    password: string;
  
  }
  