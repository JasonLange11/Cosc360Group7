import { getCurrentUserFromToken } from '../modules/auth/auth.services.js'

export async function authenticateUser(req, res, next) {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({ message: 'Auth token required' });
		}

		const token = authHeader.slice(7);
		const user = await getCurrentUserFromToken(token);

		req.user = user;
		next();
	} catch (error) {
		return res.status(401).json({ message: error.message || 'Invalid or expired token' });
	}
}

export function requireAdmin(req, res, next) {
	if (!req.user) {
		return res.status(401).json({ message: 'Auth token required' });
	}

	if (!req.user.isAdmin) {
		return res.status(403).json({ message: 'Admin access required' });
	}

	next();
}
