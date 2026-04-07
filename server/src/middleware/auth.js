import { getCurrentUserFromToken } from '../modules/auth/auth.services.js'

function getBearerToken(authHeader) {
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return null
	}

	return authHeader.slice(7)
}

export async function authenticateUser(req, res, next) {
	try {
		const authHeader = req.headers.authorization;
		const token = getBearerToken(authHeader)

		if (!token) {
			return next(new Error('Auth token required'));
		}

		const user = await getCurrentUserFromToken(token);

		req.user = user;
		next();
	} catch (error) {
		next(error);
	}
}

export async function optionalAuthenticateUser(req, res, next) {
	try {
		const token = getBearerToken(req.headers.authorization)

		if (!token) {
			return next()
		}

		req.user = await getCurrentUserFromToken(token)
		next()
	} catch (error) {
		next(error)
	}
}

export function requireAdmin(req, res, next) {
	if (!req.user) {
		return next(new Error('Auth token required'));
	}

	if (!req.user.isAdmin) {
		return next(new Error('Admin access required'));
	}

	next();
}
