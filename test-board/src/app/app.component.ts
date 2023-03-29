import { Component, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';

import { AzureDevOpsService } from 'src/services/azure-devops.service';
import { TestRunState } from 'src/state/test-run.state';
import { TestRunStateActions } from 'src/state/test-run.state.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  buildDefinitionIds: number[] = [];

  constructor(private store: Store, private testRunService: AzureDevOpsService) {

  }

  async ngOnInit() {
    await this.testRunService.initialize();
    this.store.dispatch(TestRunStateActions.Initialize);

    this.store.select(TestRunState.buildDefinitions())
      .subscribe(buildDefinitions => {
        this.buildDefinitionIds = buildDefinitions;
      });
  }
}
