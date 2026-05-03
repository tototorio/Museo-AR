import argon2 from "argon2";

const ARGON2_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 1,
}

export async function hashPassword(plain: string): Promise<string> {
    return await argon2.hash(plain, ARGON2_OPTIONS);
}

export async function verifyPassword(hash: string, plain: string): Promise<boolean> {
    return await argon2.verify(hash, plain);
}