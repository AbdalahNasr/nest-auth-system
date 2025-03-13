/* eslint-disable prettier/prettier */
export interface TwoFactorSecret {
    ascii: string;
    hex: string;
    base32: string;
    otpauth_url: string;
}

export interface Enable2FAResponse {
    secret: string;
    otpauthUrl: string;
}