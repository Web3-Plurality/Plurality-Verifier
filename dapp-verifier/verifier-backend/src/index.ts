import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from "cors";
import helmet from "helmet";
import * as dotenv from 'dotenv';
import * as mongoose from "mongoose";
import { groupRouter } from './controllers/GroupController';
import { identityRouter } from './controllers/IdentityController';
import { twitterRouter } from './controllers/OAuthTwitterController';
import session from 'express-session';
import passport from "passport";



import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "./swagger.json";


dotenv.config();

const app: Application = express();
const PORT = process.env.PORT;
/*const corsOptions: cors.CorsOptions = {
  allowedHeaders: [
  'Origin',
  'X-Requested-With',
  'Content-Type',
  'Accept',
  'X-Access-Token',
  'X-Auth-Token',
  'Authorization'
  ],
  credentials: true,
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  origin: '*',
  preflightContinue: true,
  };*/
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());
//app.use(cors(corsOptions));
//app.options('*', cors(corsOptions));
app.use(express.json());
app.use(passport.initialize());
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: true }));
app.use("/group", groupRouter);
app.use("/identity", identityRouter);
app.use("/oauth-twitter", twitterRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const url: string = process.env.MONGO_CONNECTION_URL!;

// mongodb connection
mongoose.connect(url, {
  dbName: 'verifier',
}).then(() => console.log('Connected Successfully'))
.catch((err) => { console.error(err); });


app.get('/', async (req: Request, res: Response): Promise<Response> => {
  return res.status(200).send({
    message: 'Hello World!',
  });
});

app.post('/post', async (req: Request, res: Response): Promise<Response> => {
  console.log(req.body);
  return res.status(200).send({
    message: 'Hello World from post!',
  });
});

try {
  app.listen(PORT, (): void => {
    console.log(`Connected successfully on port ${PORT}`);
  });
} catch (error: any) {
  console.error(`Error occurred: ${error.message}`);
}
