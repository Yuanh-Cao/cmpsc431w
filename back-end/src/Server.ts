import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';

import express, { Request, Response, NextFunction } from 'express';
import { BAD_REQUEST } from 'http-status-codes';
import 'express-async-errors';

import BaseRouter from './routes';
import logger from '@shared/Logger';
import { getUserRepository, getCourseRepository, getCourseworkRepository, getPostRepository } from './dateabase-ops';
import { userEmailPasswordCheck } from './entities/UserEntities'

import pug from 'pug';
import { CourseworkRepository } from '@entities/CourseEntities';

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

app.get('/home', async (req: Request, res: Response) => {
    const email = req.cookies.user_email
    const userRepo = getUserRepository()
    const user = await userRepo.findOneUser(email)

    const pageRenderFunction = pug.compileFile(viewsDir + "/home.html");
    const page = pageRenderFunction({user: user})

    res.send(page)
})

app.get('/mycourse', async (req: Request, res: Response) => {
    const email = req.cookies.user_email
    const courseRepo = getCourseRepository()
    const xxx = await courseRepo.findAllCoursesByEmail(email)

    const pageRenderFunction = pug.compileFile(viewsDir + "/mycourse.html");
    const page = pageRenderFunction({courses: xxx})

    res.send(page)
})

app.get('/course', async (req: Request, res: Response) => {
    const email = req.cookies.user_email
    const classname = req.query.name.toString()
    const classsection = parseInt(req.query.section.toString())

    const courseRepo = getCourseRepository()
    const course = await courseRepo.findOneCourseByNameAndSection(classname, classsection)

    // res.json(course)
    
    const pageRenderFunction = pug.compileFile(viewsDir + "/course.html");
    const page = pageRenderFunction({course: course, email: email})

    res.send(page)
})

app.get('/coursework', async (req: Request, res: Response) => {
    const email = req.cookies.user_email
    const courseid = parseInt(req.query.courseid.toString())
    const courseworkRepo = getCourseworkRepository()
    const courseworks = await courseworkRepo.findCourseworksByEmailandCourse(email, courseid)

    // res.json(coursework)
    const pageRenderFunction = pug.compileFile(viewsDir + "/coursework.html");
    const page = pageRenderFunction({courseworks: courseworks})

    res.send(page)
})

app.get('/post', async (req: Request, res: Response) => {
    const courseid = parseInt(req.query.courseid.toString())
    const postRepo = getPostRepository()
    const posts = await postRepo.findPostsByCourseId(courseid)
    console.log(courseid)
    console.log(posts)
    const pageRenderFunction = pug.compileFile(viewsDir + "/post.html");
    const page = pageRenderFunction({posts: posts})

    res.send(page)
})

app.get('/comment', async (req: Request, res: Response) => {
    const postid = parseInt(req.query.postid.toString())
    const postRepo = getPostRepository()
    const comments = await postRepo.findOnePostByIdWithComments(postid)
    console.log(postid)
    console.log(comments)
    const pageRenderFunction = pug.compileFile(viewsDir + "/comment.html");
    const page = pageRenderFunction({comments: comments})

    res.send(page)
})



app.get('/logout', (req: Request, res: Response) => {
    res.clearCookie("user_email")
    res.send("")
});

app.get('/cookietest', (req: Request, res: Response) => {
    console.log(req.cookies)
    res.send("")
});

app.get('/class', async (req: Request, res: Response) => {
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
        const pageRenderFunction = pug.compileFile(viewsDir + "/home.html");
        const page = pageRenderFunction({user: user})
        res.cookie("user_email", email)

        res.json(user)
    } else {
        res.send("Email or Password incorrect!")
    }
});


// Export express instance
export default app;
