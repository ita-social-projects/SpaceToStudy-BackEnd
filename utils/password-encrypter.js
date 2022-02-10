const bcrypt = require('bcrypt');
const saltRounds = 10;

const encryptPasword = (password) => bcrypt.hashSync(password, saltRounds);


const validatePassword = (password, hashedPassword) => bcrypt.compareSync(password, hashedPassword);

module.exports = {
    encryptPasword, validatePassword
}