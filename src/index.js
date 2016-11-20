import knex, {fn} from 'knex';

class Peppa {
  constructor(db) {
    this.db = knex(db);
    this.jobs = this.db('jobs');
  }

  init() {
    return this.db.schema.createTableIfNotExists('jobs', (table) => {
      table.increments();
      table.string('name');
      table.json('param');
      table.json('result');
      table.timestamp('join_at');
      table.timestamp('executed_at');
      table.timestamps();
    });
  }

  add({name, param, result}) {
    const now = Math.round(new Date().getTime() / 1000);
    const job = {
      name, param, result,
      join_at: now, created_at: now, updated_at: now
    }
    return this.jobs.where('name', name).then(rows => {
      if (rows.length != 1) {
        device.key = value;
        return this.jobs.insert(job);
      } else {
        return this.jobs.where('name', name).update(job);
      }
    });
  }
  remove() {
    console.log('delete');
  }
  get() {
    return this.db('jobs').select();
  }
  update() {
    console.log('delete');
  }
}

export default Peppa;