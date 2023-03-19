import { Injectable } from '@angular/core';
import * as SDK from "azure-devops-extension-sdk";
import { getClient, CommonServiceIds, IProjectPageService, IProjectInfo, IExtensionDataService, IExtensionDataManager } from "azure-devops-extension-api";
import { TestRun, TestRestClient } from "azure-devops-extension-api/Test";
import { of } from 'rxjs';

import TestRunsJson from "../assets/data/testruns.json";


@Injectable({
  providedIn: 'root'
})
export class TestRunService {
  private _testClient?: TestRestClient;
  private _project: IProjectInfo | undefined;

  public get online() {
    return document.domain !== "localhost";
  }

  constructor() {
    if (this.online)
      SDK.init();
  }

  public initialize = async () => this.online
    ? this.initOnline()
    : this.initOffline();

  private async initOnline() {
    await SDK.ready();

    const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
    this._testClient = getClient(TestRestClient)
    this._project = await projectService.getProject();

    if (this._project === undefined)
      throw ("Unable to load project");
  }

  private async initOffline() {

  }

  public async getAllTestRuns() {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(toDate.getDate() - 7);

    if (this.online)
      return (await this._testClient?.queryTestRuns(this._project?.id ?? "", fromDate, toDate));
    else
      return of(TestRunsJson.sort() as any as TestRun[]).toPromise();
  }


}