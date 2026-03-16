
import { registerUser, loginUser } from './auth.services.js';

function getErrorStatus(errorMessage) {
    if (errorMessage === 'Email already in use') {
        return 409;
    }

    if (
        errorMessage === 'Name, email, and password are required' ||
        errorMessage === 'Email and password are required'
    ) {
        return 400;
    }

    if (errorMessage === 'Invalid email or password') {
        return 401;
    }

    return 500;
}

export async function register(req, res){
    try{
        const {email, password, name} = req.body;

        const user = await registerUser({
            email,
            password,
            name
        })

        res.status(201).json({
            message: 'User registered successfully',
            user,
        })
    }catch(error){
        const status = getErrorStatus(error.message);
        res.status(status).json({message: error.message || 'Registration failed'});
    }
}

export async function login(req, res){

    try{
        const {email, password} = req.body;

        const user = await loginUser({email, password})

        res.status(200).json({
            message: 'Login successful',
            user,
        })
    }catch(error){
        const status = getErrorStatus(error.message);
        res.status(status).json({message: error.message || 'Login failed'});
    }
}