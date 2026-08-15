const fs = require('fs');



const birthDate = new Date(2003, 5, 29); 
const startCodingDate = new Date(2023, 2, 10); 

// Usamos la fecha y hora actual
const today = new Date();

// 2. Calcular la edad exacta
let age = today.getFullYear() - birthDate.getFullYear();
const monthDiff = today.getMonth() - birthDate.getMonth();
if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
}

// 3. Calcular los días transcurridos
const daysCoding = Math.floor((today - startCodingDate) / (1000 * 60 * 60 * 24));

// 4. Leer tu archivo README
let readme = fs.readFileSync('README.md', 'utf-8');

// 5. Reemplazar los valores usando Expresiones Regulares
readme = readme.replace(/<!-- START_AGE -->.*<!-- END_AGE -->/, `<!-- START_AGE -->${age}<!-- END_AGE -->`);
readme = readme.replace(/<!-- START_DAYS -->.*<!-- END_DAYS -->/, `<!-- START_DAYS -->${daysCoding}<!-- END_DAYS -->`);

// 6. Guardar el archivo sobreescrito
fs.writeFileSync('README.md', readme);
console.log("¡README actualizado con éxito!");
