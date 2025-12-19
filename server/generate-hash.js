const bcrypt = require('bcryptjs');

const password = 'Ranucci2007:)Roman2007';
const hash = bcrypt.hashSync(password, 10);

console.log('Contraseña:', password);
console.log('Hash:', hash);

// Verificar que funciona
const isValid = bcrypt.compareSync(password, hash);
console.log('Verificación:', isValid);