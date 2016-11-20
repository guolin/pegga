import Peppa from '../dist/index';
import { expect } from 'chai';

import { db } from './config';

describe('Peppa init', () => {
  describe('init db', () => {
    it('should init the db and get a ready message', (done) => {
      const peppa = new Peppa(db);
      peppa.init().then(() => {
        done();
      });
    })
  })
  describe('add to  db', () => {
    it('add someting to db', (done) => {
      const peppa = new Peppa(db);
      peppa.add({
        name: 'mulumu2.com',
        param: JSON.stringify({domain: ['mulumu.com'], urls: ['http://www.mulumu.com']}),
        result: JSON.stringify(['ga'])
      }).then(() => {
        done();
      });
    });
    it('get someting', (done) => {
      const peppa = new Peppa(db);
      peppa.get().then((raws) => {
        console.log(raws);
        expect(raws).to.have.length.above(0);
        done();
      });
    })
  })
})
