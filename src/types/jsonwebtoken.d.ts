declare module "jsonwebtoken" {
  export type Secret = string | Buffer;

  export interface SignOptions {
    expiresIn?: string | number;
  }

  export interface JwtPayload {
    [key: string]: unknown;
  }

  export function sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: Secret,
    options?: SignOptions,
  ): string;

  export function verify(token: string, secretOrPublicKey: Secret): string | JwtPayload;

  const jwt: {
    sign: typeof sign;
    verify: typeof verify;
  };

  export default jwt;
}
