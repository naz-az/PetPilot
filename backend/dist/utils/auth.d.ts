export interface TokenPayload {
    userId: string;
    email: string;
    userType: string;
}
export declare const hashPassword: (password: string) => Promise<string>;
export declare const comparePassword: (password: string, hashedPassword: string) => Promise<boolean>;
export declare const generateTokens: (payload: TokenPayload) => {
    accessToken: string;
    refreshToken: string;
};
export declare const verifyAccessToken: (token: string) => TokenPayload;
export declare const verifyRefreshToken: (token: string) => TokenPayload;
//# sourceMappingURL=auth.d.ts.map