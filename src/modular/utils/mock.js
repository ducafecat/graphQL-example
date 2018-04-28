import {MockList} from 'graphql-tools'
import Mock from 'mockjs'
const Random = Mock.Random

const min = 100
const max = 99999
const mocks = {
  Int: () => Random.natural(min, max),
  Float: () => Random.float(min, max),
  String: () => Random.ctitle(10, 5),
  Date: () => Random.time(),
  Post: () => ({
    author: Random.cname(),
    comments: () => new MockList([6, 12])
  })
}

export default mocks
