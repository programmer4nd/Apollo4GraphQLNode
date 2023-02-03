const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware }  = require('@apollo/server/express4'); 
const path = require('path');
const cors =require('cors');
const { json } =require('body-parser');
const app = express();
const fs = require('fs');
const { finished } = require('stream/promises');
const http = require('http');
const {graphqlUploadExpress}=require('graphql-upload-minimal');
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
//upload file function to write file to disk
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
            __dirname, `./${_fileName}`
        );
        serverFile = serverFile.replace(' ', '_');
        let writeStream = await fs.createWriteStream(serverFile);
        await stream.pipe(writeStream);
        await finished(writeStream);
        return _fileName;
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
            return { Message: "some error occured" };
        }
    }
};

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
}); 
const server = new ApolloServer({
    typeDefs,
    resolvers,
    cors: {
        origin: '*',			// <- allow request from all domains
        credentials: true
    },
    csrfPrevention: false,
});
 
 server.start().then(res => {
app.use(
  '/graphql',
  cors({origin:"*"}),
  json(),
  expressMiddleware(server, {}),
);

const httpServer = http.createServer(app);
//server.installSubscriptionHandlers(httpServer);

//await new Promise((resolve) =>
httpServer.listen(4100, () => {
  console.log("🚀 Server is good to go @  4100/graphql");
}); 

}); 



 
