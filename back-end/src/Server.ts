import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import helmet from 'helmet';

import express, { Request, Response, NextFunction } from 'express';
import { BAD_REQUEST } from 'http-status-codes';
import 'express-async-errors';

import BaseRouter from './routes';
import logger from '@shared/Logger';
import { getUserRepository, getCourseRepository, getCourseworkRepository, getPostRepository, getDepartmentRepository } from './dateabase-ops';
import { userEmailPasswordCheck, User } from './entities/UserEntities'

import pug from 'pug';
import { Post } from './entities/PostEntities';

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

app.get('/login', async (req: Request, res: Response) => {
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
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var day = mm + '/' + dd + '/' + yyyy;
    console.log(day)
    const email = req.cookies.user_email
    const userRepo = getUserRepository()
    const user = await userRepo.findOneUser(email)
    const departmentRepo = getDepartmentRepository()
    const department = await departmentRepo.findOneDepartmentByUser(email)
    console.log(department)

    const pageRenderFunction = pug.compileFile(viewsDir + "/home.html");
    const page = pageRenderFunction({user: user, department: department, day: day})

    res.send(page)
})

app.get('/mycourse', async (req: Request, res: Response) => {
    const email = req.cookies.user_email
    const userRepo = getUserRepository()
    const user = await userRepo.findOneUser(email)
    const courseRepo = getCourseRepository()
    const xxx = await courseRepo.findAllCoursesByEmail(email)

    const pageRenderFunction = pug.compileFile(viewsDir + "/mycourse.html");
    const page = pageRenderFunction({user: user, courses: xxx})

    res.send(page)
})

app.get('/course', async (req: Request, res: Response) => {
    const email = req.cookies.user_email
    const classname = req.query.name.toString()
    const classsection = parseInt(req.query.section.toString())

    const courseRepo = getCourseRepository()
    const userRepo = getUserRepository()

    const course = await courseRepo.findOneCourseByNameAndSection(classname, classsection)

    if (!course) {
        res.send("Course not exist!")
    } else {
        const professor = await userRepo.getCourseProfessor(course)      
        console.log(professor)  
        const pageRenderFunction = pug.compileFile(viewsDir + "/course.html");
        const page = pageRenderFunction({course: course, email: email, user: professor})
    
        res.send(page)
    }


})

app.get('/dropcourse', async (req: Request, res: Response) => {
    const email = req.cookies.user_email
    const courseRepo = getCourseRepository()
    const userRepo = getUserRepository()
    const courseid = parseInt(req.query.courseid.toString())
    console.log(courseid)
    const course = await courseRepo.findOneCourse(courseid)
    await userRepo.createQueryBuilder().relation(User, "Courses").of(email).remove(course!.id!)

    res.redirect("/mycourse")
})

app.get('/coursework', async (req: Request, res: Response) => {
    const email = req.cookies.user_email
    const userRepo = getUserRepository()
    const user = await userRepo.findOneUser(email)
    const courseid = parseInt(req.query.courseid.toString())
    const courseworkRepo = getCourseworkRepository()
    const courseworks = await courseworkRepo.findCourseworksByEmailandCourse(email, courseid)

    // res.json(coursework)
    
    const pageRenderFunction = pug.compileFile(viewsDir + "/coursework.html");
    const page = pageRenderFunction({courseworks: courseworks, user: user})

    res.send(page)
})

app.get('/managecoursework', async (req: Request, res: Response) => {
    const email = req.cookies.user_email
    const userRepo = getUserRepository()
    const user = await userRepo.findOneUser(email)
    const courseid = parseInt(req.query.courseid.toString())
    const courseRepo = getCourseRepository()
    const course = await courseRepo.findOneCourse(courseid)
    const courseworkRepo = getCourseworkRepository()
    const allcourseworks = await courseworkRepo.findAllCourseworksBycourseid(courseid)
    console.log(allcourseworks)
    
    const pageRenderFunction = pug.compileFile(viewsDir + "/coursework.html");
    const page = pageRenderFunction({courseworks: allcourseworks, user: user, course: course})

    res.send(page)
})

app.post('/gradecoursework', async (req: Request, res: Response) => {
    const courseworkid = parseInt(req.query.courseworkid.toString())
    const courseid = parseInt(req.query.courseid.toString())
    const courseworkRepo = getCourseworkRepository()
    const coursework = await courseworkRepo.findCourseworkById(courseworkid)
    coursework!.grade = req.body.grade
    await courseworkRepo.save(coursework!)

    res.redirect("/managecoursework?courseid="+ courseid)

})

