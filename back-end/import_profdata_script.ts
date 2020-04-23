import csv2json from 'csvtojson';
import { Repository, EntityRepository } from "typeorm";
import { getPostRepository, getCourseRepository, connect, getUserRepository, getDepartmentRepository } from './src/dateabase-ops';
import { UserRole } from './src/entities/UserEntities';
import { Department } from './src/entities/DepartmentEntities';


csv2json()
.fromFile('./src/database/Professors.csv')
.then(async (jsonObj)=>{
    await connect("prod.sqlite")

    const courseRepo = getCourseRepository()
    const userRepo = getUserRepository()
    const departmentRepo = getDepartmentRepository()

    for (var obj of jsonObj) {
        const departmentObj = departmentRepo.create({
            Did: obj["Department"],
            Dname: obj["Department Name"]
        })

        await departmentRepo.save(departmentObj)


        const userObj = userRepo.create({
            email: obj["Email"],
            name: obj["Name"],
            password: obj["Password"],
            age: obj["Age"],
            gender: obj["Gender"],       
            office: obj["Office"],
            title: obj["Title"],
            role: UserRole.Professor,            
        })

        await userRepo.save(userObj)

        var course_entities = await courseRepo.findAllCoursesByName(obj["Teaching"])

        for (var course_entity of course_entities) {
            if (course_entity === undefined) {
                course_entity = courseRepo.create({
                    name: obj["Teaching"]
                })
                await courseRepo.save(course_entity)
            }
    
            const DepartmetnCourseRelation = await departmentRepo.createQueryBuilder("department")
            .leftJoinAndSelect("department.Courses", "course")
            .where("course.id = :cid", {cid: course_entity!.id}).getOne()
    
            if (DepartmetnCourseRelation === undefined) {
                await departmentRepo.createQueryBuilder().relation(Department, "Courses").of(departmentObj.Did).add(course_entity!.id)
            }
        }


        var user_entity = await userRepo.findOneUser(obj["Email"])
        // const departmentRepo = getDepartmentRepository()
        var department_entity = await departmentRepo.findOneDepartment(obj["Department"])
        

        const DepartmetnUserRelation = await departmentRepo.createQueryBuilder("department")
        .leftJoinAndSelect("department.User", "user")
        .where("user.email = :email", {pid: user_entity!.email}).getOne()
        
        if (DepartmetnUserRelation === undefined) {
            await departmentRepo.createQueryBuilder().relation(Department, "User").of(department_entity!.Did).add(user_entity!.email)
        }
        
    }
})