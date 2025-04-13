import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';

@NgModule({
  imports: [BrowserModule, FormsModule, ReactiveFormsModule],
  providers: [
    provideClientHydration(withEventReplay())
  ],
})
export class AppModule {}

