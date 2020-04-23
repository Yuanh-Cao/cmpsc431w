import { User, UserRepository } from './entities/UserEntities';
import { createConnection, Connection } from "typeorm"
import { Course, CourseRepository, CourseworkRepository, Coursework } from './entities/CourseEntities';
import { Post, PostRepository } from './entities/PostEntities';
import { Department, DepartmentRepository } from './entities/DepartmentEntities';
import { TeachingTeam } from './entities/TeachingTeamEntities';
import { LetterGrade, LetterGradeRepository } from './entities/LetterGradeEntites';

var  _connection: Connection;

export async function connect(databaseFN: string = `${__dirname}/db.sqlite`) {
    _connection = await createConnection({
        type: "sqlite",
        database: databaseFN,
        synchronize: true,
        logging: false,
        entities: [
            User,
            Course,
            Post,
            Department,
            TeachingTeam,
            LetterGrade,
            Coursework
        ]
     });
}

export function connected() { 
    return typeof _connection !== 'undefined'; 
}

export function getUserRepository(): UserRepository {
    return _connection.getCustomRepository(UserRepository);
}

export function getCourseRepository(): CourseRepository{
    return _connection.getCustomRepository(CourseRepository);
}

export function getDepartmentRepository(): DepartmentRepository{
    return _connection.getCustomRepository(DepartmentRepository);
}

export function getLetterGradeRepository(): LetterGradeRepository {
    return _connection.getCustomRepository(LetterGradeRepository);
}

export function getPostRepository(): PostRepository {
    return _connection.getCustomRepository(PostRepository);
}

export function getCourseworkRepository(): CourseworkRepository {
    return _connection.getCustomRepository(CourseworkRepository);
}