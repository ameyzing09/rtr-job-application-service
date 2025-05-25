'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db, cb) {
  // db.addForeignKey('jobs', 'tenants', 'tenant_id', {
  //   // name: 'tenant_id',
  //   rules: {
  //     onDelete: 'CASCADE',
  //     onUpdate: 'CASCADE'
  //   }
  // }, function (err) {
  //   if (err) return cb(err);

  //   db.addForeignKey('applications', 'tenants', 'tenant_id', {
  //     // name: 'tenant_id',
  //     rules: {
  //       onDelete: 'CASCADE',
  //       onUpdate: 'CASCADE'
  //     }
  //   }, function (err) {
  //     if (err) return cb(err);

  //     db.addForeignKey('applications', 'jobs', 'job_id', {
  //       // name: 'job_id',
  //       rules: {
  //         onDelete: 'CASCADE',
  //         onUpdate: 'CASCADE'
  //       }
  //     }, cb);
  //   });
  // });
  db.runSql(`
    ALTER TABLE jobs
    ADD CONSTRAINT fk_jobs_tenant_id
    FOREIGN KEY (tenant_id)
    REFERENCES tenants(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;`
    , function (err) {
      if (err) return cb(err);
      db.runSql(`
    ALTER TABLE applications
    ADD CONSTRAINT fk_applications_tenant_id
    FOREIGN KEY (tenant_id)
    REFERENCES tenants(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;`,
        function (err) {
          if (err) return cb(err);

          db.runSql(`

    ALTER TABLE applications
    ADD CONSTRAINT fk_applications_job_id
    FOREIGN KEY (job_id)
    REFERENCES jobs(id)
    ON DELETE CASCADE
    ON UPDATE CASCADE;`, cb);
        });
    });
};

exports.down = function (db, cb) {
  db.runSql(`ALTER TABLE applications DROP FOREIGN KEY fk_applications_job_id;`, function (err) {
    if (err) return cb(err);
    db.runSql(`ALTER TABLE applications DROP FOREIGN KEY fk_applications_tenant_id;`, function (err) {
      if (err) return cb(err);
      db.runSql(`ALTER TABLE jobs DROP FOREIGN KEY fk_jobs_tenant_id;`, cb);
    });
  });
};

exports._meta = {
  "version": 1
};
