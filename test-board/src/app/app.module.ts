import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxsModule } from '@ngxs/store';
import { TestRunState } from '../state/test-run.state';
import { AppComponent } from './app.component';
import { TestStatsComponent } from './test-stats.component';
import { NgxEchartsModule } from 'ngx-echarts';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    TestStatsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    NgxsModule.forRoot([TestRunState], {
      developmentMode: true
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
