import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { ConversationService } from '../../services/conversation.service';
import { UserService } from '../../services/user.service';

interface Chat {
  id: number;
  messages: Messages[];
}

interface Messages {
  id: number;
  domanda: string;
  risposta: string;
  createdAt: string;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  standalone: true,
  imports: [CommonModule],
})

export class SidebarComponent implements OnInit {
  public chats: Chat[] = [];
  public selectedChatId: number | null = null;
  public showError: boolean = false;
  public loginStatus: boolean = false;
  private userId: string | null = null;
  private currentUrl: string = '';
  public linkDashHome: string = 'Dashboard';

  constructor(
    private router: Router,
    private supabaseService: SupabaseService,
    private conversationService: ConversationService,
    private userService: UserService,

  ) { }

  ngOnInit():void {

    // this.userService.initUser();
    this.userService.user$.subscribe(user => {
      if (user && user.is_anonymous === false) {
        console.log('[Footer] Got user ID:', user.id);
        this.loginStatus = true;
      } else {
        console.log('[Footer] User not ready yet');
        this.loginStatus = false;
      }
    });

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentUrl = event.urlAfterRedirects;
        this.updateLinkLabel();
      }
    });

    this.userService.user$.subscribe(user => {
      if (user) {
        console.log('[Sidebar] Got user ID:', user.id);
        this.userId = user.id;
        this.supabaseService.chats$.subscribe(chats => {
          this.chats = chats;
        });
        if (this.userId) {
          this.supabaseService.getChatsForUser(this.userId);
        }
      } else {
        console.log('[Sidebar] User not ready yet');
      }
    });

    if (typeof document !== 'undefined') {
      document.addEventListener('click', this.handleClickOutside.bind(this));
    }

  }

  handleClickOutside(event: MouseEvent):void {
    const menu = document.getElementById('sidebar');
    const burger = document.querySelector(".button-burger");
    if (menu && !menu.contains(event.target as Node) && !burger?.contains(event.target as Node)) {
      menu.classList.add('hidden');
      burger?.classList.remove('close');
    }
  }


  selectChat(chatId: number):void {

    if (this.currentUrl === '/login' || this.currentUrl === '/dashboard') {
      this.router.navigate(['/']);
    }

    this.selectedChatId = chatId;
    console.log('Selected chat==================:', chatId);
    const selectedChat = this.chats.find(chat => chat.id === chatId);
    this.conversationService.setCurrentConversation(selectedChat);

  }

  async deleteChat(chatId: number, event: Event):Promise<void> {
    event.stopPropagation();
    await this.supabaseService.deleteChat(chatId.toString());

    if (this.userId) {

      // Refresh chat list
      this.supabaseService.getChatsForUser(this.userId);
      const updatedChats = this.chats;

      if (updatedChats.length > 0) {
        const lastChatId = updatedChats[updatedChats.length - 1].id;
        this.selectChat(lastChatId);
      } else {
        this.selectedChatId = null;
        this.conversationService.setCurrentConversation(null);
      }

      if (this.chats.length < 3) {
        this.showError = false;
      }

    }
  }

  async newChat():Promise<void> {

    const menu = document.getElementById('sidebar');
    const burger = document.querySelector(".button-burger");

    if (this.userId) {
      if (this.chats.length >= 3) {
        this.showError = true;
        setTimeout(() => {
          this.showError = false;
        }, 5000);
        return;

      } else {
        if (this.currentUrl == '/dashboard' || this.currentUrl == '/login') {
          this.router.navigate(['/']);
        }

        const newChat = await this.supabaseService.newChat(this.userId);
        await this.supabaseService.getChatsForUser(this.userId);
        if (newChat) {
          console.log('New chat:', newChat[0]);
          this.selectChat(newChat[0].id);
        }
      }
    }
    menu?.classList.toggle('hidden');
    burger?.classList.toggle('close');
  }

  updateLinkLabel():void {
    if (this.currentUrl === '/') {
      this.linkDashHome = 'Dashboard';
    } else if (this.currentUrl === '/dashboard') {
      this.linkDashHome = 'Home';
    } else {
      this.linkDashHome = '';
    }
  }

  toggleChat():void {
    const menu = document.getElementById('sidebar');
    const burger = document.querySelector(".button-burger");
    menu?.classList.toggle('hidden');
    burger?.classList.toggle('close');
  }

  navigateToDashOrHome(): void {
    if (this.currentUrl === '/') {
      this.router.navigate(['/dashboard']);
    }
    else if (this.currentUrl === '/dashboard') {
      this.router.navigate(['/']);
    }
    const burger = document.querySelector('.button-burger');
    burger?.classList.toggle('close');
    const menu = document.getElementById('sidebar');
    menu?.classList.toggle('hidden');
    const liChat = document.querySelector('li.selected');
    liChat?.classList.remove('selected');

  }
}