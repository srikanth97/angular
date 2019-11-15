import {Component, OnInit, OnDestroy, NgZone, Output} from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {ChattingService} from './chatting.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'multicasting';
  name;

  // webSocketEndpoint = 'http://localhost:8081/socket';
  topic = '/message/' + this.name;
  stompClient: any ;
  registration = true;
  userList;
  messageList = [];
  groupList = [];
  allGroups = [];

  constructor(private chatService: ChattingService) {}


  ngOnInit(): void {
    this.chatService.messageListBehavior.subscribe((data) => {
      this.messageList  = data;
    });
    this.chatService.userListBehaviour.subscribe( (data) => {
      this.userList = data;
    });
    this.chatService.groupListBehaviour.subscribe((data) => {
      this.groupList = data;
    });
    this.chatService.groupListBehaviour.subscribe( (data) => {
      this.allGroups  = data;
    });
  }

  send(value: any) {
    console.log('***********' + value);
    this.chatService.send(value);
  }

  register(value: any) {
    this.name = value.fromName;
    this.topic = '/message/' +  this.name;
    this.registration = false;
    this.chatService.connect(this.name, this.topic);
  }

  createGroup(value: any) {
    this.chatService.createGroup(value);
  }

  join(value: any) {
    this.chatService.join(value);
  }

  sendGroupMessage(value: any) {
    this.chatService.sendGroupMessage(value);
  }
}
