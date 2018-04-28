import {merge} from 'lodash'
import scalars from './scalars'
import types from './types'
import interfaces from './interfaces'
import unions from './unions'

export default merge(scalars, types, interfaces, unions)
