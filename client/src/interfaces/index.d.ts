export interface Post {
    _id: string;
    title: string;
    body: string;
    pet?: Pet;
}

export interface Pet {
    _id: string;
    name: string;
    age: number;
    type: string;
    posts?: Post[];
}