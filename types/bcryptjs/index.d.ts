declare module 'bcryptjs' {
    export function genSalt(rounds?: number): Promise<string>;
    export function hash(s: string, salt: string): Promise<string>;
    export function compare(s: string, hash: string): Promise<boolean>;
    export function genSaltSync(rounds?: number): string;
    export function hashSync(s: string, salt: string | number): string;
    export function compareSync(s: string, hash: string): boolean;
  }