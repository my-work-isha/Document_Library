export class MiscDocuments
{
    constructor(
        
	    public _id:string,
        public _rev:string,
        public Form:string,
        public txtLAName:string,
        public txtAssistAnalyst:string[],
       public  DocCreator:string,
       public dlgLogApprovers:string,
        public signature:string, 
        public sigtimestamp:string,
        public txtLogNo:string,
        public txtChannel:string,
        public txtRvwType:string,
        public lock_status:string,
        public txtRvwMethod:string,
        public txtAttNameMisc:string,
        public rtAttachMisc:string,
        public txtPRAudit:string,
        public OldForm: string,
        public DeletedBy: string,
        public DeletedOn: string,
        public txtStatus:string,
        public $REF:string,
        public dtACRBDate:string,
        public txtCPN:string,
        public txCountry:string,
        public txMajorMarket:string,
        public txGrowthMarket:string,
        public txGeo:string,
        public dtcreated: string,
        public dtmodified: string
    ){}
}