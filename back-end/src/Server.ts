import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';

import express, { Request, Response, NextFunction } from 'express';
import { BAD_REQUEST } from 'http-status-codes';
import 'express-async-errors';

import BaseRouter from './routes';
import logger from '@shared/Logger';
import { getUserRepository } from './dateabase-ops';
import { userEmailPasswordCheck } from './entities/UserEntities'

import pug from 'pug';

// Init express
const app = express();



/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// Show routes called in console during development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Security
if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
}

// Add APIs
app.use('/api', BaseRouter);

// Print API errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err.message, err);
    return res.status(BAD_REQUEST).json({
        error: err.message,
    });
});



/************************************************************************************
 *                              Serve front-end content
 ***********************************************************************************/

const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));
app.get('/index.html', (req: Request, res: Response) => {
    res.sendFile('index.html', {root: viewsDir});
});

app.get('/login.html', async (req: Request, res: Response) => {
    if ('user_email' in req.cookies) {
        const email = req.cookies.user_email
        const userRepo = getUserRepository()
        const user = await userRepo.findOneUser(email)
        res.send(`Hi ${user!.name}, you have already logged in:)`)
    } else {
        res.sendFile('login.html', {root: viewsDir});
    }
});

app.get('/logout', (req: Request, res: Response) => {
    res.clearCookie("user_email")
    res.send("")
});

app.get('/cookietest', (req: Request, res: Response) => {
    console.log(req.cookies)
    res.send("")
});

app.get('/class', (req: Request, res: Response) => {
    console.log(req.query)
    const id = req.query.id
    const section = req.query.section
    res.send("")
});



app.post("/login", async (req: Request, res: Response) => {
    console.log(req.body)
    let email = req.body.email
    let password = req.body.password

    const valid = await userEmailPasswordCheck(email, password)

    if (valid) {
        const userRepo = getUserRepository()
        const user = await userRepo.findOneUser(email)
        // const pageRenderFunction = pug.compileFile(viewsDir + "/home.html");
        // const page = pageRenderFunction({user: user})
        res.cookie("user_email", email)

        res.json(user)
    } else {
        res.send("Email or Password incorrect!")
    }
});


// Export express instance
export default app;
