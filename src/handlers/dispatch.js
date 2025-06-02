import { EventEmitter } from 'node:events'

export const dispatch = new EventEmitter()
export const Events = {
  INTERACTION_STARTED: 'interactionStarted',
  INTERACTION_COMPLETED: 'interactionCompleted',
  INTERACTION_FAILED: 'interactionFailed'
}
