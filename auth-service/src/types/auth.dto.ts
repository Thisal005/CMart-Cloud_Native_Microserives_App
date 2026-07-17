import { Role, AccountStatus } from '../models/user';

export interface RegisterRequestDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role?: Role;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface UserResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  status: AccountStatus;
  emailVerified: boolean;
}

export interface AuthResponseDto {
  token: string;
  refreshToken: string;
  user: UserResponseDto;
}

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface RefreshTokenResponseDto {
  token: string;
  refreshToken: string;
}

export interface ValidateResponseDto {
  valid: boolean;
  user?: UserResponseDto;
}

