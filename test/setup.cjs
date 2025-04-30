console.log('Loading .env file...');

require('dotenv').config({ path: './.env', override: true });
console.log(process.env.ENVIRONMENT);
