
import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, Repository, EntityRepository, ManyToMany, JoinTable, getConnection, OneToMany } from "typeorm"
import { getUserRepository, getLetterGradeRepository } from '../dateabase-ops'
import { Course, Coursework } from './CourseEntities'
import { LetterGrade } from './LetterGradeEntites'
import { Post } from './PostEntities'
// import { User } from "./user"

// @Entity("ZMESSAGE")
// export class Message {
//   @PrimaryGeneratedColumn({ name: "Z_PK" })
//     id!: number

//   @ManyToOne(type => User)
//   @JoinColumn({ name: "ZSENDER", referencedColumnName: "id" })
//     sender?: User

//   @Column({ name: "ZTEXT" })
//     text?: string
// }


export type Users = User[]

export enum UserRole {
    Student = "S",
    Professor = "P"
}

// new User(email, name)

@Entity("Users")
export class User implements IUser {
    constructor(name: string, role: UserRole) {
        this.name = name
        this.role = role
    }

    @PrimaryColumn()
    email?: string

    @Column()
    name: string

    @Column()
    password?: string

    @Column()
    role: UserRole

    @Column({ nullable: true })
    isTA?: boolean

    @Column({ nullable: true })
    major?: string

    @Column({ nullable: true })
    age?: number

    @Column({ nullable: true })
    gender?: string

    @Column({ nullable: true })
    office?: string

    @Column({ nullable: true })
    zipcode?: number

    @Column({ nullable: true })
    phone?: number

    @Column({ nullable: true })
    street?: string

    @Column({ nullable: true })
    city?: string

    @Column({ nullable: true })
    state?: string

    @Column({ nullable: true })
    title?: string

    @ManyToMany(type => Course)
    @JoinTable()
    Courses?: Course[];

    @ManyToMany(type => Course)
    @JoinTable()
    posts?: Post[];

    @OneToMany(type => LetterGrade, LetterGrade => LetterGrade.student)
    lettergrade?: LetterGrade[];

    @OneToMany(type => Coursework, Coursework => Coursework.student)
    coursework?: Coursework[];
}

export class Student extends User {
    constructor(name: string) {
        super(name, UserRole.Student)
        this.isTA = false
    }
}

export class TeachingAssistant extends Student {
    constructor(name: string) {
        super(name)
        this.isTA = true
    }
}

export class Professor extends User {
    constructor(name: string) {
        super(name, UserRole.Professor)
        this.isTA = false
    }
}

export interface IUser {
    email?: string

    name: string

    password?: string

    role: string

    isTA?: boolean

    department?: string

    major?: string

    age?: number

    gender?: string

    office?: string

    zipcode?: number

    phone?: number

    street?: string

    city?: string

    state?: string

    title?: string

    Courses?: Course[]

    Posts?: Post[]

    lettergrade?:LetterGrade[]
}

// export interface IProfessor extends IUser {
//     role: UserRole.Professor
// }

// export interface IStudent extends IUser {
//     role: UserRole.Student
// }

// export interface ITeachingAssistant extends IStudent {
//     role: UserRole.Student
// }

@EntityRepository(User)
export class UserRepository extends Repository<User> {

    async removeUser(user: User) {
        await this.remove(user)
    }

    async findLetterGradeByCourse(course: Course, user: User): Promise<LetterGrade | undefined> {
        let letterGradeRepo = getLetterGradeRepository()
        return letterGradeRepo.findOne({where: {student: user.email, course: course.id}, relations: ["student", "course"]})
    }

    async enrollCourse(user: User, course: Course) {
        this.createQueryBuilder().relation(User, "Courses")
        .of(user.email)
        .add(course.id);
    }

    async createUser(email: string, password: string) {
        const user_table = "Users"
        // await this.query(`INSERT INTO User (email, name, password, role) VALUES (456@psu.edu, lisi, qwertyuiop, S)`);
        let user = new User("", UserRole.Student)
        user.email = email
        user.password = password

        await this.insert(user)
        return true
    }

    async findOneUser(email: string): Promise<User | undefined> {
        let user = await this.findOne({ 
            where: { email: email }
        });

        return user;
    }
}

export async function userEmailPasswordCheck(email: string, password: string): Promise<boolean> {
    const userRepo = getUserRepository()
    const user = await userRepo.findOneUser(email);

    if (user === undefined) {
        return false
    } else {
        if (user.password === password) {
            return true
        }
    }

    return false
}

export async function getProfileByEmail(email: string): Promise<any> {
    const userRepo = getUserRepository()
    const user = await userRepo.findOneUser(email);

    var result = {
        name: user?.name,
        age: user?.age,
        gender: user?.gender
    }

    return result
}