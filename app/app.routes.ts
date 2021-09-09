import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule,RouterLinkActive } from '@angular/router';
import { WelcomeComponent } from './bpc/welcome/welcome.component';

// Route Configuration
export const routes: Routes = [
  //{ path: '', redirectTo: "welcome", pathMatch: "full"},
  { path: '', redirectTo: "Myreviews/Myreviews", pathMatch: "full" },
  { path: 'welcome', component: WelcomeComponent},
  { path: 'mainform', loadChildren: './bpc/Main-form/main-form.module#MainFormModule'},
  { path: 'mainform/:id', loadChildren: './bpc/Main-form/main-form.module#MainFormModule'},
  { path: 'trashdocuments', loadChildren: './bpc/trashdocuments/trashdocuments.module#TrashdocumentsModule'},
  { path: 'maintenanceview', loadChildren: './bpc/maintenance-view/maintenance-view.module#MaintenanceViewModule'},
  { path: 'profileform', loadChildren: './bpc/profile-form/profile-form.module#ProfileFormModule'},
  { path: 'ByLogNumberUnLocked/:geo', loadChildren: './bpc/catviews/catviews.module#CatviewsModule'},
  { path: 'ByLogNumberLocked/:geo', loadChildren: './bpc/catviews/catviews.module#CatviewsModule'},
  { path: 'ByLeadAnalystUnLocked/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},
  { path: 'ByLeadAnalystLocked/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},
  { path: 'ByAssistAnalyst/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},
  { path: 'ByBusinessPartner/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},
  { path: 'ByAuthor/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},
  { path: 'ByStatus/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},
  { path: 'ByBPCRPDate/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},
  { path: 'ByChannel/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},
  { path: 'ByReviewer/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},
  { path: 'PeerReviewResults/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},
  { path: 'fixedKeyword', loadChildren: './bpc/fixed-keyword/fixed-keyword.module#FixedKeywordModule'},
  { path: 'peerreviewresults', loadChildren: './bpc/peer-review-results/peer-review-results.module#PeerReviewResultsModule'},
  
  //for AM view
  { path: 'MyreviewsAM/:geo', loadChildren: './bpc/catviews/catviews.module#CatviewsModule'},
  { path: 'ByLogNumberUnLockedAM/:geo', loadChildren: './bpc/catviews/catviews.module#CatviewsModule'},
  { path: 'ByLogNumberLockedAM/:geo', loadChildren: './bpc/catviews/catviews.module#CatviewsModule'},
  { path: 'ByLeadAnalystUnLockedAM/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},
  { path: 'ByLeadAnalystLockedAM/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},
  { path: 'ByBusinessPartnerAM/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},

  
  //for AP view
  { path: 'MyreviewsAP/:geo', loadChildren: './bpc/catviews/catviews.module#CatviewsModule'},
  { path: 'ByLogNumberUnLockedAP/:geo', loadChildren: './bpc/catviews/catviews.module#CatviewsModule'},
  { path: 'ByLogNumberLockedAP/:geo', loadChildren: './bpc/catviews/catviews.module#CatviewsModule'},
  { path: 'ByLeadAnalystUnLockedAP/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},
  { path: 'ByLeadAnalystLockedAP/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},
  { path: 'ByBusinessPartnerAP/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},

   //for EMEA view
   { path: 'MyreviewsEMEA/:geo', loadChildren: './bpc/catviews/catviews.module#CatviewsModule'},
   { path: 'ByLogNumberUnLockedEMEA/:geo', loadChildren: './bpc/catviews/catviews.module#CatviewsModule'},
   { path: 'ByLogNumberLockedEMEA/:geo', loadChildren: './bpc/catviews/catviews.module#CatviewsModule'},
   { path: 'ByLeadAnalystUnLockedEMEA/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},
   { path: 'ByLeadAnalystLockedEMEA/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},
   { path: 'ByBusinessPartnerEMEA/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},

    //for LA view
  { path: 'MyreviewsLA/:geo', loadChildren: './bpc/catviews/catviews.module#CatviewsModule'},
  { path: 'ByLogNumberUnLockedLA/:geo', loadChildren: './bpc/catviews/catviews.module#CatviewsModule'},
  { path: 'ByLogNumberLockedLA/:geo', loadChildren: './bpc/catviews/catviews.module#CatviewsModule'},
  { path: 'ByLeadAnalystUnLockedLA/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},
  { path: 'ByLeadAnalystLockedLA/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},
  { path: 'ByBusinessPartnerLA/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},

   //for Japan view
   { path: 'MyreviewsJAPAN/:geo', loadChildren: './bpc/catviews/catviews.module#CatviewsModule'},
   { path: 'ByLogNumberUnLockedJAPAN/:geo', loadChildren: './bpc/catviews/catviews.module#CatviewsModule'},
   { path: 'ByLogNumberLockedJAPAN/:geo', loadChildren: './bpc/catviews/catviews.module#CatviewsModule'},
   { path: 'ByLeadAnalystUnLockedJAPAN/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},
   { path: 'ByLeadAnalystLockedJAPAN/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},
   { path: 'ByBusinessPartnerJAPAN/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},
  
  //for GCG view
  { path: 'MyreviewsGCG/:geo', loadChildren: './bpc/catviews/catviews.module#CatviewsModule'},    
  { path: 'ByLogNumberUnLockedGCG/:geo', loadChildren: './bpc/catviews/catviews.module#CatviewsModule'},
  { path: 'ByLogNumberLockedGCG/:geo', loadChildren: './bpc/catviews/catviews.module#CatviewsModule'},
  { path: 'ByLeadAnalystUnLockedGCG/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},
  { path: 'ByLeadAnalystLockedGCG/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},
  { path: 'ByBusinessPartnerGCG/:geo', loadChildren: './bpc/allviews/allviews.module#AllviewsModule'},

  { path: 'peerreviewresults/:task', loadChildren: './bpc/peer-review-results/peer-review-results.module#PeerReviewResultsModule'},
  { path: 'peerreviewdoc/:id', loadChildren: './bpc/peer-review-results/peer-review-results.module#PeerReviewResultsModule'},
 
  { path: 'swtransaction/:task', loadChildren: './bpc/sw-transaction/sw-transaction.module#SwTransactionModule'},
  { path: 'swtransactiondoc/:id', loadChildren: './bpc/sw-transaction/sw-transaction.module#SwTransactionModule'},
 
  { path: 'allegation/:task', loadChildren: './bpc/allegation-results/allegation-results.module#AllegationResultsModule'},
  { path: 'allegationdoc/:id', loadChildren: './bpc/allegation-results/allegation-results.module#AllegationResultsModule'},
  
  { path: 'chwtrans/:task', loadChildren: './bpc/chw-trans/chw-trans.module#ChwTransModule'},
  { path: 'chwtransdoc/:id', loadChildren: './bpc/chw-trans/chw-trans.module#ChwTransModule'},

  { path: 'itsmtstrans/:task',loadChildren: './bpc/itsmts-trans/itsmts-trans.module#ItsmtsTransModule'},
  { path: 'itsmtstransdoc/:id',loadChildren: './bpc/itsmts-trans/itsmts-trans.module#ItsmtsTransModule'},

  { path: 'chwswgtrans/:task', loadChildren: './bpc/chwswg-trans/chwswg-trans.module#ChwswgTransModule'},
  { path: 'chwswgtransdoc/:id', loadChildren: './bpc/chwswg-trans/chwswg-trans.module#ChwswgTransModule'},

  { path: 'cfmbgftrans/:task', loadChildren: './bpc/cfmbgf-trans/cfmbgf-trans.module#CfmbgfTransModule'},
  { path: 'cfmbgftransdoc/:id', loadChildren: './bpc/cfmbgf-trans/cfmbgf-trans.module#CfmbgfTransModule'},

  { path: 'misc/:task', loadChildren: './bpc/misc-documents/misc-documents.module#MiscDocumentsModule'},
  { path: 'miscdoc/:id', loadChildren: './bpc/misc-documents/misc-documents.module#MiscDocumentsModule'},

  { path: 'report/:type', loadChildren: './bpc/csvexport/csvexport.module#CsvexportModule'},
  { path: 'Myreviews/:geo', loadChildren: './bpc/catviews/catviews.module#CatviewsModule'}
];

export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
