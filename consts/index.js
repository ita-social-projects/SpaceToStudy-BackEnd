const roles = {
    STUDENT: 'student',
    TEACHER: 'teacher',
    ADMIN: 'admin'
};

const errors = {
    USER_NOT_FOUND: 'Could not find user.',
    ADMIN_NOT_FOUND: 'Could not find admin.',
    TO_SHORT_PASSWORD: 'Password should contain at least 8 symbols',
    ROLE_NOT_SUPPORTED: 'There is no specified role'
}

module.exports = {
    roles,
    errors
};