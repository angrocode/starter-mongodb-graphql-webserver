import { GraphQLScalarType } from 'graphql'


let schema = `
    scalar Date

    type Query {
        time: Date
        hello: String
    }
    type Mutation {
        time: Date
    }
`

let resolvers = {
    Date: new GraphQLScalarType({
        name: 'Date',
        serialize: v => new Date(v),
        parseValue: v => new Date(v),
        parseLiteral: ast => new Date(parseInt(ast.value, 10))
    }),
    time: () => new Date(),
    hello: (args, context, info) => {
      return 'Hello world!'
  },
}

export { schema, resolvers }
