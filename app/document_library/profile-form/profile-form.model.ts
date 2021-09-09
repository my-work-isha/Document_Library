export class ProfileForm{
    constructor(
        public _id:string,
        public _rev:string,
        public Form:string,
        public principalName:string,
        public appBaseURL: string       
    ){
    }
}