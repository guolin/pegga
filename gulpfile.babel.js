import gulp from 'gulp';
import babel from 'gulp-babel';
import mocha from 'gulp-mocha';
import istanbul from 'gulp-istanbul';
import { Instrumenter } from 'isparta';
import del from 'del';

const paths = {
  es6: ['./server/src/**/*.js'],
  deploy: './dist/server',
  coverage: './coverage'
};

// 发布相关
gulp.task('clean', () => {
  del(paths.deploy);
});
gulp.task('web', () => {
  gulp.src(['./web/src/**/*.js', './web/src/**/*.jsx'])
    .pipe(babel())
    .pipe(gulp.dest('./dist/server/web'));
});
gulp.task('babel', ['clean', 'web'], () => {
  gulp.src(paths.es6)
    .pipe(babel())
    .pipe(gulp.dest(paths.deploy));
});
gulp.task('babelOnly', () => {
  gulp.src(paths.es6)
    .pipe(babel())
    .pipe(gulp.dest(paths.deploy));
});
gulp.task('watch', () => {
  gulp.watch(paths.es6, ['babelOnly']);
});

gulp.task('botbin', () => {
  gulp.src(paths.es6)
    .pipe(babel())
    .pipe(gulp.dest('./botbin'));
});

gulp.task('botdocker', () => {
  gulp.src(paths.es6)
    .pipe(babel())
    .pipe(gulp.dest('../mulumu-bot/crawl/botbin'));
});

// 代码覆盖
gulp.task('coverage', (cb) => {
  gulp.src(paths.es6)
    .pipe(istanbul({ // Covering files
      instrumenter: Instrumenter,
      includeUntested: true
    }))
    .pipe(istanbul.hookRequire()) // Force `require` to return covered files
    .on('finish', () => {
      gulp.src(['server/test/**/*spec.js'], { read: false })
        .pipe(mocha({ reporter: 'spec' }))
        .pipe(istanbul.writeReports({
          dir: paths.coverage,
          reportOpts: { dir: paths.coverage },
          reporters: ['text', 'text-summary', 'json', 'html']
        }))
        .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }))
        .on('end', cb);
    });
});

// 单元测试
gulp.task('test', () => {
  gulp.src(['server/test/**/*spec.js'], { read: false })
    .pipe(mocha({ ui: 'bdd', timeout: 5000 }))
    .once('end', () => {
      process.exit();
    });
});
gulp.task('test-junit', () => {
  gulp.src(['test/**/*spec.js'], { read: false })
    .pipe(mocha({ ui: 'bdd', timeout: 5000, reporter: 'mocha-junit-reporter' }))
    .once('end', () => {
      process.exit();
    });
});
gulp.task('test_continue', () => {
  gulp.src(['test/**/*spec.js'], { read: false })
    .pipe(mocha({ ui: 'bdd', timeout: 5000 }));
});
