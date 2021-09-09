
//Dynamic Table for About Prior Issues & Bluepages Fetch
$(document).click(function(){
  var i=1;
 $("#add_row1").click(function(){
  $('#addr'+i).html("<td>"+ (i+1) +"</td><td><input name='Log#"+i+"' type='text' class='form-"+

"control input-md'  /> </td><td><input  name='Original BPCRB Date"+i+"' class='form-control input-md'></td><td><input  name='Allegation"+i+"' type='text'"+  

"class='form-control input-md'></td><td><input  name='Decision"+i+"' type='text'"+  

"class='form-control input-md'></td>td><input  name='Asset Recovery"+i+"' type='text'"+  

"class='form-control input-md'></td><td><input  name='Channel"+i+"' type='text'"+  

"class='form-control input-md'></td><td><input  name='Recovery/Revenue"+i+"' type='text'"+  

"class='form-control input-md'></td><td><input  name='Infraction(s)"+i+"' type='text'"+  

"class='form-control input-md'></td><td><input  name='Compliance Analyst Review Lead"+i+"' type='text'"+  

"class='form-control input-md'></td><td><input  name='Compliance Analyst Review Lead"+i+"' type='text'"+  

"class='form-control input-md'></td>");

  $('#tab_logic').append('<tr id="addr'+(i+1)+'"></tr>');
  i++; 
});
 $("#delete_row1").click(function(){
     if(i>1){
     

$("#addr"+(i-1)).html('');
     i--;
     }
 });
 
 $('#collapse4').on('show.bs.collapse', function () {
  var config = {
    //API Key [REQUIRED]
    key: 'bpc_ops,poornimasridhar@in.ibm.com',
 
    //Minimum number of characters which triggers a lookup
    minQueryLength: 2,
 
    //Milliseconds to wait after typing before searching
    searchDelay: 100,
 
    //Milliseconds before giving up on a hung ajax request
    xhrTimeout: 20000,
 
    //An additional header to display on the top of all results
    headerLabel: "Press enter for w3 results",
 
    faces: {
        //Faces is enabled by default so you don't need this
        enabled: true,
         
        //The minimum score required for a face to appear in the results.
        minScore: 0,
         
        //The maximum number of faces which will appear in the dropdown
        maxResults: null,
         
        //The URL for the "show more results" link. ${query} gets replaced with the query.
        moreResultsUrl: 'http://faces.tap.ibm.com#${query}',
         
        //The faces server (don't change this)
        host:   'http://faces.tap.ibm.com',
         
        //The label used for the Faces header
        headerLabel: 'Faces',
 
        //A description shown below the header
        description: "Results from faces",
 
        //Size of small/large image results, in pixels
        largeImageSize: 50,
        smallImageSize: 32,
         
        //The handler for clicking a person in the drop-down.
        onclick: function(person) {
            //Browse the user to the faces result page
           console.log(person);
              //$('txStaffMermberEmail').val(person["notes-id"]);
              $("#txStaffMermberEmail").val(person["notes-id"]);


            //Alternative: opens Connections profile
            //location.href = 'http://w3.ibm.com/connections/profiles/html/profileView.do?email='
            //                + person.email;
             
            //Or, if you return a string, that string will get put inside the text box and the 
            //drop-down will hide itself:
            //Available properties on person object:
            //  - bio (e.g. "Software Engineer - WebSphere")
            //  - building (e.g. "LKG2")
            //  - email
            //  - floor (e.g. "1")
            //  - is-employee (e.g. true)
            //  - location (e.g. "Littleton, MA, US")
            //  - name (e.g. "John Doe")
            //  - notes-id (e.g. "John Q Doe/Westford/IBM")
            //  - office (e.g. "1234B")
            //  - office-phone (e.g. "1-555-555-1234")
            //  - org-title (e.g. "IBM CHQ, BT/IT CIO")
            //  - score (our result score based on the query, higher number means better result)
            //  - uid (our unique ID for this person)
            //
            //return person.email; 
        }
    }
}
  FacesTypeAhead.init(
      document.getElementById('txStaffMermberEmail'), 
      config
      );
});

});  

