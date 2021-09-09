export class TrashDocuments{
    constructor(
        public _id:string,
        public _rev:string,
        public Form:string,
        public DeletedBy: string,
        public DeletedOn: string,
        public OldForm: string,
        public txtLogNo: string
    ) { }
} 