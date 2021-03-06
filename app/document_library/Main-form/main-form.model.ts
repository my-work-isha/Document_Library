export class MainForm {
    constructor(
	    public _id:string,
        public _rev:string,
        public Form:string, 
        public txGeo:string,
        public DocCreator:string,
        public lock_status:string,     
        public DocReaders: string,
        public MainAuthors: string,
	    public txtMainAudit: string,
        public rtTerminationEmails: string,
        public txtTerminationEmails: string,
        public rtMisc: string,
        public txtMisc: string,
        public rtFailure2Respond: string,
        public txtFailure2Respond: string,
        public rtSalesReview: string,
        public txtSalesReview: string,
        public rtRecovery: string,
        public txtRecovery: string,
        public rtEscalationLetter: string,
        public txtEscalationLetter: string,
        public rtBPCRB: string,
        public txtBPCRB: string,
        public rtFSheet: string,
        public txtFSheet:string,
        public rtFinalFindings:string,
        public txtFinalFindings:string,
        public rtInitialFindings:string,
        public txtInitialFindings: string,
        public rtCloseout: string,
        public txtCloseout: string,
        public rtKickoff: string,
        public txtKickoff: string,
        public rtUniverse: string,
        public txtUniverse: string,
        public rtReviewNotif: string,
        public txtReviewNotif: string,
        public rbEuroUnionFlag: string,
        public txtComments: string,
        public txThirdPartyContact: string,
        public lbThirdPartyName: string,
        public txtwbComments: string,
        public rdwbook:string,
        public txtSrcAllegation:string,
        public dlgLogApprovers: string,
        public dtACRBDate: string,
        public dtOrgDate: string,
        public txtRvwMethod:string,
        public txtRvwType:string,
        public txtAssistAnalyst:string[],
        public txtLAName:string,
        public txtChannel:string,
        public txtCPN:string,
        public txtLogNo:string,
        public sigtimestamp:string,
        public signature:string,
        public txtStatus:string,       
        public DocCreatorCanon:string,        
        public OldForm: string,
        public DeletedBy: string,
        public DeletedOn: string,
        public txtAudit: string,
        public acceptFlag: string,
        public rejectFlag:string,
        public docid:string,
        public SaveFlag:string,
        public Appurl:string,
        public isvalid:string,
        public principalname:string,
        public txCountry:string,
        public txMajorMarket:string,
        public txGrowthMarket:string,
        public txtStatusNew:string,
        public txtOtherattachments: string,
        public rtOtherattachments: string,
        public dtcreated: string,
        public dtmodified: string
    ){ }
}