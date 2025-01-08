import { User } from 'src/users/entities/user.entity';
import { Roles } from 'src/users/types/user.types';
import { Wallet } from 'src/wallet/entities/wallet.entity';

export type Response<T> = {
  message: string;
  data?: T;
};

type Signin = {
  accessToken: string;
  refreshToken: string;
  wallet: Wallet;
};

type Signup = Pick<
  User,
  'id' | 'fullName' | 'email' | 'createdAt' | 'updatedAt'
>;

type AccessToken = Omit<Signin, 'refreshToken' | 'wallet'>;

type ForgotPassword = {
  otp: string;
};

type ResetPassword = Signup;

export type SigninResponse = Response<Signin>;
export type SignupResponse = Response<Signup>;
export type RefreshTokenResponse = Response<AccessToken>;
export type ForgotPasswordResponse = Response<ForgotPassword>;
export type ResetPasswordResponse = Response<ResetPassword>;

export type Payload = { sub: string; role: Roles };
