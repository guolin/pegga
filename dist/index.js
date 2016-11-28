'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _knex = require('knex');

var _knex2 = _interopRequireDefault(_knex);

var _es6PromisePool = require('es6-promise-pool');

var _es6PromisePool2 = _interopRequireDefault(_es6PromisePool);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var now = function now() {
  return Math.round(new Date().getTime() / 1000);
};

var Peppa = function () {
  function Peppa(db) {
    _classCallCheck(this, Peppa);

    this.db = (0, _knex2.default)(db);
    this.jobs = this.db('jobs');
  }

  _createClass(Peppa, [{
    key: 'init',
    value: function init() {
      var _this = this;

      return this.db.schema.createTableIfNotExists('jobs', function (table) {
        table.increments();
        table.string('name');
        table.json('param');
        table.json('result');
        table.timestamp('join_at');
        table.timestamp('executed_at');
        table.boolean('locked'), table.timestamps();
      }).then(function () {
        return _this.db.schema.createTableIfNotExists('status', function (table) {
          table.string('key');
          table.string('value');
        });
      });
    }
  }, {
    key: 'add',
    value: function add(_ref) {
      var _this2 = this;

      var name = _ref.name,
          param = _ref.param,
          result = _ref.result,
          _ref$locked = _ref.locked,
          locked = _ref$locked === undefined ? 0 : _ref$locked;

      var job = {
        name: name, param: param, result: result, locked: locked,
        join_at: now(), created_at: now(), updated_at: now()
      };
      return this.getAll().where('name', name).then(function (rows) {
        if (rows.length === 0) {
          console.log('add', job.name);
          var _result = _this2.jobs.insert(job);
          return _result.then(function (r) {
            return console.log(r);
          });
        } else {
          return _this2.update(job);
        }
      });
    }
  }, {
    key: 'process',
    value: function process(runner) {
      var _this3 = this;

      return this.get().then(function (job) {
        return _this3.update(Object.assign(job, { locked: 1 }));
      }).then(function (job) {
        return runner(job);
      }).then(function (job) {
        return _this3.update(Object.assign(job, {
          locked: 0,
          executed_at: now()
        }));
      });
    }
  }, {
    key: 'update',
    value: function update(job) {
      var afterJob = Object.assign(job, { updated_at: now() });
      return this.getAll().where('name', afterJob.name).update(afterJob).then(function () {
        return afterJob;
      });
    }
  }, {
    key: 'remove',
    value: function remove(_ref2) {
      var name = _ref2.name;

      return this.jobs.where('name', name).del();
    }
  }, {
    key: 'getAll',
    value: function getAll() {
      return this.db.select('*').from('jobs');
    }
  }, {
    key: 'get',
    value: function get() {
      return this.db.select('*').from('jobs').where('locked', 0).limit(1).then(function (data) {
        return data[0];
      });
    }
  }, {
    key: 'start',
    value: function start(runner) {
      var _this4 = this;

      var promiseProducer = function promiseProducer() {
        _this4.process(runner);
      };
      var concurrency = 1;
      var pool = new _es6PromisePool2.default(promiseProducer, concurrency);
      var poolPromise = pool.start();
      return poolPromise.then(function () {
        console.log('All promises fulfilled');
      }, function (error) {
        console.log('Some promise rejected: ' + error);
        throw error;
      });
    }
  }]);

  return Peppa;
}();

exports.default = Peppa;