let async = require('async');

import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { IqsClientService } from './iqs-client.service';
import { CookieService } from 'ngx-cookie-service';
import { ThrowStmt } from '@angular/compiler';
import { from } from 'rxjs';

const SESSIO_ID_COOKIE_NAME = 'x-session-id'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  private login = 'krdima92@gmail.com';
  private password = '123456';
  // private userId = 'cd65c2023be34e84b2e9529264d17d21'; // stage
  private userId = '796a7aff0e344091a2279a1456ed7e74'; // prod

  // STAGE SITES:
  //private orgId = 'a4ad733934a444d5b6ca77445d17d7c2'; // test organization 2
  // private orgId = '9cfaf79bc95b4a9e912314eb3db7a4ba'; // demo mineorganization
  // private orgId = '91a809841410417f8e9c38745d8ea511'; // moscow sokol
  // private orgId = '091fa3046e5641c79183ebbe9f71fb9c'; // enkost moscow
  // private orgId = '16eb6cd32131480fa3c25e2f85e5fec4'; // donetsk main

  // PROD SITE:
  private orgId = '3bdd0757ac2b416093fa87f92df31bd6'; // enkost moscow
  // private orgId = 'b6becc564c2a4175aa7f4533713572f9'; // ros prom eco
  // private orgId = '89efee4152f74944932b1aa9ef78dedd'; // en demo

  private session: any;
  private objectData: any;
  private objects: any;
  public devices: any;
  public selectedDevice = null;

  // date: Date = new Date(new Date().setDate(21)); 
  public date: Date = new Date();
  public displayedDate: Date;
  public title = 'iqs-sensor-data';

  public sensorData = [];

  constructor(
    private iqsClientService: IqsClientService,
    private _cookieService: CookieService
  ) {

  }

  private ISODateToReadableLocalTime(date: string): string {
    return new Date(date).toLocaleTimeString()
  }

  private signIn(callback: any) {
    // Signin
    this.iqsClientService.signin(this.login, this.password).subscribe((res) => {
      this.session = res;
      this._cookieService.set(SESSIO_ID_COOKIE_NAME, this.session.id);
      callback();
    });
  }

  ngOnInit() {
    async.series([
      (callback) => {
        if (this._cookieService.get(SESSIO_ID_COOKIE_NAME)) {
          this.session = {
            id: this._cookieService.get(SESSIO_ID_COOKIE_NAME)
          };
          callback();
        } else {
          this.signIn(callback);
        }
      },
      (callback) => {
        // Get objects
        this.iqsClientService.getObjects(this.orgId, this.session.id).subscribe(
          (res: any) => {
            this.objects = res.data;
            callback();
          },
          (err) => {
            console.log(err);
            // if cookie store deleted session id, then create new session
            if (err.status == 401 || err.status == 440) {
              async.series([
                (callback) => {
                  this.signIn(callback);
                },
                (callback) => {
                  this.ngOnInit();
                  callback();
                }
              ]);
            }
          }
        );
      },
      (callback) => {
        // Get devices
        this.iqsClientService.getDevices(this.orgId, this.session.id).subscribe(
          (res: any) => {
            this.devices = [];
            res.data.forEach(data => {
              if (data.object_id) {
                let customData = data;
                // customData.name = data.label ? data.label : data.udi;
                let objAttachedToSelectedDevice = this.objects.filter(obj => {
                  return obj.device_id === data.id;
                });
                customData.name = objAttachedToSelectedDevice[0].name;
                this.devices.push(customData)
              }
            });
            if (!this.selectedDevice) {
              this.selectedDevice = this.devices[0];
            }
            callback();
          },
          (err) => {
            console.log(err);
            // if cookie store deleted session id, then create new session
            if (err.status == 401) {
              async.series([
                (callback) => {
                  this.signIn(callback);
                },
                (callback) => {
                  this.ngOnInit();
                  callback();
                }
              ]);
            }
          });
      },
      (callback) => {
        this.loadSensorData(callback);
      }
    ]);
  }

  ngOnDestroy() {
    this.iqsClientService.deleteSession(this.userId, this.session.id).subscribe((res) => {
    })
  }

  loadSensorData(callback) {
    async.series([
      (callback) => {

        this.iqsClientService.getDailyObjectDataDevice(this.orgId, this.selectedDevice.id, this.session.id).subscribe(
          (res) => {
            this.objectData = res;
            callback();
          },
          (err) => {
            console.log(err);
            // if cookie store deleted session id, then create new session
            if (err.status == 401) {
              async.series([
                (callback) => {
                  this.signIn(callback);
                },
                (callback) => {
                  this.ngOnInit();
                  callback();
                }
              ]);
            }
          });
      },
      (callback) => {
        this.sensorData = [];
        // Save current data to sensorData array
        if (this.objectData) {
          if (this.objectData.data[0]) {

            // Get last value
            let time = this.objectData.data[0].extra.time;
            let currentParams = [];
            if (this.objectData.data[0].extra.params) {
              this.objectData.data[0].extra.params.forEach(param => {
                currentParams.push(param);
              });

              // Add data to result array
              if (currentParams) {
                currentParams.forEach(param => {
                  this.sensorData.push({ date: time, time: this.ISODateToReadableLocalTime(time), sensor: param.id, value: param.val })
                });
              }
            }
          }
        }

        this.sensorData.sort((a, b) => {
          return a.sensor - b.sensor;
        });

        this.displayedDate = new Date(this.sensorData[0].date);

        callback();
      }
    ], () => {
      if (callback) callback();
    });

    setTimeout(() => {
      async.series([
        (callback) => {
          this.loadSensorData(callback);
        }]);

    }, 20000);
  }

  //**
  //  * 
  //  * @param fromTime start time
  //  * @param toTime end time
  //  * @param period set in hours. this is the length of one data part 
  //  */
  createRequests(startTime: Date, endTime: Date, period: number): any[] {
    let arrayOfCallbacks = [];

    let hoursDiff = Math.round( (endTime.getTime() - startTime.getTime()) / 36e5 );
    // console.log("!!",startTime, endTime, hoursDiff);

    for (let i = 0; i < hoursDiff / period; i++) {
      arrayOfCallbacks.push((callback) => {
        let fromTime = new Date(new Date(startTime).setHours(startTime.getHours() + (period * i )));
        let toTime = new Date(new Date(startTime).setHours(startTime.getHours() + (period * (i + 1))));
        fromTime = new Date(new Date(fromTime).setMilliseconds(fromTime.getMilliseconds() + 1 ));
        // console.log("!!", i, fromTime, toTime)
        this.iqsClientService.getObjectDataObject(this.orgId, this.selectedDevice.object_id, this.session.id, fromTime, toTime).subscribe((res) => {
          // console.log("!!!", fromTime, toTime, res);
          callback(null, res);
        });
      });
    }

    return arrayOfCallbacks;
  }
  

  saveCsv() {
    console.log('saving CSV...', new Date());

    let objectDataFiveDays: any;
    let startTime = new Date(new Date(new Date().setDate(this.date.getDate() - 4)).setHours(0, 0, 0, 0));
    let endTime = new Date((this.date).setHours(23, 59, 59, 999));
    let period = 2 // hours

    async.parallel(this.createRequests(startTime, endTime, period),
      (err, results) => {
        // console.log("done", results)

        objectDataFiveDays = { total: 0, data: [] }

        let count = 0;
        let historicalSensorData = [];

        results.forEach(i => {
          objectDataFiveDays.total += i.total;
          if (i.total > 0) {
            i.data.forEach(d => {
              objectDataFiveDays.data.push(d);
            });
          }
        });

        // console.log(objectDataFiveDays);

        if (objectDataFiveDays.data) {
          objectDataFiveDays.data.forEach(data => {
            count += data.values.length;
            data.values.forEach(values => {
              values.params.forEach(params => {
                historicalSensorData.push({ time: new Date(values.time), sensor: params.id, value: params.val * 10 })
              });
            });
          });

          // sort historicalSensorData
          historicalSensorData.sort((a, b) => {
            if (a.time > b.time) return 1;
            if (a.time < b.time) return -1;
            if (a.time == b.time) {
              if (a.sensor > b.sensor) return 1;
              if (a.sensor < b.sensor) return -1;
            }
            return 0;
          });
        }

        // create the csv
        const headers = ['Время', 'Датчик', 'Значение'];
        let csvContent = '';
        csvContent += headers.join(';') + '\n';

        for (const d of historicalSensorData) {
          const row = [d.time.toLocaleDateString() + ' ' + d.time.toLocaleTimeString(), d.sensor, d.value].join(';');
          csvContent += row + '\r\n';
        }
        // csvContent = 'data:text/csv;charset=utf-8,%EF%BB%BF' + encodeURIComponent(csvContent);

        var BOM = '\uFEFF';
        csvContent = BOM + csvContent;

        var csvData = new Blob([csvContent], { type: 'application/csv;charset=utf-8' });
        var csvUrl = URL.createObjectURL(csvData);

        // do the download stuff
        const encodedUri = csvContent;
        const link = document.createElement('a');
        link.setAttribute('target', '_blank');
        link.setAttribute('href', csvUrl);
        link.setAttribute('download', 'Значения силы тока для объекта ' + this.selectedDevice.name + ' c ' + startTime.toLocaleDateString() + ' по ' + endTime.toLocaleDateString() + '.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();

        console.log("done", new Date())
      });
  }

  onChangeDevice(device) {
    this.loadSensorData(null);
  }
}
