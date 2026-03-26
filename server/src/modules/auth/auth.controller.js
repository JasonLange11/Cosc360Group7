
import { getCurrentUserFromToken, registerUser, loginUser } from './auth.services.js';

export async function register(req, res, next){
    try{
        const {email, password, name} = req.body;

        const authSession = await registerUser({
            email,
            password,
            name
        })

        res.status(201).json({
            message: 'User registered successfully',
            ...authSession,
        })
    }catch(error){
        next(error);
    }
}

export async function login(req, res, next){

    try{
        const {email, password} = req.body;

        const authSession = await loginUser({email, password})

        res.status(200).json({
            message: 'Login successful',
            ...authSession,
        })
    }catch(error){
        next(error);
    }
}

export async function me(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new Error('Auth token required');
        }

        const token = authHeader.slice(7);
        const user = await getCurrentUserFromToken(token);

        res.status(200).json({ user });
    } catch (error) {
        next(error);
    }
}