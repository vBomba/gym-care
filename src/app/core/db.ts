import Dexie, { type EntityTable } from 'dexie';
import type { DeletionRecord, Program, Session } from './models';

export class GymDatabase extends Dexie {
  program!: EntityTable<Program, 'id'>;
  sessions!: EntityTable<Session, 'id'>;
  deletions!: EntityTable<DeletionRecord, 'id'>;

  constructor() {
    super('gym-care');
    this.version(1).stores({
      program: 'id',
      sessions: 'id, status, performedAt, programDayId',
    });
    this.version(2).stores({
      program: 'id',
      sessions: 'id, status, performedAt, programDayId',
      deletions: 'id, kind, deletedAt',
    });
  }
}

export const db = new GymDatabase();
