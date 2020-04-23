import csv2json from 'csvtojson';
import { Repository, EntityRepository } from "typeorm";
import { getPostRepository, getCourseRepository, connect, getUserRepository, getDepartmentRepository, getCourseworkRepository } from './src/dateabase-ops';
import { UserRole, User } from './src/entities/UserEntities';
import { Department } from './src/entities/DepartmentEntities';
import { CourseworkType, Coursework } from './src/entities/CourseEntities';


csv2json()
.fromFile('./src/database/Students_TA.csv')
.then(async (jsonObj)=>{

    await connect("prod.sqlite")

    const courseRepo = getCourseRepository()
    const userRepo = getUserRepository()
    const departmentRepo = getDepartmentRepository()
    const courseworkRepo = getCourseworkRepository()

    for (var obj of jsonObj) {
        const student_email = obj["Email"]
        const student = await userRepo.findOneUser(student_email)


        const course1_name = obj["Courses 1"]
        const course1_section = obj["Course 1 Section"]
        const course1 = await courseRepo.findOneCourseByNameAndSection(course1_name, course1_section)

        const coursework1_type = CourseworkType.Homework
        const coursework1_name = obj["Course 1 HW_No"]
        const coursework1_user_email = student_email
        var coursework1: Coursework | undefined

        coursework1 = await courseworkRepo.findCoursework(coursework1_type, coursework1_name, course1!.id!, coursework1_user_email)

        if (!coursework1) {
            coursework1 = courseworkRepo.create({
                name: coursework1_name,
                type: coursework1_type
            })
            
            await courseworkRepo.save(coursework1)

            await courseworkRepo.createQueryBuilder().relation(Coursework, "student").of(coursework1).set(student)
            await courseworkRepo.createQueryBuilder().relation(Coursework, "course").of(coursework1).set(course1)

        }
    }


})
