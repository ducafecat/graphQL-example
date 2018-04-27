import express from 'express'
import bodyParser from 'body-parser'
import {graphqlExpress, graphiqlExpress} from 'apollo-server-express'
import {makeExecutableSchema, addMockFunctionsToSchema, MockList} from 'graphql-tools'
import {graphql, GraphQLScalarType} from 'graphql'
import Mock from 'mockjs'
const Random = Mock.Random
// https://github.com/nuysoft/Mock/wiki/Mock.Random

const typeDefs = `
  scalar Date

  type User {
    id: Int
    name: String
    posts(limit: Int): [Post]
  }

  type Post {
    id: Int
    title: String
    views: Int
    author: User
  }

  interface Message {
    content: String
  }
  type Notice implements Message {
    content: String
    noticeTime: Date
  }
  type Remind implements Message {
    content: String
    endTime: Date
  }

  type Query {
    aString: String
    aBoolean: Boolean
    anInt: Int
    my: [User]
    author(id: Int): User
    topPosts(limit: Int): [Post]
    notices: [Notice]
  }

  # this schema allows the following mutation:
  type Mutation {
    addUser: User
  }
`

const typeResolvers = {
  Message: {
    __resolveType(data) {
      return data.typename // typename property must be set by your mock functions
    }
  },
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
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

const schema = makeExecutableSchema({
  typeDefs, 
  typeResolvers, 
  resolverValidationOptions: { 
    requireResolversForResolveType: false
  }})

const min = 100
const max = 99999
const mocks = {
  Int: () => Random.natural(min, max),
  Float: () => Random.float(min, max),
  String: () => Random.ctitle(10, 5),
  Date: () => Random.time(),
  User: () => (
    {
      id: Random.natural(min, max),
      name: Random.cname(),
      posts: () => new MockList([6, 12]),
    }
  ),
}

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
