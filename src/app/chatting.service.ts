import {Injectable} from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {BehaviorSubject} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ChattingService {
  webSocketEndpoint = 'http://localhost:8081/socket';
  name;
  topic = '/message/' + this.name;
  stompClient: any;
  userList;
  userListBehaviour: BehaviorSubject<any>;
  messageList = [];
  messageListBehavior: BehaviorSubject<any>;
  groupList = [];
  groupListBehaviour: BehaviorSubject<any>;
  allGroups = [];
  allGroupsBehaviour: BehaviorSubject<any>;
  private sentMessages: any[];
  sentMessagesBehaviour: BehaviorSubject<any>;
  private recivedMessages: any[];
  receivedMessagesBehaviour: BehaviorSubject<any>;

  constructor() {
    this.userListBehaviour = new BehaviorSubject<any>(this.userList);
    this.messageListBehavior = new BehaviorSubject<any>(this.messageList);
    this.groupListBehaviour = new BehaviorSubject<any>(this.groupList);
    this.allGroupsBehaviour = new BehaviorSubject<any>(this.allGroupsBehaviour);
    this.sentMessagesBehaviour = new BehaviorSubject<any>(this.sentMessages);
    this.receivedMessagesBehaviour = new BehaviorSubject<any>(this.recivedMessages);
  }

  connect(name: string, topic: string) {
    this.name = name;
    this.topic = topic;
    console.log('connecting ...');
    const ws = new SockJS(this.webSocketEndpoint);
    this.stompClient = Stomp.over(ws);
    // tslint:disable-next-line:variable-name
    const _this = this;

    _this.stompClient.connect({}, (frame) => {

        _this.stompClient.subscribe(_this.topic, (data) => {
            this.messageList.push(JSON.parse(data.body));
            this.messageListBehavior.next(this.messageList);
        });

        _this.stompClient.subscribe('/message/users', (data) => {
            this.userList = JSON.parse(data.body);
            this.userListBehaviour.next(this.userList);
        });

        _this.stompClient.send('/app/chat.newUser', {}, this.name);

        _this.stompClient.subscribe('/message/allGroups', (data) => {
            console.log('*****************' + data);
            this.allGroups = JSON.parse(data.body);
            this.allGroupsBehaviour.next(this.allGroupsBehaviour);
        });

        _this.stompClient.subscribe('/message/groupList/' + _this.name, (data) => {
            console.log('*****************' + data);
            this.groupList = JSON.parse(data.body);
            this.groupListBehaviour.next(this.groupList);
        });

    }, this.errorCallBack);
  }

  errorCallBack(error) {
    console.log('errorcallBack' + error);
    setTimeout(() => {
      this.connect(this.name, this.topic);
    }, 5000);
  }

  disconnect() {
    if (this.stompClient != null) {
      this.stompClient.disconnect();
    }
    console.log('disconnected');
  }

  send(value: any) {
    console.log('***********' + value);
    this.messageList.push({fromName: this.name, toName: value.toName, content: value.content});
    this.stompClient.send('/app/chat.sendMessage/' + this.name + '/' + value.toName, {}, JSON.stringify({
      fromName: this.name,
      toName : value.toName,
      content: value.content
    }));
    console.log('calling logout api via web socket');
  }

  createGroup(value: any) {
    this.stompClient.send('/app/chat.newGroup/' + value.groupName, {}, this.name);
  }

  join(value: any) {
    this.stompClient.send('/app/chat.newGroup/' + value.groupName, {}, this.name);
  }

  sendGroupMessage(value: any) {
    this.stompClient.send('/app/chat.groupMessage/' + value.groupName, {},  JSON.stringify({
      fromName: this.name,
      toName : value.groupName,
      content: value.groupContent
    }));
  }

  showMessages(user: any) {
    // tslint:disable-next-line:no-shadowed-variabl
    this.sentMessagesBehaviour.next(this.messageList.filter((element) => {
      if ((element.toName === user.name && element.fromName === this.name) ||
          (element.toName === this.name && element.fromName === user.name)) {
        return true;
      }
    }));
  }

  showGroupMessages(group: string) {
    this.sentMessagesBehaviour.next(this.messageList.filter( (element) => {
      if (element.toName === group || element.fromName === group) { return true; }
    }));
  }
}
