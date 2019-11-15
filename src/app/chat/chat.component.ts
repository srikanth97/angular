import {Component, Input, OnInit} from '@angular/core';
import {ChattingService} from '../chatting.service';
import {element} from 'protractor';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {

  constructor(private chatService: ChattingService) { }

  @Input('userName') userName: string;
  userList;
  messageList;
  groupList;
  userMessageList;
  selectedUser: string;
  userSelected = false;
  private sentMessages = [];
  private recivedMessages: [];
  content: string;

  ngOnInit() {
    this.chatService.userListBehaviour.subscribe( (data) => {
      this.userList = data;
    });
    this.chatService.messageListBehavior.subscribe( (data) => {
      this.messageList = data;
    });
    this.chatService.groupListBehaviour.subscribe( (data) => {
      this.groupList = data;
    });
    this.chatService.sentMessagesBehaviour.subscribe( (data) => {
      this.sentMessages = data;
    });
    this.chatService.receivedMessagesBehaviour.subscribe( (data) => {
      this.recivedMessages = data;
    });
  }

  showMessages(user: any) {
        this.userSelected = true;
        this.selectedUser = user.name;
        this.chatService.showMessages(user);
  }

  showGroupMessages(group: string) {
    this.userSelected = false;
    this.selectedUser = group;
    this.chatService.showGroupMessages(group);
  }

  sendMessage() {
    let value = {};
    if (this.userSelected) {
      value = {
        toName : this.selectedUser,
        content: this.content
      };
      this.chatService.send(value);
      this.showMessages({name: this.userSelected});
      console.log('*********************');
    } else {
      value = {
        groupName : this.selectedUser,
        groupContent: this.content
      };
      this.chatService.sendGroupMessage(value);
      this.showGroupMessages(this.selectedUser);
    }
  }
}