// Summernote
$(document).on("click",function() {
    $('#summernote').summernote({height:100});
  });

  $(document).on("click",function() {
    $('#rtxAllegation').summernote({height:100});
    $('#rtxAllegation').on('summernote.change', function(we, contents, $editable) {      
      $("#rtxAllegation").val($("#rtxAllegation").summernote("code"));
    });
  } ); 

  $(document).on("click",function() {
    $('#rtxReviewFindings').summernote({height:100});
    $('#rtxReviewFindings').on('summernote.change', function(we, contents, $editable) {      
      $("#rtxReviewFindings").val($("#rtxReviewFindings").summernote("code"));
    });
  } ); 

  $(document).on("click",function() {
    $('#RtxScope').summernote({height:100});
    $('#RtxScope').on('summernote.change', function(we, contents, $editable) {      
      $("#RtxScope").val($("#RtxScope").summernote("code"));
    });
  } );

  $(document).on("click",function() {
    $('#rtxRec').summernote({height:100});
    $('#rtxRec').on('summernote.change', function(we, contents, $editable) {      
      $("#rtxRec").val($("#rtxRec").summernote("code"));
    });
  } ); 

  $(document).on("click",function() {
    $('#rtxRevRec').summernote({height:100});
    $('#rtxRevRec').on('summernote.change', function(we, contents, $editable) {      
      $("#rtxRevRec").val($("#rtxRevRec").summernote("code"));
    });
  } ); 

  $(document).on("click",function() {
    $('#rtActionitems').summernote({height:100});
    $('#rtActionitems').on('summernote.change', function(we, contents, $editable) {      
      $("#rtActionitems").val($("#rtActionitems").summernote("code"));
    });
  } ); 

  

//Datepicker

$(document).ready(function(){
  $( "#dtOrigDate" ).datepicker({
    onClose: function(dateText,inst ){
      console.log("onClose");      
    },
    onSelect: function(dateText,inst ){
      console.log("onSelect");
     
      $("#dtOrigDate").trigger("click");
      $("#dtOrigDate").trigger("blur");      
      var origDate=moment(new Date($( "#dtOrigDate" ).val()));
      var mcDate=moment(new Date($( "#dtMCDate" ).val()));
      $("#nmDaysMCOpen").val(origDate.diff(mcDate,"days"));
      console.log($( "#dtOrigDate" ).val());
    }
  });  
  
});

$("body").on("DOMSubtreeModified", function () {
  $("#dtPRPerformed").datepicker({ dateFormat: 'mm/dd/yy' });
$('#dtPRPerformed').change(function() {
document.getElementById('dtPRPerformed').focus();
})
});

$(document).on("click",function() {
  $( "#datepicker" ).datepicker();
  $( "#datepicker" ).datepicker();
  $("#dtPRPerformed").datepicker();
  $( "#dspAIRevStartDate" ).datepicker();
  $( "#dtFinalBPCRB" ).datepicker();
  $( "#dtACRBTermDt" ).datepicker();
  $( "#dtPayDue_1" ).datepicker();
  $( "#dtRecovInv_1" ).datepicker();
  $( "#dtBalPaid_1" ).datepicker();
  $( "#dtInvoice" ).datepicker({
    onSelect: function(dateText,inst ){
      var values = $("input.dtInvoiceClass")
          .map(function(){return $(this).val();}).get(); 
     $("#dtRecentInvoicepaid").val(max_date(values));
     }
  });
  $( "#dtPayDue" ).datepicker();
  $( "#dtRecovInv" ).datepicker();
  $( "#dtBalPaid" ).datepicker();
  $( "#dtAIRevStartDate" ).datepicker();
}); 
  
// Default screen Datepicker fields//

