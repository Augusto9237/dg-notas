const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('='.repeat(50));
console.log('CHAVES VAPID GERADAS');
console.log('='.repeat(50));
console.log('\nAdicione ao seu .env.local:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_EMAIL=as.code.dev25@gmail.com`);
console.log('\n' + '='.repeat(50));