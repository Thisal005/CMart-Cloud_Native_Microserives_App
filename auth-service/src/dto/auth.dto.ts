import { UserRole } from '../model/user';

export interface RegisterRequestDto {
  username: string;
  email: string;
  password?: string; // made optional in types for flexibility, but verified in logic
  role?: UserRole;
}

export interface LoginRequestDto {
  username: string;
  password?: string;
}

export interface UserResponseDto {
  id: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface AuthResponseDto {
  token: string;
  user: UserResponseDto;
}

export interface ValidateResponseDto {
  valid: boolean;
  user?: UserResponseDto;
}
