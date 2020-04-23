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

    async findOnePostByIdWithComments(id: number): Promise<Post | undefined> {
        let post = await this.findOne({ 
            where: { "id" : id },
            relations: ["comments", "user"]
        });

        return post;
    }

    


}