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


        // Add Course 1 HW
        const course11_name = obj["Courses 1"]
        const course11_section = obj["Course 1 Section"]
        const course11 = await courseRepo.findOneCourseByNameAndSection(course11_name, course11_section)

        const coursework11_type = CourseworkType.Homework
        const coursework11_name = parseInt(obj["Course 1 HW_No"]).toString()
        const coursework11_user_email = student_email
        var coursework11: Coursework | undefined

        coursework11 = await courseworkRepo.findCoursework(coursework11_type, coursework11_name, course11!.id!, coursework11_user_email)

        if (!coursework11) {
            coursework11 = courseworkRepo.create({
                name: coursework11_name,
                detail: obj["Course 1 HW_Details"],
                grade: obj["Course 1 HW_Grade"],
                type: coursework11_type
            })
            
            await courseworkRepo.save(coursework11)

            await courseworkRepo.createQueryBuilder().relation(Coursework, "student").of(coursework11).set(student)
            await courseworkRepo.createQueryBuilder().relation(Coursework, "course").of(coursework11).set(course11)
        }
        // End of adding course1 HW


        // Add Course 1 EXAM
        const course12_name = obj["Courses 1"]
        const course12_section = obj["Course 1 Section"]
        const course12 = await courseRepo.findOneCourseByNameAndSection(course12_name, course12_section)

        const coursework12_type = CourseworkType.Exam
        const coursework12_name = parseInt(obj["Course 1 EXAM_No"]).toString()
        const coursework12_user_email = student_email
        var coursework12: Coursework | undefined

        coursework12 = await courseworkRepo.findCoursework(coursework12_type, coursework12_name, course12!.id!, coursework12_user_email)

        if (!coursework12) {
            coursework12 = courseworkRepo.create({
                name: coursework12_name,
                detail: obj["Course 1 Exam_Details"],
                grade: obj["Course 1 EXAM_Grade"],
                type: coursework12_type
            })
            
            await courseworkRepo.save(coursework12)

            await courseworkRepo.createQueryBuilder().relation(Coursework, "student").of(coursework12).set(student)
            await courseworkRepo.createQueryBuilder().relation(Coursework, "course").of(coursework12).set(course12)
        }
        // End of adding course1 EXAM

        // Add Course 2 HW
        const course21_name = obj["Courses 2"]
        const course21_section = obj["Course 2 Section"]
        const course21 = await courseRepo.findOneCourseByNameAndSection(course21_name, course21_section)

        const coursework21_type = CourseworkType.Homework
        const coursework21_name = parseInt(obj["Course 2 HW_No"]).toString()
        const coursework21_user_email = student_email
        var coursework21: Coursework | undefined

        coursework21 = await courseworkRepo.findCoursework(coursework21_type, coursework21_name, course21!.id!, coursework21_user_email)

        if (!coursework21) {
            coursework21 = courseworkRepo.create({
                name: coursework21_name,
                detail: obj["Course 2 HW_Details"],
                grade: obj["Course 2 HW_Grade"],
                type: coursework21_type
            })
            
            await courseworkRepo.save(coursework21)

            await courseworkRepo.createQueryBuilder().relation(Coursework, "student").of(coursework21).set(student)
            await courseworkRepo.createQueryBuilder().relation(Coursework, "course").of(coursework21).set(course21)
        }
        // End of adding course2 HW


        // Add Course 2 EXAM
        const course22_name = obj["Courses 2"]
        const course22_section = obj["Course 2 Section"]
        const course22 = await courseRepo.findOneCourseByNameAndSection(course22_name, course22_section)

        const coursework22_type = CourseworkType.Exam
        const coursework22_name = parseInt(obj["Course 2 EXAM_No"]).toString()
        const coursework22_user_email = student_email
        var coursework22: Coursework | undefined

        coursework22 = await courseworkRepo.findCoursework(coursework22_type, coursework22_name, course22!.id!, coursework22_user_email)

        if (!coursework22) {
            coursework22 = courseworkRepo.create({
                name: coursework22_name,
                detail: obj["Course 2 Exam_Details"],
                grade: obj["Course 2 EXAM_Grade"],
                type: coursework22_type
            })
            
            await courseworkRepo.save(coursework22)

            await courseworkRepo.createQueryBuilder().relation(Coursework, "student").of(coursework22).set(student)
            await courseworkRepo.createQueryBuilder().relation(Coursework, "course").of(coursework22).set(course22)
        }
        // End of adding course2 EXAM



        // Add Course 3 HW
        const course31_name = obj["Courses 3"]
        const course31_section = obj["Course 3 Section"]
        const course31 = await courseRepo.findOneCourseByNameAndSection(course31_name, course31_section)

        const coursework31_type = CourseworkType.Homework
        const coursework31_name = parseInt(obj["Course 3 HW_No"]).toString()
        const coursework31_user_email = student_email
        var coursework31: Coursework | undefined

        coursework31 = await courseworkRepo.findCoursework(coursework31_type, coursework31_name, course31!.id!, coursework31_user_email)

        if (!coursework31) {
            coursework31 = courseworkRepo.create({
                name: coursework31_name,
                detail: obj["Course 3 HW_Details"],
                grade: obj["Course 3 HW_Grade"],
                type: coursework31_type
            })
            
            await courseworkRepo.save(coursework31)

            await courseworkRepo.createQueryBuilder().relation(Coursework, "student").of(coursework31).set(student)
            await courseworkRepo.createQueryBuilder().relation(Coursework, "course").of(coursework31).set(course31)
        }
        // End of adding course3 HW


        // Add Course 1 EXAM
        const course32_name = obj["Courses 3"]
        const course32_section = obj["Course 3 Section"]
        const course32 = await courseRepo.findOneCourseByNameAndSection(course32_name, course32_section)

        const coursework32_type = CourseworkType.Exam
        const coursework32_name = parseInt(obj["Course 3 EXAM_No"]).toString()
        const coursework32_user_email = student_email
        var coursework32: Coursework | undefined

        coursework32 = await courseworkRepo.findCoursework(coursework32_type, coursework32_name, course32!.id!, coursework32_user_email)

        if (!coursework32) {
            coursework32 = courseworkRepo.create({
                name: coursework32_name,
                detail: obj["Course 3 Exam_Details"],
                grade: obj["Course 3 EXAM_Grade"],
                type: coursework32_type
            })
            
            await courseworkRepo.save(coursework32)

            await courseworkRepo.createQueryBuilder().relation(Coursework, "student").of(coursework32).set(student)
            await courseworkRepo.createQueryBuilder().relation(Coursework, "course").of(coursework32).set(course32)
        }
        // End of adding course3 EXAM


    }


})
