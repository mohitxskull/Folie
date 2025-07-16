import { Exception } from '@adonisjs/core/exceptions'
import { CastleException } from '../src/exceptions/castle_exception.js'
import { InternalServerErrorException } from '../src/exceptions/http_exceptions.js'
import { isException, isCastleException } from '../src/exceptions/utils.js'

console.log('Welcome to playground!')

const exception = new Exception('goat')
const error = new Error('sheep')
const castleException = new CastleException('castle')
const castleExceptionChild = new InternalServerErrorException('child')

console.log('is Parent Castle Exception', {
  exception: isCastleException(exception),
  error: isCastleException(error),
  castleException: isCastleException(castleException),
  castleExceptionChild: isCastleException(castleExceptionChild),
})

console.log('is Exception', {
  exception: isException(exception),
  error: isException(error),
  castleException: isException(castleException),
  castleExceptionChild: isException(castleExceptionChild),
})

console.log('Instance of Exception', {
  exception: exception instanceof Exception,
  error: error instanceof Exception,
  castleException: castleException instanceof Exception,
  castleExceptionChild: castleExceptionChild instanceof Exception,
})

console.log('Instance of CastleException', {
  exception: exception instanceof CastleException,
  error: error instanceof CastleException,
  castleException: castleException instanceof CastleException,
  castleExceptionChild: castleExceptionChild instanceof CastleException,
})
