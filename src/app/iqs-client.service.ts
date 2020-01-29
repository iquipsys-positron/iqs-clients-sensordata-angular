import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class IqsClientService {

  // private serverUrl = "http://api.positron.stage.iquipsys.net:30018";
  private serverUrl = "http://api.positron.iquipsys.net:30018";

  constructor(public http: HttpClient) { }

  about() {
    return this.http.get(this.serverUrl + "/api/v1/about");
  }

  signin(login: string, password: string) {
    return this.http.post(this.serverUrl + "/api/v1/signin", { "login": login, "password": password });
  }

  signout() {
    return this.http.options(this.serverUrl + "/api/v1/signout");
  }

  getObjects(orgId: string, sessionId: string) {
    return this.http.get(this.serverUrl + "/api/v1/organizations/" + orgId + "/control_objects",
      { headers: { "x-session-id": sessionId } });
  }

  getObject(orgId: string, objectId: string, sessionId: string) {
    return this.http.get(this.serverUrl + "/api/v1/organizations/" + orgId + "/control_objects/" + objectId,
      { headers: { "x-session-id": sessionId } });
  }

  getDevices(orgId: string, sessionId: string) {
    return this.http.get(this.serverUrl + "/api/v1/organizations/" + orgId + "/devices",
      { headers: { "x-session-id": sessionId } });
  }

  getDailyObjectData(orgId: string, sessionId: string, date: Date) {
    return this.http.get(this.serverUrl + "/api/v1/organizations/" + orgId + "/curr_object_states",
      { headers: { "x-session-id": sessionId } });
  }

  getDailyObjectDataDevice(orgId: string, deviceId: string, sessionId: string) {
    return this.http.get(this.serverUrl + "/api/v1/organizations/" + orgId + "/curr_object_states?device_id=" + deviceId,
      { headers: { "x-session-id": sessionId } });
  }

  getObjectData(orgId: string, sessionId: string, fromTime: Date, toTime: Date) {
    return this.http.get(this.serverUrl + "/api/v1/organizations/" + orgId + "/object_data?from_time=" + fromTime.toISOString() +
      "&to_time=" + toTime.toISOString(), { headers: { "x-session-id": sessionId } });
  }

  getObjectDataObject(orgId: string, objectId: string, sessionId: string, fromTime: Date, toTime: Date) {
    return this.http.get(this.serverUrl + "/api/v1/organizations/" + orgId + "/object_data?object_id=" + objectId +
      "&from_time=" + fromTime.toISOString() + "&to_time=" + toTime.toISOString() + "&big_period=true", { headers: { "x-session-id": sessionId } });
  }

  deleteSession(userId: string, sessionId: string) {
    return this.http.delete(this.serverUrl + "/api/v1/sessions/" + userId + "/" + sessionId,
      { headers: { "x-session-id": sessionId } });
  }
}
