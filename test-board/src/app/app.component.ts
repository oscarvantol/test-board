import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { TestRun } from 'azure-devops-extension-api/Test';
import { TestRunService } from 'src/services/test-run.service';
import { TestRunState } from 'src/state/test-run.state';
import { TestRunStateActions } from 'src/state/test-run.state.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  testRunNames: string[] = [];

  constructor(private store: Store, private testRunService: TestRunService) {

  }

  async ngOnInit() {
    await this.testRunService.initialize();
    this.store.dispatch(TestRunStateActions.Initialize);

    this.store.select(TestRunState.testRunNames())
      .subscribe(testRunNames => {
        this.testRunNames = testRunNames;
      });
  }
}
