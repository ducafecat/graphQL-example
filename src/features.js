const express = require('express')
const bodyParser = require('body-parser')
const {graphqlExpress, graphiqlExpress} = require('apollo-server-express')
const {makeExecutableSchema} = require('graphql-tools')
const {find, filter} = require('lodash')
const {GraphQLScalarType} = require('graphql')
const {Kind} = require('graphql/language')

// 测试数据
const authors = [
  {id: 1, firstName: 'Tom', lastName: 'Coleman', state: 'CN'},
  {id: 2, firstName: 'Sashko', lastName: 'Stubailo', state: 'CN'},
  {id: 3, firstName: 'Mikhail', lastName: 'Novikov', state: 'ENG'}
]

const posts = [
  {id: 1, authorId: 1, title: 'Introduction to GraphQL', votes: 2},
  {id: 2, authorId: 2, title: 'Welcome to Meteor', votes: 3},
  {id: 3, authorId: 2, title: 'Advanced GraphQL', votes: 1},
  {id: 4, authorId: 3, title: 'Launchpad is Cool', votes: 7}
]

const notices = [{id: 1, content: '这是 notice', noticeTime: 1524710641}]

const reminds = [{id: 1, content: '这是 remind', endTime: 1524710641}]

// GraphQL schema
const typeDefs = `
  scalar Date

  enum Country {
    CN
    ENG
    JP
    UK
    CA
  }

  """
  消息接口
  """
  interface Message {
    content: String
  }

  """
  通知对象
  """
  type Notice implements Message {
    """
    通知内容
    """
    content: String
    """
    通知时间
    """
    noticeTime: Date
  }

  """
  提醒对象
  """
  type Remind implements Message {
    content: String
    endTime: Date
  }

  """
  联合类型 通知 & 提醒
  """
  union MessageResult = Notice | Remind

  type Author {
    """
    流水编号
    """
    id: Int!
    firstName: String
    lastName: String
    state(state: Country = CN): String
    """
    the list of Posts by this author
    """
    posts: [Post]
  }

  type Post {
    id: Int!
    title: String
    author: Author
    votes: Int
  }

  # 输入类型
  input AuthorInput {
    firstName: String
    lastName: String
    state: String
  }

  # the schema allows the following query:
  type Query {
    """
    所有文章
    """
    posts: [Post]
    """
    所有作者
    """
    authors: [Author]
    author(
      """
      作者ID
      """
      id: Int!
    ): Author
    searchInterface (text: String!): Message!
    searchUnion (text: String!): MessageResult!
  }

  # this schema allows the following mutation:
  type Mutation {
    addAuthor (
      author: AuthorInput!
    ): Author
    upVotePost (
      postId: Int!
    ): Post
    clearVotePost (
      postId: Int!
    ): Post
  }
`

// resolvers
const resolvers = {
  Query: {
    posts: () => posts,
    authors: () => authors,
    author: (_, {id}) => find(authors, {id}),
    searchInterface: (_, {text}) => {
      if (text === 'notice') {
        return notices[0]
      } else {
        return reminds[0]
      }
    },
    searchUnion: (_, {text}) => {
      if (text === 'notice') {
        return notices[0]
      } else {
        return reminds[0]
      }
    }
  },

  Mutation: {
    addAuthor: (_, {author}) => {
      author.id = authors.length + 1
      authors.push(author)
      return author
    },
    upVotePost: (_, {postId}) => {
      const post = find(posts, {id: postId})
      if (!post) {
        throw new Error(`Couldn't find post with id ${postId}`)
      }
      post.votes += 1
      return post
    },
    clearVotePost: (_, {postId}) => {
      const post = find(posts, {id: postId})
      if (!post) {
        throw new Error(`Couldn't find post with id ${postId}`)
      }
      post.votes = 0
      return post
    }
  },

  Author: {
    posts: author => filter(posts, {authorId: author.id})
  },

  Post: {
    author: post => find(authors, {id: post.authorId})
  },

  Message: {
    __resolveType(obj, context, info){
      console.log(obj, context, info)
      if(obj.noticeTime){
        return 'Notice'
      }
      if(obj.endTime){
        return 'Remind'
      }
      return null
    }
  },

  MessageResult: {
    __resolveType(obj, context, info){
      console.log(obj, context, info)
      if(obj.noticeTime){
        return 'Notice'
      }
      if(obj.endTime){
        return 'Remind'
      }
      return null
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

// Put together a schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
  // resolverValidationOptions: {
  //   requireResolversForResolveType: false
  // }
})

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
