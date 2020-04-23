import { Entity, Column, PrimaryGeneratedColumn, EntityRepository, Repository, ManyToMany, JoinTable, ManyToOne } from "typeorm"
import { Department } from './DepartmentEntities';
import { Course } from './CourseEntities';
import { User, Student } from './UserEntities';

@Entity("LetterGrades")
export class LetterGrade implements ILetterGrade {

    constructor(lettergrade: string) {
        this.lettergrade = lettergrade
    }
    
    @PrimaryGeneratedColumn()
    gradeid?: number;

    @ManyToOne(type => User, Student => Student.lettergrade)
    @JoinTable()
    student?: User;

    @ManyToOne(type => Course, Course => Course.lettergrade)
    @JoinTable()
    course?: Course;

    @Column({nullable: true})
    lettergrade?: string;
}


export interface ILetterGrade{
    gradeid?: number;  

    students?: User[];

    courses?: Course[];

    lettergrade?: string;
}

@EntityRepository(LetterGrade)
export class LetterGradeRepository extends Repository<LetterGrade> {

    async removeLetterGrade(lettergrade: LetterGrade) {

        await this.remove(lettergrade)
    }

    async createLetterGrade(grade: string, user: User, course: Course) {
        let lettergrade = new LetterGrade(grade)
        lettergrade.student = user
        lettergrade.course = course

        await this.insert(lettergrade)
        
        return lettergrade
    }

    async findOneLetterGrade(gradeid: string): Promise<LetterGrade | undefined> {
        let lettergrade = await this.findOne({ 
            where: { 'id': gradeid }
        });
        return lettergrade;
    }

    async findOneLetterGradeByEmail(email: string): Promise<LetterGrade[] | undefined> {
        let lettergrades = await this.find({ 
            where: { "email" : email }
        });

        return lettergrades;
    }

}