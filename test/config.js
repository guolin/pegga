
const db = {
  client: 'sqlite3',
  connection: {
    filename: "./mydb.sqlite"
  },
  useNullAsDefault: true
};

export { db };