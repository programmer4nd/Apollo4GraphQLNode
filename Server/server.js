//const {  gql } = require('graphql-tag');
//const { PubSub  } = require('graphql-subscriptions');
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware }  = require('@apollo/server/express4');
//const schema = require('./Graphql/schema');
//const auth = require('./Middleware/auth.js');
const path = require('path');
const cors =require('cors');
const { json } =require('body-parser');
const app = express();

const fs = require('fs');
const { finished } = require('stream/promises');
const http = require('http');
const {graphqlUploadExpress,GraphQlUpload}=require('graphql-upload-minimal');
//const { PubSub } = require('graphql-subscriptions');
//const pubsub = new PubSub();
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  app.use(graphqlUploadExpress());
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
  type Result{
    Message:String
  }
  type Mutation {
    UploadFile(_File:Upload): Result
  }
`;

const uploadFile = async function (file) {
    try {
        console.log("abc",file);
        const {
            createReadStream,
            filename,
            mimetype
        } = await file;

        let stream = await createReadStream();
        let { ext, name } = path.parse(filename);
        let _fileName = `${Date.now()}${ext}`;
        let serverFile = path.join(
            __dirname, `./${_fileName}`
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
            console.log( _File );
            if (_File) {
                try {
                    let _fileName = await uploadFile(_File.file);
                    return { Message: _fileName };
                } catch (ex) { console.log(ex); throw ex }

            }

            return { Message: "hhf" };
        }
    }
};

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'uploads')));


//new ApolloServer({ schema, context, uploads: false })


//app.use(graphqlUploadExpress({ maxFileSize: 10000, maxFiles: 10 }));
const server = new ApolloServer({
    typeDefs,
    resolvers,
    cors: {
        origin: '*',			// <- allow request from all domains
        credentials: true
    },
    csrfPrevention: false,
  //schema,
  //   playground: {
  //     subscriptionEndpoint: 'wss://localhost:30300/api'
  // },
//   introspection:true,
//   subscriptions: {
//     path: '/graphql',
//     keepAlive: 9000,
//     onConnect: (connParams, webSocket, context) => {
//       console.log('CLIENT CONNECTED');
//       console.log({ connParams });
//     },
//     onDisconnect: (webSocket, context) => {
//       console.log('CLIENT DISCONNECTED')
//     }
//   },
//   context: auth
});
//await 
 server.start().then(res => {
app.use(
  '/graphql',
  cors({origin:"*"}),
  json(),
  expressMiddleware(server, {
    //context: auth,//async ({ req }) => ({ token: req.headers.token }),
  }),
);

const httpServer = http.createServer(app);
//server.installSubscriptionHandlers(httpServer);

//await new Promise((resolve) =>
httpServer.listen(4100, () => {
  console.log("🚀 Server is good to go @  5000/graphql");
});//.setTimeout(1000 * 60 * 200);

});
//for subscriptions 



 