$(document).on("click",function() {
  $( "#sigtimestamp" ).datepicker();
  $( "#dspOrigDate" ).datepicker();
  $( "#dtMCDate" ).datepicker({
    onSelect: function(dateText,inst ){
      console.log("onSelect");
      $("#dtMCDate").trigger("click");
      $("#dtMCDate").trigger("blur");
      var mcDate=moment(new Date($( "#dtMCDate" ).val()));
      var origDate=moment(new Date($( "#dtOrigDate" ).val()));
      $("#nmDaysMCOpen").val(origDate.diff(mcDate,"days"));

    }
  });
  $( "#dtMCRDate" ).datepicker();
  $( "#dtReviewDt" ).datepicker();
  $( "#dtDistributeStaffDt" ).datepicker();
  $( "#dtAnalystResolDt" ).datepicker();
  $( "#dtExecLtr" ).datepicker();
  $( "#dtTargetAnnounce_Chk3" ).datepicker();
  $( "#dtAnnounce_Chk3" ).datepicker();
  $( "#dtAnnounce_Chk3" ).datepicker();
  $( "#dspAnnounce_Chk3" ).datepicker();
  $( "#dtUserAnnounce_Chk3" ).datepicker();
  $( "#dtKickCall_Chk4" ).datepicker();
  $( "#dspKickCall_Chk4" ).datepicker();
  $( "#dtUserKickCall_Chk4" ).datepicker();
  $( "#dtDataReq_Chk5" ).datepicker();
  $( "#dspDataReq_Chk5" ).datepicker();
  $( "#dtUserDataReq_Chk5" ).datepicker();
  $( "#dtPartnerRes_Chk6" ).datepicker();
  $( "#dspPartnerRes_Chk6" ).datepicker();
  $( "#dtUserPartnerRes_Chk6" ).datepicker();
  $( "#dtPlannedRvwDt" ).datepicker();
  $( "#dtReview_Chk7" ).datepicker();
  $( "#dtUserReview_Chk7" ).datepicker();
  $( "#dtEstConducted_Chk8" ).datepicker();
  $( "#dtIntialFind_Chk8" ).datepicker();
  $( "#dspIntialFind_Chk8" ).datepicker();
  $( "#dtUserIntialFind_Chk8" ).datepicker();
  $( "#dtFinalPartnerRes_Chk9" ).datepicker();
  $( "#dspFinalPartnerRes_Chk9" ).datepicker();
  $( "#dtUserFinalPartnerRes_Chk9" ).datepicker();
  $( "#dtMgmtAppr_Chk10" ).datepicker();
  $( "#dtUserMgmtAppr_Chk10" ).datepicker();
  $( "#dtTargetACRB" ).datepicker();
  $( "#dtBPCRB_Chk11" ).datepicker();
  $( "#dtUserBPCRB_Chk11" ).datepicker();
  $( "#dtDecision_Chk12" ).datepicker();
  $( "#dtUserDecision_Chk12" ).datepicker();
  $( "#dtCertify_Chk12a" ).datepicker();
  $( "#dspCertify_Chk12a" ).datepicker();
  $( "#dtUserCertifyDate_Chk12a" ).datepicker();
  $( "#dtClose_Chk13" ).datepicker();
  $( "#dspClose_Chk13" ).datepicker();
  $( "#dtUserClose_Chk13" ).datepicker();
  $( "#dtRDLFiled_Chk14" ).datepicker();
  $( "#dspRDLFiled_Chk14" ).datepicker();
  $( "#dtRDL_Chk14" ).datepicker();
  $( "#TAnnDate" ).datepicker();
  $( "#DAnnDate" ).datepicker();
  $( "#DkickDate" ).datepicker();
  $( "#DDataDate" ).datepicker();
  $( "#DPartnerDate" ).datepicker();
  $( "#DtargetDate" ).datepicker();
  $( "#DreviewDate" ).datepicker();
  $( "#DconductDate" ).datepicker();
  $( "#DfindingsDate" ).datepicker();
  $( "#DFpartnerDate" ).datepicker();
  $( "#DmanagementDate" ).datepicker();
	$( "#DboardDate" ).datepicker();
	$( "#DbpcrbDate" ).datepicker();
  $( "#DdecisionDate" ).datepicker();
  $( "#DcertifyDate" ).datepicker();
  $( "#DcloseDate" ).datepicker();
  $( "#DrdlDate" ).datepicker();
  $( "#dtAllegation" ).datepicker();

  
});     
  
