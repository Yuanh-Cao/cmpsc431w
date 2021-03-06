import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, PrimaryColumn, OneToOne, OneToMany, ManyToMany, JoinTable, EntityRepository, Repository } from "typeorm"
import { Course } from './CourseEntities'
import {User} from './UserEntities'


@Entity("Posts")
export class Post implements IPost{
    constructor(){
    }

    @PrimaryGeneratedColumn()
    id?: number

    @Column({nullable: true})
    content?: string

    @ManyToMany(type => Post)
    @JoinTable()
    comments?: Post[]

    @ManyToOne(type => User, user => user.posts)
    user?: User
}

// export class Comment extends Post {
//     constructor(comments: string, cemail: string){
//         super(posts, pemail){
//             this.comments = comments
//             this.cemail = cemail
//         }
        
//     }

//     @Column()
//     comments: string

//     @Column()
//     cemail: string

// }


export interface IPost{
    id?: number;
    content?: string;
    comments?: Post[];
    createdBy?: string;
    user?: User;
}


@EntityRepository(Post)
export class PostRepository extends Repository<Post> {

    async removePostById(id: number) {
        const post = await this.findOne(id)
        if (post) {
            return this.removePost(post)
        } else {
            return ""
        }
    }
    async removePost(content: Post) {

        await this.remove(content)
    }

    async createPost(content: string, user: User, course: Course) {
        let post = new Post()
        post.content = content
        post.user = user

        await this.insert(post)

        await this.createQueryBuilder().relation(Course, "posts")
        .of(course.id)
        .add(post.id);

        return post 
    }

    async createComment(post: Post, comment: Post) {

        await this.insert(comment)
        
        await this.createQueryBuilder().relation(Post, "comments")
        .of(post.id)
        .add(comment.id);
        
    }

    async findPostsByCourse(course: Course): Promise<Post[]> {
        return await this.createQueryBuilder().relation(Course, "posts").of(course).loadMany()
    }

    async findPostsByCourseId(course_id: number): Promise<Post[]> {
        return await this.createQueryBuilder("post")
        .leftJoin("post.user", "user")
        .leftJoin("post.comments", "comments")
        .relation(Course, "posts")
        .of(course_id)
        .loadMany()
    }

    async findOnePostByID(id: number): Promise<Post | undefined> {
        let post = await this.findOne({
            where: {"id" : id}
        })

        return post
    }

    async findOnePostByIdWithComments(id: number): Promise<Post | undefined> {
        let post = await this.findOne({ 
            where: { "id" : id },
            relations: ["comments", "user"]
        });

        if (post?.comments && post.comments.length > 0) {
            for (var i = 0;i<post.comments.length;i++) {
                let comment = await this.findOne({ 
                    where: { "id" : post?.comments[i].id },
                    relations: ["user"]
                });

                if (comment) {
                    post.comments[i] = comment
                }
        
            }
        }

        return post;
    }

    


}