'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _knex = require('knex');

var _knex2 = _interopRequireDefault(_knex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Peppa = function () {
  function Peppa(db) {
    _classCallCheck(this, Peppa);

    this.db = (0, _knex2.default)(db);
    this.jobs = this.db('jobs');
  }

  _createClass(Peppa, [{
    key: 'init',
    value: function init() {
      return this.db.schema.createTableIfNotExists('jobs', function (table) {
        table.increments();
        table.string('name');
        table.json('param');
        table.json('result');
        table.timestamp('join_at');
        table.timestamp('executed_at');
        table.timestamps();
      });
    }
  }, {
    key: 'add',
    value: function add(_ref) {
      var _this = this;

      var name = _ref.name,
          param = _ref.param,
          result = _ref.result;

      var now = Math.round(new Date().getTime() / 1000);
      var job = {
        name: name, param: param, result: result,
        join_at: now, created_at: now, updated_at: now
      };
      return this.jobs.where('name', name).then(function (rows) {
        if (rows.length != 1) {
          device.key = value;
          return _this.jobs.insert(job);
        } else {
          return _this.jobs.where('name', name).update(job);
        }
      });
    }
  }, {
    key: 'remove',
    value: function remove() {
      console.log('delete');
    }
  }, {
    key: 'get',
    value: function get() {
      return this.db('jobs').select();
    }
  }, {
    key: 'update',
    value: function update() {
      console.log('delete');
    }
  }]);

  return Peppa;
}();

exports.default = Peppa;