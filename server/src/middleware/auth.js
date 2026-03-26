import { getCurrentUserFromToken } from '../modules/auth/auth.services.js'

export async function authenticateUser(req, res, next) {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return next(new Error('Auth token required'));
		}

		const token = authHeader.slice(7);
		const user = await getCurrentUserFromToken(token);

		req.user = user;
		next();
	} catch (error) {
		next(error);
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
