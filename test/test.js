import Peppa from '../dist/index';
import { expect } from 'chai';
import fs from 'fs';

import { db } from './config';

const now = () => Math.round(new Date().getTime() / 1000);

describe('peppa', () => {
  const pe = new Peppa(db);
  before((done) => {
    pe.init().then(() => done());
  })
  after((done) => {
    const dbFile = db.connection.filename;
    fs.unlink(dbFile, done);
  })
  describe('add and get', () => {
    const job = {
      name: 'mulumu2.com',
      param: JSON.stringify({domain: ['mulumu.com'], urls: ['http://www.mulumu.com']}),
      result: JSON.stringify(['ga'])
    }
    it('should be success to add', (done) => {
      const pe = new Peppa(db);
      pe.add(job)
      .then(() => done())
      .catch(error => done(error));
    });
    it('should got that one', (done) => {
      const peppa = new Peppa(db);
      peppa.get().then((raw) => {
        expect(raw.name).to.equal(job.name);
        expect(raw.param).to.equal(job.param);
        expect(raw.result).to.equal(job.result);
        expect(raw.locked).to.equal(0);
        expect(raw.join_at).to.most(now());
        done();
      }).catch((error) => done(error));
    });
    it('should update job', (done) => {
      setTimeout(() => {
        const nextJob = Object.assign(job, {result: JSON.stringify(['ga', 'baidutongji'])});
        const pe = new Peppa(db);
        pe.update(nextJob)
          .then(() => pe.get())
          .then((data) => {
            expect(data.result).to.equal(JSON.stringify(['ga', 'baidutongji']));
            expect(data.updated_at).to.most(now());
            expect(data.updated_at).to.above(data.created_at);
          })
          .then(() => done());
      }, 1000)
    });
    after(done => {
      const pe = new Peppa(db);
      pe.remove({ name: job.name }).then(() => done());
    })
  })
  describe.skip('process jobs and lock them', () => {
    const job1 = {
      name: '36kr.com',
      param: JSON.stringify({domain: ['36kr.com'], urls: ['http://www.36kr.com']}),
      result: JSON.stringify(['baidutongji'])
    }
    const job2 = {
      name: 'ifanr.com',
      param: JSON.stringify({domain: ['ifanr.com'], urls: ['http://www.ifanr.com']}),
      result: JSON.stringify(['ga'])
    }
    const job3 = {
      name: 'zhihu.com',
      param: JSON.stringify({domain: ['zhihu.com'], urls: ['http://www.zhihu.com']}),
      result: JSON.stringify(['zhugeio']),
      locked: 1,
    }
    const pe = new Peppa(db);

    before('create 3 jobs one is locked', (done) => {
      pe.add(job1)
        .then(() => pe.add(job2))
        .then(() => pe.add(job3))
        .then(() => done())
        .catch(error => done(error));
    });

    it('should have 1 unlocked job when processing job', (done)=> {
      const run = (job) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            console.log('start to run', job.name);
            resolve(job);
          }, 600);
        });
      }
      pe.process(run).then(() => done());
      setTimeout(() => {
        pe.getAll()
          .then(jobs => {
            expect(jobs).to.have.length(3);
            expect(jobs.filter(j => j.locked)).to.have.length(2);
          });
      }, 300);
    });
    it('should have 2 unlocked job when all processed', (done) => {
      setTimeout(() => {
        pe.getAll()
          .then(jobs => {
            expect(jobs).to.have.length(3);
            expect(jobs.filter(j => j.locked)).to.have.length(1);
            done();
          });
      }, 1200);
    });
    after('cleanup 3 jobs', (done) => {
      pe.remove(job1)
        .then(() => pe.remove(job2))
        .then(() => pe.remove(job3))
        .then(() => done());
    });
  });
  describe('start a pool', () => {
    const jobs = [
      { name: '1kr.com' },
      { name: '2kr.com' },
      { name: '3kr.com' },
      { name: '4kr.com' },
      { name: '5kr.com' },
    ];
    before('add 5 jobs', (done) => {
      pe.getAll()
        .then(rows => {
          console.log('before');
          rows.forEach(job => console.log(job.name));
        })
        .then(() => {
          const ps = jobs.map((job) => pe.add(job));
          console.log('reduce');
          ps.reduce((p, n) => {
            return p.then(() => {
              console.log('next');
              return n;
            })}, Promise.resolve()
          )
          // pe.add(jobs[0])
          //   .then(() => pe.add(jobs[1]))
          //   .then(() => pe.add(jobs[2]))
          //   .then(() => pe.add(jobs[3]))
          //   .then(() => pe.add(jobs[4]))
            .then((props) => {
              console.log('props', props);
              pe.getAll().then(rows => rows.forEach(job => console.log(job.id, job.name, job, '\n')))
              done();
            })
            .catch(err => done(err));
        })

    });
    it('should run a queue for process jobs', (done) => {
      const runner = (job) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            console.log('start to run in pool', job.name);
            resolve(job);
          }, 100);
        });
      }
      pe.getAll().then(jobs => {
        jobs.forEach(job => console.log(job.name, job.id));
        expect(jobs).to.have.length(5);
      })
      pe.start(runner)
        .then(() => done())
        .catch(err => done(error));
    });
    it('设置一个下次指定时间，如果这个时间小鱼当前时间则为需要执行的。')
    it('每隔10分钟启动一次，若没有正在进行的队列则新建队列，若已经有了则暂停。');
    it('1.指定一个获取job的方法。若这个方法获取不到job了则自动停止。若系统中有正在运行队列，则不启动心队列，若没有则启动心队列。');
  })
})
