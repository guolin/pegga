import knex from 'knex';
import PromisePool from 'es6-promise-pool';

const now = () => Math.round(new Date().getTime() / 1000);

class Peppa {

  constructor(db) {
    this.db = knex(db);
    this.jobs = this.db('jobs');
  }

  init() {
    return this.db
      .schema.createTableIfNotExists('jobs', (table) => {
        table.increments();
        table.string('name');
        table.json('param');
        table.json('result');
        table.timestamp('join_at');
        table.timestamp('executed_at');
        table.boolean('locked'),
        table.timestamps();
      })
      .then(() => {
        return this.db.schema.createTableIfNotExists('status', (table) => {
          table.string('key');
          table.string('value');
        });
      });
  }

  add({name, param, result, locked = 0 }) {
    const job = {
      name, param, result, locked,
      join_at: now(), created_at: now(), updated_at: now()
    }
    return this.getAll().where('name', name).then(rows => {
      if (rows.length === 0) {
        console.log('add', job.name);
        const result = this.jobs.insert(job);
        return result.then(r => console.log(r));
      } else {
        return this.update(job);
      }
    });
  }
  process(runner) {
    return this.get()
      .then(job => {
        return this.update(Object.assign(job, { locked: 1 }));
      })
      .then(job => {
        return runner(job);
      })
      .then(job => {
        return this.update(Object.assign(job, {
          locked: 0,
          executed_at: now(),
        }));
      });
  }
  update(job) {
    const afterJob = Object.assign(job, { updated_at: now() });
    return this.getAll()
      .where('name', afterJob.name)
      .update(afterJob)
      .then(() => afterJob);
  }
  remove({ name }) {
    return this.jobs.where('name', name).del();
  }
  getAll() {
    return this.db.select('*').from('jobs');
  }
  get() {
    return this.db
      .select('*')
      .from('jobs')
      .where('locked', 0)
      .limit(1)
      .then(data => data[0]);
  }

  start(runner){
    const promiseProducer = () => {
      this.process(runner);
    };
    const concurrency = 1;
    const pool = new PromisePool(promiseProducer, concurrency)
    const poolPromise = pool.start()
    return poolPromise.then(function () {
      console.log('All promises fulfilled')
    }, function (error) {
      console.log('Some promise rejected: ' + error);
      throw error;
    })

  }
}

export default Peppa;