function max_date(all_dates) {
  var max_dt = all_dates[0],
    max_dtObj = new Date(all_dates[0]);
  all_dates.forEach(function(dt, index)
    {
    if ( new Date( dt ) > max_dtObj)
    {
    max_dt = dt;
    max_dtObj = new Date(dt);
    }
    });
   return max_dt;
    } 
  
  // Code for Dynamic Invoice 
  
  $(document).on("click",function(){
    
    $(document).on("click",function() {
      $( "#dtPayDue_1" ).datepicker();
    } );
    
    $(document).on("click",function() {
      $( "#dtRecovInv_1" ).datepicker();
    } );

    $(document).on("click",function() {
      $( "#dtBalPaid_1" ).datepicker();
    } );

    $(document).on("click",function() {
      $( "#dtInvoice" ).datepicker({
        onSelect: function(dateText,inst ){
          var values = $("input.dtInvoiceClass")
              .map(function(){return $(this).val();}).get(); 
         $("#dtRecentInvoicepaid").val(max_date(values));
         }
      });
    } );

      var k=2;    //changed from k=1 to k=2
      $("#add_row").click(function(){
        
      //in below line changed from k to (k-1)
      $('#invoice_div_'+(k-1)).html("<hr><h4>Invoice "+k+"</h4><div class='row'>"+   
     "<div class='col-md-6'>"+                    
     "<div class='form-group'>"+ 
        
       "<label for='dtPayDue_"+k+"'>Payment Due by :</label>"+
       "<input type='text' class='form-control' id='dtPayDue_"+k+"' name='dtPayDue_"+k+"' [(ngModel)]='model.dtPayDue_"+k+"'>"+
       "<img src='assets/favicon.ico' id='Calendar_img' height='30' width='30'>"+
       "</div>"+
      "</div>"+
       "<div class='col-md-6'>"+
        "<div class='form-group'>"+
         "<label for='dtRecovInv_"+k+"'>Date of Recovery Invoice to Business Partner :</label>"+
         "<input type='text' class='form-control' id='dtRecovInv_"+k+"' name='dtRecovInv_"+k+"' [(ngModel)]='model.dtRecovInv_"+k+"'>"+"<img src='assets/favicon.ico' id='Calendar_img' height='30' width='30'>"+
         "</div>"+
       "</div>"+   
  "</div>"+
  "<div class='row'>"+ 
    "<div class='col-md-6'>"+                    
    "<div class='form-group'>"+                        
      "<label for='txInvoiceNo_"+k+"'>Invoice Number :</label>"+
      "<input type='text' class='form-control' id='txInvoiceNo_"+k+"' name='txInvoiceNo_"+k+"' [(ngModel)]='model.txInvoiceNo_"+k+"'>"+
      "</div>"+
     "</div>"+
      "<div class='col-md-6'>"+
       "<div class='form-group'>"+
        "<label for='dtBalPaid_"+k+"'>Date Balance Paid in Full :</label>"+
        "<input type='text' class='form-control' id='dtBalPaid_"+k+"' name='dtBalPaid_"+k+"' [(ngModel)]='model.dtBalPaid_"+k+"'>"+"<img src='assets/favicon.ico' id='Calendar_img' height='30' width='30'>"+
        "</div>"+
      "</div>"+   
  "</div>"+
  "<div class='row'>"+ 
    "<div class='col-md-6'>"+                    
    "<div class='form-group'>"+                        
      "<label for='txtLocalCurTypeRate_"+k+"'>Local Currency, Type, and Exchange Rate :</label>"+
      "<input type='text' class='form-control' id='txtLocalCurTypeRate_"+k+"' name='txtLocalCurTypeRate_"+k+"' [(ngModel)]='model.txtLocalCurTypeRate_"+k+"'>"+
      "</div>"+
     "</div>"+
      "<div class='col-md-6'>"+
       "<div class='form-group'>"+
        "<label for='dtInvoice_"+k+"'>Invoice Date :</label>"+
        "<input type='text' class='form-control dtInvoiceClass' id='dtInvoice_"+k+"' name='dtInvoice_"+k+"' [(ngModel)]='model.dtInvoice["+k+"]'>"+"<img src='assets/favicon.ico' id='Calendar_img' height='30' width='30'>"+
        "</div>"+
      "</div>"+
  "</div>"+
  "<div class='row'>"+ 
    "<div class='col-md-6'>"+                    
    "<div class='form-group'>"+                        
      "<label for='nmInvoiceAmtDollars_"+k+"'>Amount of Invoice in US dollars :</label>"+
      "<input type='text' class='form-control' id='nmInvoiceAmtDollars_"+k+"' name='nmInvoiceAmtDollars_"+k+"' [(ngModel)]='model.nmInvoiceAmtDollars_"+k+"'>"+
      "</div>"+
     "</div>"+
      "<div class='col-md-6'>"+
       "<div class='form-group'>"+
        "<label for='nmDaysOS_"+k+"'>Days Outstanding :</label>"+
        "<input type='text' class='form-control' id='nmDaysOS_"+k+"' name='nmDaysOS_"+k+"' [(ngModel)]='model.nmDaysOS_"+k+"'>"+
        "</div>"+
      "</div>"+   
   
    "<div class='col-md-6'>"+
      "<div class='form-group'>"+
      "<label for='txtInvoiceComments_"+k+"'>Comments "+k+"</label>"+
       "<input type='Text' class='form-control' id='txtInvoiceComments_"+k+"' name='txtInvoiceComments_"+k+"' [(ngModel)]='model.txtInvoiceComments_"+k+"'>"+
       "</div>"+
     "</div>"+
  "</div>");
  
      $('#tab_userlogicw').append('<div id="invoice_div_'+(k+1)+'"></div>');
      $( "#dtPayDue_"+k ).datepicker(); 
      $( "#dtRecovInv_"+k ).datepicker(); 
      $( "#dtBalPaid_"+k ).datepicker(); 
      $( "#dtInvoice_"+k ).datepicker({
        onSelect: function(dateText,inst ){
          var values = $("input.dtInvoiceClass")
              .map(function(){return $(this).val();}).get(); 
         $("#dtRecentInvoicepaid").val(max_date(values));
         }
      }); 

      k++; 
      });
      
      
      $("#delete_row").click(function(){
       if(k>1){
        $("#invoice_div_"+(k-1)).html('');
         k--;
      }
      });
    });


  //Dynamic Table for About User data in User Data Section

    $(document).on("click",function(){ 
    var j=1;
    $("#add_Userrow").click(function(){
    $('#addrow'+j).html("<td><input name='Name"+j+"' type='text'"+
    
    "class='form-control input-md'></td><td><input name='City"+j+"' type='text'"+
    
    "class='form-control input-md'></td><td><input name='State/Province"+j+"' type='text'"+
            
    "class='form-control input-md'></td><td><input  name='Country"+j+"' type='text'"+
    
    "class='form-control input-md'></td>");
    
    
    
    $('#tab_userlogic').append('<tr id="addrow'+(j+1)+'"></tr>');
    j++; 
    });
    $("#delete_Userrow").click(function(){
       if(j>1){
       
    
    $("#addrow"+(j-1)).html('');
       j--;
       }
    });
    
    });

    /*$(document).ready(function(){
      var j=1;
      $("#add_Userrow").click(function(){
      $('#addrow'+j).html("<td><input name='Name"+j+"' type='text'"+
  
      "class='form-control input-md'></td><td><input name='City"+j+"' type='text'"+
  
      "class='form-control input-md'></td><td><select class='form-control' name='txEUserState"+j+"' [(ngModel)]='model.txEUserState"+j+"'>"+ 
                                        "<option value=''>Select the State/Province</option>"+                                                
                                        "<option *ngFor='let kwstate of kwstates' value= {{kwstate}} >"+
                                          "{{kwstate}}"+
                                         "</option>"+ 
                                       "</select></td><td><select class='form-control' name='txEUserCountry"+j+"' [(ngModel)]='model.txEUserCountry"+j+"'>"+ 
                                        "<option value=''>Select the Country</option>"+                                                
                                        "<option *ngFor='let kwcountry of kwcountrys' value= {{kwcountry}} >"+
                                          "{{kwcountry}}"+
                                         "</option>"+ 
                                       "</select></td>");
  
  
  
      $('#tab_userlogic').append('<tr id="addrow'+(j+1)+'"></tr>');
      j++; 
      });
      $("#delete_Userrow").click(function(){
         if(j>1){
  
  
      $("#addrow"+(j-1)).html('');
         j--;
         }
      });
  
      });*/ 
      

    // Compute date for "Length of Review in Days" field

   $(document).on("click",function() {
      
    $( "#dtOrigDate,#dtAIRevStartDate" ).datepicker({
    changeMonth: true,
    changeYear: true,
    firstDay: 1,
    dateFormat: 'mm/dd/yy',
    })
    
    $( "#dtOrigDate" ).datepicker({ dateFormat: 'mm-dd-yy' });
    $( "#dtAIRevStartDate" ).datepicker({ dateFormat: 'mm-dd-yy' });
    
    $('#dtAIRevStartDate').change(function() {
        var start = $('#dtOrigDate').datepicker('getDate');
        var end   = $('#dtAIRevStartDate').datepicker('getDate');
    
    if (end<start) {
        var TtxReviewLengthDays   = (start - end)/1000/60/60/24;
    $('#TtxReviewLengthDays').val(TtxReviewLengthDays);
    }
    else {
      
      var TtxReviewLengthDays   = (end - start)/1000/60/60/24;
      $('#TtxReviewLengthDays').val(TtxReviewLengthDays);
     }
    }); 
    });

