export class ITSMTSForm{
    constructor(
        
	    public _id:string,
        public _rev:string,
        public Form:string,        
        public DocReaders: string,
	    public ITSAuthors: string,
        public txtITSAudit: string,
	    public rtOtherDocs: string,
        public txtOtherDocs: string,
        public rtException: string,
        public txtException: string,
        public rtSerEliteContract   : string,
        public txtSerEliteContract: string,
        public rtQuoteEU  : string,
        public txtQuoteEU: string,
        public rtPO  : string,
        public txtPO: string,
        public rtLeaseDoc    : string,
        public txtLeaseDoc: string,
        public rtDistInvoice  : string,
        public txtDistInvoice: string,
        public rtSpecialBid  : string,
        public txtSpecialBid: string,
        public rtEUInvoice    :string,
        public txtEUInvoice:string,
        public rtIBMInvoice   :string,
        public txtIBMInvoice:string,
        public rtCoverSheet    : string,
        public txtCoverSheet: string,
        public txtEnduserTr   : string,
        public txtTransactionNum: string,
        public txtRvwMethod   : string,
        public txtRvwType: string,
        public txtChannel   : string,
        public txtLogNo: string,
        public sigtimestamp   : string,
        public signature: string,
        public txtStatus: string,
        public rbEuroUnionFlag: string,
        public dlgLogApprovers: string,
        public lock_status: string,
        public txtAssistAnalyst:string[],
        public txtLAName: string,
        public DocCreatorCanon:string,
        public DocCreator:string,
        public OldForm: string,
        public DeletedBy: string,
        public DeletedOn: string,
        public $REF:string,
        public dtACRBDate:string,
        public txtCPN:string,
        public isvalid:string,
        public txCountry:string,
        public txMajorMarket:string,
        public txGrowthMarket:string,
        public txGeo:string,
        public dtcreated: string,
        public dtmodified: string
    ){}
}