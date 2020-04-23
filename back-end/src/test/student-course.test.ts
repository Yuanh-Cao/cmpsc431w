import "mocha"
import {assert, expect} from "chai"
import { connect, getUserRepository, getCourseRepository, getLetterGradeRepository, getPostRepository, getCourseworkRepository } from '../dateabase-ops';
import { UserRole, UserRepository, User } from '../entities/UserEntities';
import { CourseRepository, Course, CourseworkType, CourseworkRepository, Coursework } from '../entities/CourseEntities';
import { LetterGradeRepository, LetterGrade} from '../entities/LetterGradeEntites';
import { PostRepository, Post } from '../entities/PostEntities';

describe("Other tests", function() {
    before(async function() {
        try {
            await connect("testdb.sqlite");
        } catch (e) {
            console.error(`Initialize Registrar failed with `, e);
            throw e;
        }
    });


    describe("Student can enroll course", function() {
        var userRepo: UserRepository, user_1: User, courseRepo: CourseRepository;
        const course_1_name = "CMPSC464"
        const section = 2
        const user_1_email = "123@psu.edu"
        before(async function() {
            userRepo = getUserRepository()

            courseRepo = getCourseRepository()
            await courseRepo.createCourse(course_1_name, section)

            user_1 = userRepo.create({
                name: "zhangsan",
                role: UserRole.Student,
                email: user_1_email,
                password: "123456",
                gender: "M",
                age: 18
            })
            await userRepo.insert(user_1)            
        })

        // it("Course_1 shoud be created correctly", async function() {
        //     const get_course_1 = await courseRepo.findOneCourseByName(course_1_name)
        //     const get_course_that_not_exist = await courseRepo.findOneCourseByName("adkjhfaksdfkads")

        //     expect(get_course_1).is.not.undefined;
        //     expect(get_course_that_not_exist).is.undefined;
        // })

        // it("Student should enroll course", async function() {
        //     const get_user_1 = await userRepo.findOneUser(user_1_email)
        //     const get_course_1 = await courseRepo.findOneCourseByName(course_1_name)

        //     try {
        //         await userRepo.enrollCourse(get_user_1!, get_course_1!)
        //     } catch (err) {
        //         console.error(err)
        //     }

        //     const get_user = await userRepo.findOne(user_1_email, {relations: ["Courses"]})

        //     expect(get_user?.Courses).to.have.lengthOf(1)
            
        // })

        it("can check course by name and section", async function(){
            const get_course_1 = await courseRepo.courseExist(course_1_name, section)
            expect(get_course_1).to.be.true
        })

        after(async function() {
            const get_course_1 = await courseRepo.findOneCourseByName(course_1_name)
            await userRepo.removeUser(user_1)
            await courseRepo.removeCourse(get_course_1!)
        })
    })

    describe("Student can check grade", function() {
        var userRepo: UserRepository, lettergradeRepo: LetterGradeRepository, user_1: User, courseRepo: CourseRepository;
        var course_1: Course;
        const section = 2
        const course_1_name = "CMPSC464-2"
        const user_1_email = "123@psu.edu"
        var letter_grade_1: LetterGrade;
        before(async function() {
            userRepo = getUserRepository()
            lettergradeRepo = getLetterGradeRepository()
            courseRepo = getCourseRepository()
            course_1 = await courseRepo.createCourse(course_1_name, section)

            user_1 = userRepo.create({
                name: "zhangsan",
                role: UserRole.Student,
                email: user_1_email,
                password: "123456",
                gender: "M",
                age: 18
            })

            await userRepo.insert(user_1)            
        })

        it("could assign students' grade", async function () {
            const gradeString = "A"
            letter_grade_1 = await lettergradeRepo.createLetterGrade(gradeString, user_1, course_1)

            expect(letter_grade_1.gradeid).to.exist
            expect(letter_grade_1.lettergrade === gradeString)
        })

        it("could find students' grade by course", async function () {

            var letterGrade = await userRepo.findLetterGradeByCourse(course_1, user_1)

            expect(letterGrade!.gradeid === letter_grade_1.gradeid)
        })

        // after(async function() {
        //     const get_course_1 = await courseRepo.findOneCourseByName(course_1_name)
        //     await userRepo.removeUser(user_1)
        //     await courseRepo.removeCourse(get_course_1!)
        // })

    })

    describe("Can check posts", function() {
        var userRepo: UserRepository, postRepo: PostRepository, user_2: User, courseRepo: CourseRepository;
        var course_1: Course;
        var comment_1: Post;
        const section = 2
        const course_1_name = "CMPSC464-2"
        const user_1_email = "456@psu.edu"
        
        var post_1: Post;
        before(async function() {
            userRepo = getUserRepository()
            postRepo = getPostRepository()
            courseRepo = getCourseRepository()
            course_1 = await courseRepo.createCourse(course_1_name, section)

            user_2 = userRepo.create({
                name: "zhangsan",
                role: UserRole.Student,
                email: user_1_email,
                password: "123456",
                gender: "M",
                age: 18
            })

            await userRepo.insert(user_2)            
        })

        it("could create post", async function () {
            const post = "Homework 1 for CSE583?"
            post_1 = await postRepo.createPost(post, user_2, course_1)

            expect(post_1.user).to.exist
            expect(post_1.content === post)
        })

        it("could create comment", async function () {
            let comment = new Post()
            comment.content = "This is the comment"
            comment.user = user_2

            await postRepo.createComment(post_1, comment)

            let post_with_comments_return = await postRepo.findOnePostByIdWithComments(post_1.id!)

            assert(post_with_comments_return !== undefined)
            expect(post_with_comments_return!.comments).has.lengthOf(1)
            expect(post_with_comments_return!.comments![0]["content"]).is.equal(comment.content)
            expect(post_with_comments_return!.user).is.not.undefined
            expect(post_with_comments_return!.user?.email).is.equal(user_1_email)
            expect(post_with_comments_return!.user?.name).is.equal("zhangsan")


        })

        // it("could assign students' grade", async function () {

        //     var letterGrade = await userRepo.findLetterGradeByCourse(course_1, user_1)

        //     expect(letterGrade!.gradeid === letter_grade_1.gradeid)
        // })

        // after(async function() {
        //     const get_course_1 = await courseRepo.findOneCourseByName(course_1_name)
        //     await userRepo.removeUser(user_1)
        //     await courseRepo.removeCourse(get_course_1!)
        // })

    })

    describe("Professor can assign coursework", function() {
        var userRepo: UserRepository, lettergradeRepo: LetterGradeRepository, user_1: User, courseRepo: CourseRepository;
        var course_1: Course, courseworkRepo: CourseworkRepository;
        const course_1_name = "CMPSC464-2"
        const user_1_email = "789@psu.edu"
        const section = 2
        var letter_grade_1: LetterGrade;
        var coursework_1: Coursework;
        before(async function() {
            userRepo = getUserRepository()
            lettergradeRepo = getLetterGradeRepository()
            courseRepo = getCourseRepository()
            courseworkRepo = getCourseworkRepository()
            course_1 = await courseRepo.createCourse(course_1_name, section)

            user_1 = userRepo.create({
                name: "zhangsan",
                role: UserRole.Student,
                email: user_1_email,
                password: "123456",
                gender: "M",
                age: 18
            })

            await userRepo.insert(user_1)            
        })

        it("could create new homework", async function () {
            const homework_1 = "homework1"
            const homework_1_type = CourseworkType.Homework
            coursework_1 = await courseworkRepo.createCoursework(course_1, homework_1, homework_1_type, user_1)

            expect(coursework_1.name).to.exist
            assert(coursework_1.name === homework_1)
        })

        it("homework should be created correctly", async function(){
            const get_coursework_1 = await courseworkRepo.findCourseworkById(course_1.id!)
            const get_coursework_1_that_not_exist = await courseworkRepo.findCourseworkById(10)

            // courseworkRepo.gradeCoursework(100, get_coursework_1)

            expect(get_coursework_1).is.not.undefined;
            expect(get_coursework_1_that_not_exist).is.undefined;
            
        })

        it("professor grade coursework", async function(){
            const grade_coursework_1 = await courseworkRepo.gradeCoursework(coursework_1, 100)
            

            // courseworkRepo.gradeCoursework(100, get_coursework_1)

            expect(grade_coursework_1.grade == 100);
            
            
        })

    

    })
})