import {GraphQLScalarType} from 'graphql'

export default {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: '自定义日期类型',
    parseValue(value) {
      return new Date(value) // value from the client
    },
    serialize(value) {
      // return new Date(value).getTime()
      return new Date(value) // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10) // ast value is always in string format
      }
      return null
    }
  })
}
