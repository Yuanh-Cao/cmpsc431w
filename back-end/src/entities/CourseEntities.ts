import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, PrimaryColumn, OneToOne, ManyToMany, JoinTable, EntityRepository, Repository, OneToMany } from "typeorm"
import { User } from './UserEntities'
import { Department } from './DepartmentEntities';
import { Post } from './PostEntities';
import { LetterGrade } from './LetterGradeEntites';
import { expect } from 'chai';


@Entity("Courses")
export class Course implements ICourse{
    constructor(name: string) {
        this.name = name
    }

    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    name: string;

    @Column({nullable: true})
    description?: string;

    @Column({nullable: true})
    section?: number;

    @Column({nullable: true})
    limit?: number;

    @ManyToMany(type => Post)
    @JoinTable()
    posts?: Post[];

    @OneToMany(type => LetterGrade, LetterGrade => LetterGrade.course)
    lettergrade?: LetterGrade[];

    @Column({nullable: true})
    dropddl?: string;

    @OneToMany(type => Coursework, Coursework => Coursework.course)
    coursework?: Coursework[];
}

export interface ICourse {
    id?: number;

    name: string;

    description?: string;

    section?: number;

    limit?: number;

    posts?: Post[];

    lettergrade?: LetterGrade[];

    dropddl?: string;


}

export enum CourseworkType {
    Homework = "H",
    Exam = "E"
}

@Entity("Courseworks")
export class Coursework implements ICoursework {
    constructor() {

    }
    @PrimaryGeneratedColumn()
    id?: number

    @ManyToOne(type => Course)
    course?: Course

    @Column()
    name?: string;

    @Column()
    type?: CourseworkType;

    @Column({ nullable: true })
    detail?: string;

    @ManyToOne(type => User)
    student?: User;

    @Column({ nullable: true })
    grade?: number;
    
}
 
export interface ICoursework {
    id?: number;

    courses?: Course[];

    name?: string;

    type?: CourseworkType;

    detail?: string;

    students?: User[];

    grade?: number;
}


@EntityRepository(Course)
export class CourseRepository extends Repository<Course> {

    async removeCourse(course: Course) {
        await this.remove(course)
    }

    async createCourse(name: string, section: number) {
        let course = new Course(name)
        course.section = section
        
        await this.insert(course)
        return course
    }

    async findOneCourse(courseid: number): Promise<Course | undefined> {
        let course = await this.findOne({ 
            where: { "id" : courseid }
        });

        return course;
    }

    async findPostsByCourse(course: Course): Promise<Post[]> {
        let posts = await this.find({ 
            where: { "id" : course.id },
            relations: ["posts"]
        });

        return posts;
    }

    async findAllCoursesByName(course_name: string): Promise<Course[]> {
        let courses = await this.find({ 
            where: { "name" : course_name }
        });

        return courses;
    }

    async findAllCoursesByEmail(user_email: string): Promise<Course[]>{
        let courses = await this.createQueryBuilder().relation(User, "Courses").of(user_email).loadMany()

        return courses
    }

    async courseExist(name: string, section: number): Promise<boolean>{
        let course = await this.findOne({
            where:{"name": name, "section": section}
        })
        
        if (course !== undefined) {
            return true
        } else {
            return false
        }

    }



    async findOneCourseByNameAndSection(name: string, section: number): Promise<Course | undefined>{
        let course = await this.findOne({
            where:{"name": name, "section": section}
        })
        
        return course
    }

    async returnCourseidByNameAndSection(name: string, section: number): Promise<Course | undefined>{
        let course = await this.findOne({
            where:{"name": name, "section": section}
        })
        
        return course

    }
}

@EntityRepository(Coursework)
export class CourseworkRepository extends Repository<Coursework> {
    async removeCoursework(coursework: Coursework) {
        await this.remove(coursework)
    }

    async gradeCoursework(coursework: Coursework, grade: number) {
        coursework.grade = grade

        await this.save(coursework)

        return coursework
    }

    async createCoursework(course: Course, name: string, courseworktype: CourseworkType, student: User) {
        let coursework = new Coursework()
        coursework.name = name
        coursework.course = course
        coursework.type = courseworktype
        coursework.student = student
        
        await this.insert(coursework)
        return coursework;
    }

    async findCourseworksByStudent(student: User): Promise<Coursework[]> {
        let courseworks = await this.find({ 
            where: { student : student }
        });

        return courseworks;
    }

    async findCourseworksByEmailandCourse(email: string, course_id: number): Promise<Coursework[]> {
        let courseworks = await this.createQueryBuilder("coursework")
                .leftJoinAndSelect("coursework.course", "course")
                .leftJoinAndSelect("coursework.student", "student")
                .where("course.id = :cid", {cid: course_id})
                .andWhere("student.email = :email", {email: email})
                .getMany()

        return courseworks
    }

    async findCourseworkById(id: number) {
        let coursework = await this.findOne({ 
            where: { id : id }
        });

        return coursework;
    }

    async findCoursework(type: string, name: string, course_id: number, user_email: string): Promise<Coursework | undefined> {
        // let coursework = await this.findOne({ 
        //     where: { type : type, name: name, "course.id": course_id, "student.email": user_email },
        //     relations: ["course", "student"]
        // });

        let coursework = await this.createQueryBuilder("coursework")
                .leftJoinAndSelect("coursework.course", "course")
                .leftJoinAndSelect("coursework.student", "student")
                .select([
                    "coursework.type",
                    "coursework.name"
                ])
                .where("course.id = :cid", {cid: course_id})
                .andWhere("coursework.type = :type", {type: type})
                .andWhere("coursework.name = :name", {name: name})
                .andWhere("student.email = :email", {email: user_email}).getOne()

        return coursework
    }

}