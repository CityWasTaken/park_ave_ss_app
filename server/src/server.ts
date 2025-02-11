import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import cookieParser from 'cookie-parser';
import path from 'path';


import connection from './config/connection.js';
import { authenticate } from './services/auth.js';

import typeDefs from './schema/typeDefs.js';
import resolvers from './schema/resolvers.js';

const app = express();
const PORT = Number(process.env.PORT) || 3333;


const server = new ApolloServer({
    typeDefs,
    resolvers,
});

connection.once('open', async () => {
    // Note you must call `start()` on the `ApolloServer`
    // instance before passing the instance to `expressMiddleware`
    await server.start();

    // Middleware
    app.use(
        '/graphql',
        express.json(),
        // Allow the resolver to access client-side cookies through context.req.cookies
        cookieParser(),
        expressMiddleware(server, {
            // Attach the context object for all resolvers by referencing a function that returns an object with req and res, and if they have a valid cookie/jwt, req.user will be their user object
            context: authenticate
        }),
    );

    if(process.env.PORT) {
        const __dirname = path.dirname(new URL(import.meta.url).pathname)
        // Share all files in the client/dist folder with the client-side
        app.use(express.static(path.join(__dirname, '../../client/dist')))

        // Create a wildcard route that sends the client/dist/index.html file back to the client-side
        app.get('*', (_, res) => {
            res.sendFile(path.join(__dirname, '../../client/dist/index.html'))
        });
    }

    app.listen(PORT, () => {
        console.log('Express server has started on', PORT);
    });
});
