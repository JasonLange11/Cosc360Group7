const ERROR_STATUS_MAP = {
	'Email already in use': 409,
	'Name, email, and password are required': 400,
	'Email and password are required': 400,
	'Tag is required': 400,
	'Tag cannot be empty': 400,
	'Parent type and parent id are required': 400,
	'Content is required': 400,
	'Image file is required': 400,
	'Only image uploads are allowed': 400,
	'Image must be 5MB or smaller': 400,
	'Failed to upload image': 400,
	'At least one profile field is required': 400,
	'Old password is required to set a new password': 400,
	'Old password is incorrect': 400,
	'Invalid email or password': 401,
	'Auth token required': 401,
	'Invalid or expired token': 401,
	'Authentication required': 401,
	Forbidden: 403,
	'Admin access required': 403,
	'Cannot delete admin user': 403,
	'Admins can not create events': 403,
	'Event not found': 404,
	'Comment not found': 404,
	'Upload not found': 404,
	'User not found': 404,
};

export function errorHandler(err, req, res, next) {
	const message = err?.message || 'Internal server error';
	const status = err?.status || ERROR_STATUS_MAP[message] || 500;

	if (status >= 500) {
		console.error(err);
	}

	res.status(status).json({ message });
}
