import express from 'express'
import bodyParser from 'body-parser'
import {merge} from 'lodash'
import requireGraphQLFile from 'require-graphql-file'
import {graphqlExpress, graphiqlExpress} from 'apollo-server-express'
import {makeExecutableSchema, addMockFunctionsToSchema} from 'graphql-tools'
import {graphql, GraphQLScalarType} from 'graphql'
import resolvers from './resolvers'
import typeResolvers from './typeResolvers'
import mocks from './utils/mock'

// 读取 schema
const typeDefs = [
  requireGraphQLFile('./schema/std/scalar'),
  // requireGraphQLFile('./schema/std/enum'),
  // requireGraphQLFile('./schema/std/interface'),
  // requireGraphQLFile('./schema/std/union'),
  requireGraphQLFile('./schema/business/post'),
  requireGraphQLFile('./schema/business/comment'),
  requireGraphQLFile('./schema/std/Query'),
  requireGraphQLFile('./schema/std/Mutation')
]

// 合并 schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
  typeResolvers,
  resolverValidationOptions: {
    requireResolversForResolveType: false
  }
})

// 添加mock数据
addMockFunctionsToSchema({schema, mocks, preserveResolvers: true})

// Initialize the app
const app = express()

// The GraphQL endpoint
app.use('/graphql', bodyParser.json(), graphqlExpress({schema}))

// GraphiQL, a visual editor for queries
app.use('/graphiql', graphiqlExpress({endpointURL: '/graphql'}))

// Start the server
app.listen(3000, () => {
  console.log('Go to http://localhost:3000/graphiql to run queries!')
})

/*
# 测试查询
{
  posts {
    id
    title
    content
    author
    addtime
    comments {
      id
      message
      author
      addtime
    }
  }
}
*/
