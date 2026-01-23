const redis = require('./src/config/redis');

async function testExpiry() {
  const key = 'test:expiry';
  console.log('Setting key with 5s expiry...');
  await redis.set(key, 'value', 'EX', 5);

  const val1 = await redis.get(key);
  console.log(`Immediate get: ${val1}`);

  console.log('Waiting 7s...');
  await new Promise(r => setTimeout(r, 7000));

  const val2 = await redis.get(key);
  console.log(`Get after 7s: ${val2}`);

  process.exit();
}

testExpiry().catch(console.error);
