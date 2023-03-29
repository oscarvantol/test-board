import { Injectable } from '@angular/core';
import { Action, createSelector, Selector, State, StateContext } from '@ngxs/store';
import { GitBranchStats, GitRepository, GitPullRequest } from 'azure-devops-extension-api/Git';
import { TestRun, TestRun2 } from 'azure-devops-extension-api/Test';
import { TestRunService } from '../services/test-run.service'
import { TestRunStateActions } from './test-run.state.actions';


export interface TestRunStateModel {
    runs: TestRun[];
    runNames: string[];
}

@State<TestRunStateModel>({
    name: 'repositories',
    defaults: {
        runs: [],
        runNames: []
    }
})
@Injectable()
export class TestRunState {

    constructor(private _testRunService: TestRunService) {

    }
    static testRuns() {
        return createSelector([TestRunState], (state: TestRunStateModel) => {
            return state.runs;
        });
    }

    static testRunNames() {
        return createSelector([TestRunState], (state: TestRunStateModel) => {
            return state.runNames;
        });
    }

    static runsForName(name: string) {
        return createSelector([TestRunState], (state: TestRunStateModel) => {
            return state.runs.filter(run => run.name === name).sort((a, b) => a.id - b.id);
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
        const testRunNames = testRuns.map(tr => tr.name).filter((value, index, array) => array.indexOf(value) === index);

        ctx.patchState({
            runs: testRuns,
            runNames: testRunNames
        });
    }
}