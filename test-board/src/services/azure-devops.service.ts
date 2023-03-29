import { Injectable } from '@angular/core';
import * as SDK from "azure-devops-extension-sdk";
import { getClient, CommonServiceIds, IProjectPageService, IProjectInfo, IExtensionDataService, IExtensionDataManager } from "azure-devops-extension-api";
import { TestRun, TestRestClient } from "azure-devops-extension-api/Test";
import { BuildRestClient, BuildDefinition } from "azure-devops-extension-api/Build";

import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';



@Injectable({
  providedIn: 'root'
})
export class AzureDevOpsService {
  private _testClient?: TestRestClient;
  private _project: IProjectInfo | undefined;
  private _buildClient: BuildRestClient | undefined;

  public get online() {
    return document.domain !== "localhost";
  }

  constructor(private httpClient: HttpClient) {
    if (this.online)
      SDK.init();
  }

  public initialize = async () => this.online
    ? this.initOnline()
    : this.initOffline();

  private async initOnline() {
    await SDK.ready();

    const projectService = await SDK.getService<IProjectPageService>(CommonServiceIds.ProjectPageService);
    this._testClient = getClient(TestRestClient, {});
    this._buildClient = getClient(BuildRestClient, {});


    this._project = await projectService.getProject();

    if (this._project === undefined)
      throw ("Unable to load project");
  }

  private async initOffline() {

  }

  public async getAllTestRuns(top: number, continuationToken?: string) {
    if (this.online) {
      const from = new Date();
      from.setDate(from.getDate() - 7);
      const to = new Date();

      return await this._testClient?.queryTestRuns(this._project?.id ?? "", from, to, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, top, continuationToken);
    }
    else {
      return await this.httpClient.get<TestRun[]>('assets/data/testruns.json').toPromise();
    }
  }

  public async getBuildDefinitions(buildDefinitionId: number) {
    if (this.online) {
      return await this._buildClient?.getDefinition(this._project?.id ?? "", buildDefinitionId);
    } else {
      return { id: buildDefinitionId, name: 'bdNameOffline' } as BuildDefinition;
    }
  }
}