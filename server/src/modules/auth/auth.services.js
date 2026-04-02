import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, findUserById } from '../users/users.repository.js';

const SALT_ROUNDS = 10;
const TOKEN_TTL = '7d';

function getJwtSecret() {
    return process.env.JWT_SECRET || 'development-only-change-me';
}

function toSafeUser(user) {
    if (!user) {
        throw new Error('Invalid or expired token');
    }

    return {
        id: user._id,
        email: user.email,
        name: user.name,
        bio: user.bio || '',
        location: user.location || '',
        favoriteTags: user.favoriteTags || [],
        profileImageUrl: user.profileImageUrl || '',
        isAdmin: Boolean(user.isAdmin),
    };
}

function createAuthResponse(user) {
    const safeUser = toSafeUser(user);
    const token = jwt.sign(
        {
            sub: safeUser.id.toString(),
            email: safeUser.email,
            isAdmin: safeUser.isAdmin,
        },
        getJwtSecret(),
        { expiresIn: TOKEN_TTL },
    );

    return { token, user: safeUser };
}

export async function registerUser({ email, password, name }) {
    if (!email || !password || !name) {
        throw new Error('Name, email, and password are required');
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
        throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await createUser({ email, password: hashedPassword, name });

    return createAuthResponse(user);
}

export async function loginUser({ email, password }) {
    if (!email || !password) {
        throw new Error('Email and password are required');
    }

    const user = await findUserByEmail(email);

    if (!user) {
        throw new Error('Invalid email or password');
    }

    const passwordIsHashed = typeof user.password === 'string' && user.password.startsWith('$2');
    const passwordMatches = passwordIsHashed
        ? await bcrypt.compare(password, user.password)
        : user.password === password;

    if (!passwordMatches) {
        throw new Error('Invalid email or password');
    }

    return createAuthResponse(user);
}

export async function getCurrentUserFromToken(token) {
    try {
        const payload = jwt.verify(token, getJwtSecret());
        const user = await findUserById(payload.sub);

        if (!user) {
            throw new Error('Invalid or expired token');
        }

        return toSafeUser(user);
    } catch {
        throw new Error('Invalid or expired token');
    }
}
