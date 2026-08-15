const fs = require('fs');


const birthDate = new Date(2003, 5, 29); 
const startCodingDate = new Date(2023, 2, 1); 

const today = new Date();

let age = today.getFullYear() - birthDate.getFullYear();
const monthDiff = today.getMonth() - birthDate.getMonth();
if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
}

const daysCoding = Math.floor((today - startCodingDate) / (1000 * 60 * 60 * 24));

let readme = fs.readFileSync('README.md', 'utf-8');

readme = readme.replace(/<!-- START_AGE -->.*<!-- END_AGE -->/, `<!-- START_AGE -->${age}<!-- END_AGE -->`);
readme = readme.replace(/<!-- START_DAYS -->.*<!-- END_DAYS -->/, `<!-- START_DAYS -->${daysCoding}<!-- END_DAYS -->`);

fs.writeFileSync('README.md', readme);
console.log("¡README actualizado con éxito!");
