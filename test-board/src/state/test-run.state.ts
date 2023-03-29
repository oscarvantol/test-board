import { Injectable } from '@angular/core';
import { Action, createSelector, Selector, State, StateContext } from '@ngxs/store';
import { GitBranchStats, GitRepository, GitPullRequest } from 'azure-devops-extension-api/Git';
import { TestRun, TestRun2 } from 'azure-devops-extension-api/Test';
import { AzureDevOpsService } from '../services/azure-devops.service'
import { TestRunStateActions } from './test-run.state.actions';


export interface TestRunStateModel {
    runs: TestRun[];

}

@State<TestRunStateModel>({
    name: 'repositories',
    defaults: {
        runs: []
    }
})
@Injectable()
export class TestRunState {

    constructor(private _testRunService: AzureDevOpsService) {

    }

    static testRuns() {
        return createSelector([TestRunState], (state: TestRunStateModel) => {
            return state.runs;
        });
    }

    static buildDefinitions() {
        return createSelector([TestRunState], (state: TestRunStateModel) => {
            return state.runs
                .map(testRun => testRun.buildConfiguration.buildDefinitionId)
                .filter((value, index, array) => array.indexOf(value) === index);
        });
    }

    static testRunNames(buildDefinitionId: number) {
        return createSelector([TestRunState], (state: TestRunStateModel) => {
            return state.runs
                .filter(tr => tr.buildConfiguration.buildDefinitionId == buildDefinitionId)
                .map(tr => tr.name).filter((value, index, array) => array.indexOf(value) === index).sort();
        });
    }

    static runsForTest(buildDefinitionId: number, name: string) {
        return createSelector([TestRunState], (state: TestRunStateModel) => {
            return state.runs.filter(run => 
                run.buildConfiguration.buildDefinitionId == buildDefinitionId && 
                run.name === name)
                .sort((a, b) => a.id - b.id);
        });
    }

    @Action(TestRunStateActions.Initialize)
    async initialize(ctx: StateContext<TestRunStateModel>, _: TestRunStateActions.Initialize) {
        const pageMax: number = 100;
        let requestCount = 0;

        let results = [];
        let continuationToken: string | undefined = undefined;
        do {
            results = await this._testRunService.getAllTestRuns(pageMax, continuationToken) ?? [];
            this.addToState(ctx, results);
            if (results.length == pageMax) {
                continuationToken = this.getContinuationToken(results[pageMax - 1].lastUpdatedDate);
            } else {
                continuationToken = undefined;
            }
        } while (continuationToken !== undefined && requestCount++ < 50)
    }

    getContinuationToken(lastUpdatedDate: Date): string {
        const strVal = lastUpdatedDate.toISOString()
        return strVal.substring(0, strVal.length - 1).replace('T', ' ');
    }

    addToState(ctx: StateContext<TestRunStateModel>, batch: TestRun[]) {
        const currentState = ctx.getState();
        const testRuns = currentState.runs.concat(batch);

        ctx.patchState({
            runs: testRuns
        });
    }
}