app.get('/post', async (req: Request, res: Response) => {
    const email = req.cookies.user_email
    const userRepo = getUserRepository()
    const user = await userRepo.findOneUser(email)
    const courseid = parseInt(req.query.courseid.toString())
    const courseRepo = getCourseRepository()
    const course = await courseRepo.findOneCourse(courseid)
    const postRepo = getPostRepository()
    const posts = await postRepo.findPostsByCourseId(courseid)
    const pageRenderFunction = pug.compileFile(viewsDir + "/post.html");
    const page = pageRenderFunction({user: user, posts: posts, courseid: courseid, course})

    res.send(page)
})

app.get('/comment', async (req: Request, res: Response) => {
    const email = req.cookies.user_email
    const userRepo = getUserRepository()
    const user = await userRepo.findOneUser(email)
    const postid = parseInt(req.query.postid.toString())
    const courseid = parseInt(req.query.courseid.toString())
    const postRepo = getPostRepository()
    const post = await postRepo.findOnePostByIdWithComments(postid)

    const pageRenderFunction = pug.compileFile(viewsDir + "/comment.html");
    const page = pageRenderFunction({user: user, post: post, courseid: courseid})

    res.send(page)
})

app.post('/delete_comment', async (req: Request, res: Response) => {
    // const email = req.cookies.user_email
    // const userRepo = getUserRepository()
    // const user = await userRepo.findOneUser(email)

    const postid = parseInt(req.body.postid.toString());
    const commentid = parseInt(req.body.commentid.toString())
    const courseid = parseInt(req.body.courseid.toString())
    const postRepo = getPostRepository()
    await postRepo.removePostById(commentid)   

    res.redirect("/comment?postid="+postid+"&courseid="+commentid)

})

app.post('/create_comment', async (req: Request, res: Response) => {
    const email = req.cookies.user_email
    let content = req.body.content
    const courseid = parseInt(req.query.courseid.toString())
    const postid = parseInt(req.body.postid.toString())

    const userRepo = getUserRepository()
    const postRepo = getPostRepository()

    const user = await userRepo.findOneUser(email)
    const post = await postRepo.findOnePostByID(postid)

    let comment = new Post()
    comment.content = content
    comment.user = user

    await postRepo.createComment(post!, comment)

    res.redirect("/comment?postid=" + postid + "&courseid=" + courseid)
})



app.post('/changepassword', async (req: Request, res: Response) => {
    const email = req.cookies.user_email
    const userRepo = getUserRepository()
    const user = await userRepo.findOneUser(email)
    user!.password = req.body.password
    await userRepo.save(user!)
    res.clearCookie("user_email")
    const pageRenderFunction = pug.compileFile(viewsDir + "/changepassword.html");
    const page = pageRenderFunction({})
    res.send(page)
    // res.redirect("/home")

    
})


app.post('/delete_post', async (req: Request, res: Response) => {
    const email = req.cookies.user_email
    const userRepo = getUserRepository()
    const user = await userRepo.findOneUser(email)
    const post_id = parseInt(req.body.postid.toString());
    const courseid = parseInt(req.body.courseid.toString())
    const postRepo = getPostRepository()
    console.log(user)
    await postRepo.removePostById(post_id)   

    res.redirect("/post?courseid=" + courseid)
})

app.post('/create_post', async (req: Request, res: Response) => {
    const email = req.cookies.user_email
    const userRepo = getUserRepository()
    const user = await userRepo.findOneUser(email)
    const courseRepo = getCourseRepository()
    const courseid = parseInt(req.query.courseid.toString())
    console.log(courseid)
    const course = await courseRepo.findOneCourse(courseid)
    const postRepo = getPostRepository()
    let content = req.body.content
    const create_post = await postRepo.createPost(content , user!, course!)

    res.redirect("/post?courseid=" + courseid)

})




app.get('/logout', (req: Request, res: Response) => {
    res.clearCookie("user_email")
    res.redirect("/login")
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
        res.cookie("user_email", email)
        res.redirect("/home")
    } else {
        res.send("Email or Password incorrect!")
    }
});


// Export express instance
export default app;
