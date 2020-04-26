import csv2json from 'csvtojson';
import { Repository, EntityRepository } from "typeorm";
import { getPostRepository, getCourseRepository, connect, getUserRepository, getDepartmentRepository } from './src/dateabase-ops';
import { UserRole, User } from './src/entities/UserEntities';
import { Department } from './src/entities/DepartmentEntities';


csv2json()
.fromFile('./src/database/Professors.csv')
.then(async (jsonObj)=>{
    await connect("prod.sqlite")

    const courseRepo = getCourseRepository()
    const userRepo = getUserRepository()
    const departmentRepo = getDepartmentRepository()

    for (var obj of jsonObj) {
        const Did = obj["Department"]
        const ProfessorEmail = obj["Email"]

        const professorEntity = userRepo.create({
            email: ProfessorEmail,
            name: obj["Name"],
            password: obj["Password"],
            age: obj["Age"],
            gender: obj["Gender"],       
            office: obj["Office"],
            title: obj["Title"],
            role: UserRole.Professor,            
        })

        await userRepo.save(professorEntity)


        var course_entities = await courseRepo.findAllCoursesByName(obj["Teaching"])

        if (course_entities.length === 0) {
            let newCourse = courseRepo.create({
                name: obj["Teaching"]
            })
            await courseRepo.save(newCourse)
            course_entities = [newCourse]
        }
        // Add department course relation
        for (var course_entity of course_entities) {    
            const DepartmetnCourseRelation = await departmentRepo.createQueryBuilder("department")
            .leftJoinAndSelect("department.Courses", "course")
            .where("course.id = :cid", {cid: course_entity!.id}).getOne()
    
            if (DepartmetnCourseRelation === undefined) {
                await departmentRepo.createQueryBuilder().relation(Department, "Courses").of(Did).add(course_entity!.id)
            }

            const ProfessorCourseRelation = await userRepo.createQueryBuilder("user")
            .leftJoinAndSelect("user.Courses", "Course")
            .where("Course.id = :cid", {cid: course_entity!.id!})
            .andWhere("email = :email", {email: ProfessorEmail})
            .getOne()
            
            if (ProfessorCourseRelation === undefined) {
                await userRepo.createQueryBuilder().relation(User, "Courses").of(ProfessorEmail).add(course_entity!.id!)
            }
    
        }
        
        // Add department user(professor) relation
        const DepartmetnUserRelation = await departmentRepo.createQueryBuilder("department")
        .leftJoinAndSelect("department.User", "user")
        .where("user.email = :email", {email: ProfessorEmail}).getOne()
        
        if (DepartmetnUserRelation === undefined) {
            await departmentRepo.createQueryBuilder().relation(Department, "User").of(Did).add(ProfessorEmail)
        }

    }
})