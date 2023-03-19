import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { TestRun } from 'azure-devops-extension-api/Test';
import { TestRunService } from 'src/services/test-run.service';
import { TestRunState } from 'src/state/test-run.state';
import { TestRunStateActions } from 'src/state/test-run.state.actions';
import LinearGradient from 'zrender/lib/graphic/LinearGradient';
import _ from 'lodash';

@Component({
  selector: 'test-stats',
  templateUrl: './test-stats.component.html',
  styleUrls: ['./test-stats.component.scss']
})
export class TestStatsComponent implements OnInit {
  @Input('name')
  public name: string = "";
  testRuns: TestRun[] = [];
  options: any;


  constructor(private store: Store, private testRunService: TestRunService) {


  }

  async ngOnInit() {
    this.store.select(TestRunState.runsForName(this.name))
      .subscribe(testRuns => {
        this.testRuns = testRuns ?? []
        this.setChartData();
      });
  }

  setChartData() {
    const xAxisData = [];
    const failedTests = [];
    const passedTests = [];

    for (let i = 0; i < this.testRuns.length; i++) {
      xAxisData.push(this.testRuns[i].id);

      const failedStats = this.testRuns[i].runStatistics.find(rs => rs.outcome == "Failed");
      const passedStats = this.testRuns[i].runStatistics.find(rs => rs.outcome == "Passed");

      failedTests.push(failedStats?.count ?? 0);
      passedTests.push(passedStats?.count ?? 0);
    }

    this.options = {
      legend: {
        data: ['failed tests', 'passed tests'],
        align: 'left',
      },
      tooltip: {},
      xAxis: {
        data: xAxisData,
        silent: false,
        splitLine: {
          show: false,
        },
      },
      yAxis: {},
      series: [
        {
          name: 'failed tests',
          type: 'bar',
          data: failedTests,
          color: '#E2232C'
        },
        {
          name: 'passed tests',
          type: 'bar',
          data: passedTests,
          color: '#35994E'
        }
      ]

    };

  }

  onChartClick(event: any) {
    console.log('chart event:', event.name);
  }
}
