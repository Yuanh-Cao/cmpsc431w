import "mocha"
import { assert, expect } from "chai"
import { connect, getUserRepository, getCourseRepository, getLetterGradeRepository, getPostRepository, getDepartmentRepository } from '../dateabase-ops';
import { UserRole, UserRepository, User } from '../entities/UserEntities';
import { CourseRepository, Course } from '../entities/CourseEntities';
import { LetterGradeRepository, LetterGrade} from '../entities/LetterGradeEntites';
import { DepartmentRepository, Department } from '../entities/DepartmentEntities';

describe("Deparment tests", function() {
    before(async function() {
        try {
            await connect("testdb.sqlite");
        } catch (e) {
            console.error(`Initialize Registrar failed with `, e);
            throw e;
        }
    });

    describe("could create department", function(){
        var departmentRepo: DepartmentRepository, department_1: Department, userRepo: UserRepository, user_1: User, courseRepo: CourseRepository;
        const course_1_name = "CMPSC464"
        const user_1_email = "123@psu.edu" 
        const section = 1
        const department_1_id = "CMPSC"
        const department_1_name = "Computer Science"
        before(async function() {
            userRepo = getUserRepository()
            departmentRepo = getDepartmentRepository()
            courseRepo = getCourseRepository()
            await courseRepo.createCourse(course_1_name, section)
            // await departmentRepo.createDepartment(department_1_id, department_1_name)
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

        it("should create department_1", async function() {
            department_1 = await departmentRepo.createDepartment(department_1_id, department_1_name)

            expect(department_1.Did).to.exist
            expect(department_1.Dname === department_1_name)
        })

        it("department name should be created correctly", async function(){
            const get_departmentname_1 = await departmentRepo.findOneDepartmentByName(department_1_name)
            const get_deparmentname_that_not_exist = await departmentRepo.findOneDepartmentByName("adkjhfaksdfkads")

            expect(get_departmentname_1).is.not.undefined;
            console.log(get_deparmentname_that_not_exist)
            expect(get_deparmentname_that_not_exist).is.undefined;
            
        })

        it("department should be created correctly", async function(){
            const get_department_1 = await departmentRepo.findOneDepartment(department_1_id)
            const get_deparment_that_not_exist = await departmentRepo.findOneDepartment("adkjhfaksdfkads")

            expect(get_department_1).is.not.undefined;
            expect(get_deparment_that_not_exist).is.undefined;
            
        })

    })

})