import { Injectable } from '@angular/core';
import { Action, createSelector, Selector, State, StateContext } from '@ngxs/store';
import { GitBranchStats, GitRepository, GitPullRequest } from 'azure-devops-extension-api/Git';
import { TestRun } from 'azure-devops-extension-api/Test';
import { TestRunService } from '../services/test-run.service'
import { TestRunStateActions } from './test-run.state.actions';
import _ from 'lodash';

export interface TestRunStateModel {
    runs: Map<string, TestRun[]>;
    runNames: string[];
}

@State<TestRunStateModel>({
    name: 'repositories',
    defaults: {
        runs: new Map<string, TestRun[]>(),
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
            return state.runs.get(name)?.sort((x, y) => x.id < y.id ? 1 : -1).slice(0, 7).sort((x, y) => x.id > y.id ? 1 : -1);
        });
    }

    @Action(TestRunStateActions.Initialize)
    async initialize(ctx: StateContext<TestRunStateModel>, _: TestRunStateActions.Initialize) {
        const testRuns = await this._testRunService.getAllTestRuns() ?? [];
        const testRunNames = testRuns.map(tr => tr.name);
        const runMap = new Map<string, TestRun[]>();
        for (let item in testRunNames) {
            const name = testRunNames[item];
            runMap.set(name, testRuns.filter(tr => tr.name == name));
        }

        ctx.patchState({
            runs: runMap,
            runNames: testRunNames
        });
    }

}