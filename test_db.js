const { Client } = require('pg');
const client = new Client({
  user: 'postgres',
  password: 'postgres123',
  host: 'localhost',
  port: 5432,
  database: 'postgres'
});

async function run() {
  await client.connect();
  const res = await client.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema = 'auth';");
  console.log(res.rows);
  await client.end();
}
run();
