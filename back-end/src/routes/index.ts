import { Request, Response, Router } from 'express';
import {Student, TeachingAssistant} from '../entities/UserEntities';
import { getUserRepository } from 'src/dateabase-ops';

// Init router and path
const router = Router();



router.get('/all-students',  async function(req: Request, res: Response)  {
    //SQL
    var result: {}
    const userRepo = getUserRepository()

    const students = await userRepo.find({})
    // let student1 = new Student("email", "aaa", false)
    // let student2 = new TeachingAssistant("email", "aaa")

    // let students = queryAllStudent()

    res.json(students)

});

// Export the base-router
export default router;
