export class PeerReviewResults
{
    constructor(
        
	    public _id:string,
        public _rev:string,
        public Form:string, 
        public txtAssistAnalyst:string[],
        public  DocCreator:string,
        public dlgLogApprovers:string,
        public signature:string, 
        public txtStatus:string,
        public txtPeerReviewer:string,
        public sigtimestamp:string,
        public txtLogNo:string,
        public txtChannel:string,
        public txtRvwType:string,
        public txtRvwMethod:string,
        public txtTransactionNum:string,
        public txtEnduserTr:string,
        public txtCoverSheet:string,
        public txtIBMSpecial:string,
        public txtIBMInvoice:string,
        public txtEUInvoice:string,
        public txBP:string,
        public lock_status:string,
        public txPRStatus:string,
        public rtAttachPR:string,
        public txtLAName:string,
        public txtDistInvoice:string,
        public txtLeaseDoc:string,
        public txtPO:string,
        public txtQuoteDoc:string,
        public txtException:string,
        public txtOtherDocs:string,
        public txtSWAudit:string,
        public OldForm: string,
        public DeletedBy: string,
        public DeletedOn: string,
        public $REF:string,
        public dtACRBDate:string,
        public txtCPN:string,
        public txCountry:string,
        public txMajorMarket:string,
        public txGrowthMarket:string,
        public txGeo:string,
        public dtcreated: string,
        public dtmodified: string,
        public dtPRPerformed: string
    ){}
}