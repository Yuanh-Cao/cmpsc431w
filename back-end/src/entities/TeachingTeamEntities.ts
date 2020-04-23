import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, PrimaryColumn, OneToOne, ManyToMany, JoinTable, OneToMany } from "typeorm"
import {User, Users} from './UserEntities'
import {Course} from './CourseEntities'


@Entity("TeachingTeams")
export class TeachingTeam implements ITeachingTeam{
    constructor(){
    }

    @PrimaryColumn()
    ID?: number;

    @OneToOne(type => Course)
    @JoinColumn()
    Course?: Course;

    @OneToOne(type => User)
    @JoinColumn()
    Professor?: User;

    @ManyToMany(type => User)
    @JoinTable()
    TA?: User[];
}

export interface ITeachingTeam{
    ID?: number;
    Course?: Course;
    Professor?: User;
    TA?: Users;
}