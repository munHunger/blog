import {PostPart} from './postPart.model';

export class Post {
    public title: string;
    public github: string;
    public headerCode: string;
    public parts: PostPart[];
}