//attachment delete method 
/* function fileDelete( docid, key, revid, canDeleteFiles) {
  if (canDeleteFiles == "Yes") {
    $.ajax({
      url: 'api/getrevIDbydocID',
      type: 'GET',
      data: { "docid": docid }, 
      success: function(response) {
        let revisionID = response._rev;
        $.ajax({
          url: '/api/deleteAttachedFile',
          type: 'POST',
          data: { "docid":docid, "attName": key, "revid": revisionID} ,
          success: function (response) {
            if(response.file) {
              document.getElementById('del_'+response.file).remove();
              document.getElementById('att_'+response.file).remove();
            }
            alert(response.status);
          },
          error: function () {
            console.error("Error while deleting attachment: " + error);
            alert(response.status);
          }
        });
      }, 
      error: function() {
        console.error('Error while getting revID by docID: ' + error);
        alert('Error while getting revID by docID: ' + error);
      }
    })
  } else {
    alert('You are not authorized to delete files!!!');
  }
}
 */

 //DB2 attachment delete method 
function deleteFile(form, docid, fileName, canDeleteFiles) {
  if (canDeleteFiles == "Yes") {
    if(confirm("Do you want to delete the file?")) {
      $.ajax({
        url: '/api/deleteFileFromDB2',
        type: 'POST',
        data: { "form": form, "docid": docid },
        success: function (response) {
          if (response.file) {
            document.getElementById('del_' + response.file).remove();
            document.getElementById('att_' + response.file).remove();
          }
          alert(response.status);

          // empty the appropriate div tag from which the attachment is deleted
          var divID = "#" + _.toString(fileName.split("_")[0]) + "File";
          $(divID).empty();

          // remove the attachment name from the list in the appropriate div tag
          $.ajax({
            url:'/api/getAttachedFileListFromDB2',
            type: 'GET',
            data: { "form": form, id: _.split(docid, '-files-')[0]},
            success: function(res) {
              _.forEach(res, function (row) {
                var fileN = decodeURIComponent(row.FILENAME.replace("%", "%25"));
                var fileID = row.FILE_ID;
                var fieldId = fileN.split("_")[0];
                var fileid = fileN.replace(/[)(]\s+/g, '');
                if(fieldId == _.toString(fileName.split("_")[0])) {
                  if((_.startsWith(fileN,"rtOther")) && (_.startsWith(form,"frmMain")))
                  $("#" + fieldId + "File").append("<div><a id='att_" + fileid + "' class='file' href='/api/getFileFromDB2/frmMain_Other/" + fileID + "/" + fileN.replace("%", "%25") + "'>" + fileN + "</a><a id='del_" + fileid + "'class='delete' onclick='deleteFile(\"frmMain_Other\",\"" + fileID + "\",\"" + fileN.replace("%", "%25") + "\",\"" + canDeleteFiles + "\")'> x</a></div>");
                  else
                  $("#" + fieldId + "File").append("<div><a id='att_" + fileid + "' class='file' href='/api/getFileFromDB2/" + form + "/" + fileID + "/" + fileN.replace("%", "%25") + "'>" + fileN + "</a><a id='del_" + fileid + "'class='delete' onclick='deleteFile(\"" + form + "\",\"" + fileID + "\",\"" + fileN.replace("%", "%25") + "\",\"" + canDeleteFiles + "\")'> x</a></div>");
                }
              })
            },
            err: function () {
              console.error("Error while refreshing the file list div tag: " + error);
              alert(res.status);
            }
          })
        },
        error: function () {
          console.error("Error while deleting attachment: " + error);
          alert(response.status);
        }
      });
    }
  } else {
    alert('You are not authorized to delete files!!!');
  }
}

function addAffix(id)
{
//  $(id).css("top","50px");

  $(id).css("z-index",1000);
  $(id).css("width",$(id).outerWidth());
  $(id).css("height","70px") 
  $(id).css("margin-top","-10px") 

   $(id).affix({ offset:20});
}


