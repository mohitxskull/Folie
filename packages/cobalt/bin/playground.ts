import { NextServerError } from '../src/helpers/next_server_error'

console.log('Welcome to playground!')

const serverError = new NextServerError({
  type: '404',
})

console.log(serverError.toJSON())
