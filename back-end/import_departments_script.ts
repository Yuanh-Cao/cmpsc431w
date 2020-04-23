import csv2json from 'csvtojson';
import { Repository, EntityRepository } from "typeorm";
import { getPostRepository, getCourseRepository, connect, getUserRepository, getDepartmentRepository } from './src/dateabase-ops';
import { UserRole } from './src/entities/UserEntities';
import { Department } from './src/entities/DepartmentEntities';


csv2json()
.fromFile('./src/database/Professors.csv')
.then(async (jsonObj)=>{
    await connect("prod.sqlite")
    const departmentRepo = getDepartmentRepository()

    for (var obj of jsonObj) {
        const departmentObj = departmentRepo.create({
            Did: obj["Department"],
            Dname: obj["Department Name"]
        })

        await departmentRepo.save(departmentObj)
    }
})