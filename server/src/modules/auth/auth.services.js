
import bcrypt from 'bcrypt';
import { createUser, findUserByEmail } from '../users/users.repository.js';

const SALT_ROUNDS = 10;

function toSafeUser(user){
    return{
        id: user._id,
        email: user.email,
        name: user.name,
    }
}

export async function registerUser({email, password, name}){
    if(!email || !password || !name){
        throw new Error('Name, email, and password are required');
    }

    const existingUser = await findUserByEmail(email);

    if(existingUser){
        throw new Error('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await createUser({email, password: hashedPassword, name});

    return toSafeUser(user);
}

export async function loginUser({email, password}){
    if(!email || !password){
        throw new Error("Email and password are required");
    }

    const user = await findUserByEmail(email);

    if(!user){
        throw new Error('Invalid email or password');
    }

    const passwordIsHashed = typeof user.password === 'string' && user.password.startsWith('$2');
    const passwordMatches = passwordIsHashed
        ? await bcrypt.compare(password, user.password)
        : user.password === password;

    if(!passwordMatches){
        throw new Error('Invalid email or password');
    }

    return toSafeUser(user);
    
}