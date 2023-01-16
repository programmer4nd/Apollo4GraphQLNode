// import { ApolloServer } from '@apollo/server';
// import { startStandaloneServer } from '@apollo/server/standalone';
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const app = express();
const http = require('http');
const path = require('path');
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//app.use(express.static(path.join(__dirname, '/')));
const books = [
    {
        title: 'The Awakening',
        author: 'Kate Chopin',
    },
    {
        title: 'City of Glass',
        author: 'Paul Auster',
    },
]
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }
  scalar Upload
  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    books: [Book]
  }
  type Mutation {
    UploadFile(_File:Upload): String
  }
`;

const uploadFile = async function (file) {
    try {

        const {
            createReadStream,
            filename,
            mimetype
        } = await file;

        let stream = await createReadStream();
        let { ext, name } = path.parse(filename);
        let _fileName = `${Date.now()}${ext}`;
        let serverFile = path.join(
            __dirname, `../${_fileName}`
        );
        serverFile = serverFile.replace(' ', '_');
        let writeStream = await fs.createWriteStream(serverFile);
        await stream.pipe(writeStream);
        await finished(writeStream);
        return _fileName;//{ "File_Name":_fileName, "File_Path":serverFile, "Gallery_ID":Gallery_ID };
    } catch (err) {
        console.log(err);
        throw err;
    }

};
// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
    Query: {
        books: () => books,
    },
    Mutation: {
        UploadFile: async (root, { _File }, req) => {
            console.log({ _File });
            if (_File) {
                try {
                    let _fileName = await uploadFile(_File);
                    return _fileName;
                } catch (ex) { console.log("ex"); }

            }

            return "ABC";
        }
    }
};


// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
    typeDefs,
    resolvers,
});
// server.applyMiddleware({
//     app,
//     path: '/graphql'
// });
app.use(
    '/graphql',
    // cors({ origin: ['https://www.your-app.example', 'https://studio.apollographql.com'] }),
    //json(),
    expressMiddleware(server),
);

const httpServer = http.createServer(app);
//server.installSubscriptionHandlers(httpServer);

// httpServer.listen(4100, () => {
//   console.log("🚀 Server is good to go @  4100/graphql");
// }).setTimeout(1000 * 60 * 200);
// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
//app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const { url } = startStandaloneServer(server, {
    listen: { port: 4100 },
});

console.log(`🚀  Server ready at: ${url}`);