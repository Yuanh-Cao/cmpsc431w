import csv2json from 'csvtojson';
import { Repository, EntityRepository } from "typeorm";
import { getPostRepository, getCourseRepository, connect, getUserRepository } from './src/dateabase-ops';
import { Course } from './src/entities/CourseEntities';
import { Post } from './src/entities/PostEntities';
import { User } from './src/entities/UserEntities';

csv2json()
.fromFile('./src/database/Posts_Comments.csv')
.then(async (jsonObj)=>{
    
    await connect("prod.sqlite")

    const courseRepo = getCourseRepository()
    const postRepo = getPostRepository()
    const userRepo = getUserRepository()

    for (var obj of jsonObj) {
        const courseName = obj["Courses"]

        const coursesObj: Course[] = await courseRepo.findAllCoursesByName(courseName)

        for(var courseObj of coursesObj) {
            courseObj.dropddl = obj["Drop Deadline"]
            await courseRepo.save(courseObj)
        }


        if (obj["Post 1"] !== "") {
            const user1Email = obj["Post 1 By"]
            const user1_entity = await userRepo.findOneUser(user1Email)
            const user2Email = obj["Comment 1 By"]
            const user2_entity = await userRepo.findOneUser(user2Email)

            if (user1_entity !== undefined && user2_entity !== undefined) {
                for(var courseObj of coursesObj) {
                    const postContent = obj["Post 1"]
                    const newPost = await postRepo.createPost(postContent, user1_entity, courseObj)

                    //Add User Post Relation
                    const UserPostRelation = await userRepo.createQueryBuilder("user")
                    .leftJoinAndSelect("user.posts", "post")
                    .where("post.id = :pid", {pid: newPost!.id}).getOne()

                    if (UserPostRelation === undefined) {
                        await userRepo.createQueryBuilder().relation(User, "posts").of(user1Email).add(newPost!.id!)
                    }
                    // End Add User Post Relation

                    const commentObj = postRepo.create({
                        content: obj["Comment 1"],
                        user: user2_entity,
                    })
    
                    await postRepo.createComment(newPost, commentObj)
                }
            }


        }



        for(var courseObj of coursesObj) {
            var post_entities = await postRepo.findPostsByCourse(courseObj)
           
            for (var post_entity of post_entities) {
            
            // if (post_entity === undefined) {
            //     post_entity = postRepo.create({
            //         content: obj["Post 1"],
            //         user: user1_entity,
            //         course: courseObj
            //     })
            //     await postRepo.save(post_entities)
            // }
    
                const CoursePostRelation = await courseRepo.createQueryBuilder("course")
                .leftJoinAndSelect("course.posts", "post")
                .where("post.id = :pid", {pid: post_entity!.id}).getOne()
        
                if (CoursePostRelation === undefined) {
                    await courseRepo.createQueryBuilder().relation(Course, "posts").of(courseObj.id).add(post_entity!.id)
                }

                
            }

        }
    }


	/**
	 * [
	 * 	{a:"1", b:"2", c:"3"},
	 * 	{a:"4", b:"5". c:"6"}
	 * ]
	 */ 
})