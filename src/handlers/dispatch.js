import { EventEmitter } from 'node:events'

export const dispatch = new EventEmitter()
export const Events = {
  Interaction: {
    Started: 'interaction:started',
    Completed: 'interaction:completed',
    Failed: 'interaction:failed'
  },
  Event: {
    Started: 'event:started',
    Completed: 'event:completed',
    Failed: 'event:failed'
  },
  Sync: {
    Started: 'sync:started',
    Completed: 'sync:completed',
    Failed: 'sync:failed'
  }
}
