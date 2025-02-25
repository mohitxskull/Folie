import { XEnum } from '@folie/lib'

/**
 * DON'T EVER CHANGE THIS NUMBERS ELSE YOU WILL BREAK THE DATABASE
 */

export const PostStatus = new XEnum({
  DRAFT: 0, // Incomplete
  PENDING: 1, // Waiting to get generated
  GENERATING: 2, // Generating
  SENDING: 3, // Generated now waiting to get sent to the respecting telegram group
  SENT: 4, // Sent, waiting to get published or rejected
  PUBLISHED: 5,
  REJECTED: 6,
})

export type PostStatusKeys = (typeof PostStatus)['keys'][number]
