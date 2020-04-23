import csv2json from 'csvtojson';
import { Repository, EntityRepository } from "typeorm";
import { getPostRepository, getCourseRepository, connect, getUserRepository, getDepartmentRepository, getCourseworkRepository } from './src/dateabase-ops';
import { UserRole, User } from './src/entities/UserEntities';
import { Department } from './src/entities/DepartmentEntities';
import { CourseworkType } from './src/entities/CourseEntities';


csv2json()
.fromFile('./src/database/Students_TA.csv')
.then(async (jsonObj)=>{

    await connect("prod.sqlite")

    const courseRepo = getCourseRepository()
    const userRepo = getUserRepository()
    const departmentRepo = getDepartmentRepository()
    const courseworkRepo = getCourseworkRepository()

    for (var obj of jsonObj) {

        // console.log(obj["Course 1 Section"])
        // parseInt("1") => 1
        const course1Section = parseInt(obj["Course 1 Section"])
        const course1Exist = await courseRepo.courseExist(obj["Courses 1"], course1Section)

        if (!course1Exist) {
            const courseObj = courseRepo.create({
                name: obj["Courses 1"],
                description: obj["Course 1 Details"] + ": " + obj["Course 1 Name"],
                section: obj["Course 1 Section"],
                limit: obj["Course 1 Section Limit"]

            })
            await courseRepo.insert(courseObj)

        }

        const course2Section = parseInt(obj["Course 2 Section"])
        const course2Exist = await courseRepo.courseExist(obj["Courses 2"], course2Section)

        if (!course2Exist) {
            const courseObj = courseRepo.create({
                name: obj["Courses 2"],
                description: obj["Course 2 Details"] + ": " + obj["Course 2 Name"],
                section: obj["Course 2 Section"],
                limit: obj["Course 2 Section Limit"]

            })
            await courseRepo.insert(courseObj)

        }

        const course3Section = parseInt(obj["Course 3 Section"])
        const course3Exist = await courseRepo.courseExist(obj["Courses 3"], course3Section)

        if (!course3Exist) {
            const courseObj = courseRepo.create({
                name: obj["Courses 3"],
                description: obj["Course 3 Details"] + ": " + obj["Course 3 Name"],
                section: obj["Course 3 Section"],
                limit: obj["Course 3 Section Limit"]

            })
            await courseRepo.insert(courseObj)
        }
        
        const userObj = userRepo.create({
            email: obj["Email"],
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

        await userRepo.save(userObj)


        var user_entity = await userRepo.findOneUser(obj["Email"])
        const departmentRepo = getDepartmentRepository()
        var department_entity = await departmentRepo.findOneDepartment(obj["Major"])
        

        const DepartmetnUserRelation = await departmentRepo.createQueryBuilder("department")
        .leftJoinAndSelect("department.User", "user")
        .where("user.email = :email", {pid: user_entity!.email}).getOne()
        
        if (DepartmetnUserRelation === undefined) {
            await departmentRepo.createQueryBuilder().relation(Department, "User").of(department_entity!.Did).add(user_entity!.email)
        }

    }

})
