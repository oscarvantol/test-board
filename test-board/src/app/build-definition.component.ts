import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { BuildDefinition } from 'azure-devops-extension-api/Build';
import { AzureDevOpsService } from '../services/azure-devops.service';
import { TestRunStateActions } from '../state/test-run.state.actions';
import { TestRunState } from '../state/test-run.state';


@Component({
  selector: 'build-definition',
  templateUrl: './build-definition.component.html',
  styleUrls: ['./build-definition.component.scss']
})
export class BuildDefinitionComponent implements OnInit {
  @Input('buildDefinitionId')
  public buildDefinitionId: number = 0;

  public testRunNames: string[] = [];
  public buildDefinition: BuildDefinition | undefined;
  public isFavorite: boolean = false;

  constructor(private store: Store, private azureDevopsService: AzureDevOpsService) {

  }

  async ngOnInit() {
    this.store.select(TestRunState.testRunNames(this.buildDefinitionId))
      .subscribe(testRunNames => {
        this.testRunNames = testRunNames ?? []
      });

      this.store.select(TestRunState.isFavorite(this.buildDefinitionId))
      .subscribe(favorite => {
        this.isFavorite = !!favorite;
      });

    this.buildDefinition = await this.azureDevopsService.getBuildDefinitions(this.buildDefinitionId);

  }
  
  public async toggleFavorite() {
    this.store.dispatch(new TestRunStateActions.SetFavorite(`${this.buildDefinitionId}`, !this.isFavorite));
  }
}
