import csv2json from 'csvtojson';
import { Repository, EntityRepository } from "typeorm";
import { getPostRepository, getCourseRepository, connect, getUserRepository, getDepartmentRepository, getCourseworkRepository } from './src/dateabase-ops';
import { UserRole, User } from './src/entities/UserEntities';
import { Department } from './src/entities/DepartmentEntities';
import { CourseworkType, Course } from './src/entities/CourseEntities';


csv2json()
.fromFile('./src/database/Students_TA.csv')
.then(async (jsonObj)=>{

    await connect("prod.sqlite")

    const courseRepo = getCourseRepository()
    const userRepo = getUserRepository()
    const departmentRepo = getDepartmentRepository()

    for (var obj of jsonObj) {
        const Did = obj["Major"]
        const course1Section = parseInt(obj["Course 1 Section"])
        const course1Exist = await courseRepo.courseExist(obj["Courses 1"], course1Section)
        var course1Entity: Course;
        
        if (!course1Exist) {
            course1Entity = courseRepo.create({
                name: obj["Courses 1"],
                description: obj["Course 1 Details"] + ": " + obj["Course 1 Name"],
                section: obj["Course 1 Section"],
                limit: obj["Course 1 Section Limit"]

            })
            await courseRepo.insert(course1Entity)
        }

        const course2Section = parseInt(obj["Course 2 Section"])
        const course2Exist = await courseRepo.courseExist(obj["Courses 2"], course2Section)
        var course2Entity: Course;

        if (!course2Exist) {
            course2Entity = courseRepo.create({
                name: obj["Courses 2"],
                description: obj["Course 2 Details"] + ": " + obj["Course 2 Name"],
                section: obj["Course 2 Section"],
                limit: obj["Course 2 Section Limit"]
            })
            await courseRepo.insert(course2Entity)
        }

        const course3Section = parseInt(obj["Course 3 Section"])
        const course3Exist = await courseRepo.courseExist(obj["Courses 3"], course3Section)
        var course3Entity: Course;

        if (!course3Exist) {
            course3Entity = courseRepo.create({
                name: obj["Courses 3"],
                description: obj["Course 3 Details"] + ": " + obj["Course 3 Name"],
                section: obj["Course 3 Section"],
                limit: obj["Course 3 Section Limit"]
            })
            await courseRepo.insert(course3Entity)
        }
        
        const studentEmail = obj["Email"]
        const studentObj = userRepo.create({
            email: studentEmail,
            name: obj["Full Name"],
            password: obj["Password"],
            age: obj["Age"],
            gender: obj["Gender"],
            zipcode: obj["Zip"],
            phone: obj["Phone"],
            street: obj["Street"],
            city: obj["City"],
            state: obj["State"],
            role: UserRole.Student,
            major: obj["Major"],
            isTA: obj["Teaching Team ID"] === "" ? false : true
        })

        await userRepo.save(studentObj)
    
        // Add Department Student relation
        const DepartmetnUserRelation = await departmentRepo.createQueryBuilder("department")
        .leftJoinAndSelect("department.User", "user")
        .where("user.email = :email", {email: studentObj!.email}).getOne()
        
        if (DepartmetnUserRelation === undefined) {
            await departmentRepo.createQueryBuilder().relation(Department, "User").of(Did).add(studentEmail)
        }

        // Add User(student) course relation
        const UserCourse1Relation = await userRepo.createQueryBuilder("user")
        .leftJoinAndSelect("user.Courses", "Course")
        .where("Course.id = :cid", {cid: course1Entity!.id!})
        .andWhere("email = :email", {email: studentEmail})
        .getOne()
        
        if (UserCourse1Relation === undefined) {
            await userRepo.createQueryBuilder().relation(User, "Courses").of(studentEmail).add(course1Entity!.id!)
        }

        const UserCourse2Relation = await userRepo.createQueryBuilder("user")
        .leftJoinAndSelect("user.Courses", "Course")
        .where("Course.id = :cid", {cid: course2Entity!.id!})
        .andWhere("email = :email", {email: studentEmail})
        .getOne()
        
        if (UserCourse2Relation === undefined) {
            await userRepo.createQueryBuilder().relation(User, "Courses").of(studentEmail).add(course2Entity!.id!)
        }

        const UserCourse3Relation = await userRepo.createQueryBuilder("user")
        .leftJoinAndSelect("user.Courses", "Course")
        .where("Course.id = :cid", {cid: course3Entity!.id!})
        .andWhere("email = :email", {email: studentEmail})
        .getOne()
        
        if (UserCourse3Relation === undefined) {
            await userRepo.createQueryBuilder().relation(User, "Courses").of(studentEmail).add(course3Entity!.id!)
        }

    }

})
