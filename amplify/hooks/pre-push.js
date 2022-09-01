//@ts-check

const { join } = require('path');
const { writeFileSync, readdirSync, rmSync } = require('fs')
const API_NAME = "resolvermock"
const BASE_PATH = join(process.cwd(), `amplify/backend/api/${API_NAME}/resolvers`)

const EXISTING_FILES = readdirSync(BASE_PATH)

console.log(`\x1b[38;2;255;255;0;1mRunning pre-push.js in silent mode \x1b[m`)

console.log(`\x1b[38;2;255;255;0;1mRemoving existing resolvers. \x1b[m`)
for (const FILE of EXISTING_FILES) rmSync(join(BASE_PATH, FILE))

console.log(`\x1b[38;2;255;255;0;0m pre-push.js \x1b[m`)
writeFileSync(join(BASE_PATH, 'Mutation.deleteBlog.preUpdate.1.req.vtl'), `{
  "version" : "2017-02-28",
  "operation" : "Query",
  "query" : {
      "expression" : "blogID = :blogID",
      "expressionValues" : {
        ":blogID" : $util.dynamodb.toDynamoDBJson($context.arguments.input.id)
    }
  },
  "index": "byBlog"
}`)

writeFileSync(join(BASE_PATH, 'Mutation.deleteBlog.preUpdate.1.res.vtl'), `
  #if (!$util.isNull($ctx.error))
  $util.error($util.toJson($ctx.error))
#end

#if (!$context.result.items.isEmpty())
  $util.error($util.toJson($context.result))
  $util.error("cannot delete blog with posts" )
#end

$util.toJson(null)
`)

