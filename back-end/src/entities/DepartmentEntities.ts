import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, PrimaryColumn, OneToOne, OneToMany, ManyToMany, JoinTable, EntityRepository, Repository } from "typeorm"
import { Users, Professor, User } from './UserEntities';
import { Course } from './CourseEntities';

@Entity("Departments")
export class Department implements IDepartment{
    constructor(Did: string, Dname: string){
        this.Did = Did
        this.Dname = Dname;
    }

    @PrimaryColumn()
    Did: string;

    @Column()
    Dname: string;

    @ManyToMany(type => User)
    @JoinTable()
    User?: User[];

    @ManyToMany(type => Course)
    @JoinTable()
    Courses?: Course[]
}


export interface IDepartment{
    Did?: string;
    Dname: string;
    Users?: Users;
    Courses?: Course[];
}


@EntityRepository(Department)
export class DepartmentRepository extends Repository<Department> {

    async removeDepartment(department: Department) {

        await this.remove(department)
    }

    async createDepartment(Did: string, Dname: string) {
        let department = new Department(Did, Dname)
        department.Dname = Dname
        
        await this.insert(department);
        return department;
    }

    async findOneDepartment(Did: string): Promise<Department | undefined> {
        let department = await this.findOne({ 
            where: { 'Did': Did }
        });
        return department;
    }

    async findOneDepartmentByName(Dname: string): Promise<Department | undefined> {
        let department = await this.findOne({ 
            where: { "Dname" : Dname }
        });

        return department;
    }

    async findOneDepartmentByCourseName(Coursename: string): Promise<Department | undefined> {
        let department = await this.findOne({ 
            where: { "coursename" : Course }
        });

        return department;
    }
}