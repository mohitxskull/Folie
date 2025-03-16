import { CastleModule } from '@folie/castle'

export const castle = new CastleModule({
  config: {
    table: {
      user: 'users',
      session: 'sessions',
      note: 'notes',
      tag: 'tags',
      noteTags: 'note_tags',
    },
    pivot: {
      noteTags: {
        pivotTable: (t) => t.noteTags(),
      },
    },
  },
})
