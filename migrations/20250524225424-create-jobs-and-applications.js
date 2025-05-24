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
  db.createTable('jobs', {
    id: { type: 'char', length: 36, primaryKey: true },
    tenant_id: { type: 'char', length: 36, notNull: true },
    title: { type: 'string', length: 255, notNull: true },
    description: { type: 'text' },
    location: { type: 'string', length: 100 },
    department: { type: 'string', length: 100 },
    created_at: { type: 'datetime', notNull: true, defaultValue: 'CURRENT_TIMESTAMP' },
    updated_at: { type: 'datetime', notNull: true, defaultValue: 'CURRENT_TIMESTAMP' }
  }, function (err) {
    if (err) return cb(err);
    
    db.createTable('applications', {
      id: { type: 'char', length: 36, primaryKey: true },
      tenant_id: { type: 'char', length: 36, notNull: true },
      job_id: { type: 'char', length: 36, notNull: true },
      candidate_name: { type: 'string', length: 100, notNull: true },
      email: { type: 'string', length: 100, notNull: true },
      phone: { type: 'string', length: 20, notNull: true },
      resume_url: { type: 'string', length: 255 },
      cover_letter: { type: 'text' },
      status: {
        type: 'string',
        length: 20,
        notNull: true,
        defaultValue: 'PENDING'
      },
      created_at: { type: 'datetime', notNull: true, defaultValue: 'CURRENT_TIMESTAMP' },
      updated_at: { type: 'datetime', notNull: true, defaultValue: 'CURRENT_TIMESTAMP' }
    }, cb);
  });
};

exports.down = function (db, cb) {
  db.dropTable('applications', () => {
    db.dropTable('jobs', cb);
  });
};

exports._meta = {
  "version": 1
};
