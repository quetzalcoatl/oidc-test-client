import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ToasterComponent } from './toaster.component';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { OAuthInfoEvent } from 'angular-oauth2-oidc';
import { AuthenticationServiceStub } from 'src/app/services/authentication.service.stub';

describe('ToasterComponent', () => {
  let component: ToasterComponent;
  let fixture: ComponentFixture<ToasterComponent>;
  let authenticationService: AuthenticationServiceStub;
  let messageService: MessageService;
  let messageServiceAddSpy: jasmine.Spy;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ToastModule ],
      providers: [
        MessageService,
        { provide: AuthenticationService, useClass: AuthenticationServiceStub }
      ],
      declarations: [ ToasterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToasterComponent);
    component = fixture.componentInstance;
    authenticationService = TestBed.get(AuthenticationService);
    messageService = TestBed.get(MessageService);
    messageServiceAddSpy = spyOn(messageService, 'add');
  });

  it('should create and destroy', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    fixture.destroy();
  });

  it('should pass OAuth Events to MessageService', () => {
    // Initialize the component
    fixture.detectChanges();

    // No events have been emitted yet, so message add should not have been called
    expect(messageServiceAddSpy).not.toHaveBeenCalled();

    // Trigger an OAuth event and ensure that message add is called accordingly
    authenticationService.emitOAuthEvent(new OAuthInfoEvent('discovery_document_loaded'));
    expect(messageServiceAddSpy).toHaveBeenCalledTimes(1);
    expect(messageServiceAddSpy.calls.mostRecent().args).toEqual([{severity: 'info', summary: 'discovery_document_loaded'}]);

    // Trigger a second event to ensure that it continues to happen properly
    authenticationService.emitOAuthEvent(new OAuthInfoEvent('user_profile_loaded'));
    expect(messageServiceAddSpy).toHaveBeenCalledTimes(2);
    expect(messageServiceAddSpy.calls.mostRecent().args).toEqual([{severity: 'info', summary: 'user_profile_loaded'}]);

    fixture.destroy();
  });

  it('should should pass on events which occurred before component initialization', () => {
    // Emit an oauth event and ensure that nothing has been called because the component isn't listening yet
    authenticationService.emitOAuthEvent(new OAuthInfoEvent('discovery_document_loaded'));
    expect(messageServiceAddSpy).not.toHaveBeenCalled();

    // Initialize the component and check to ensure that the oauth event was passed to message add accordingly
    fixture.detectChanges();
    expect(messageServiceAddSpy).toHaveBeenCalledTimes(1);
    expect(messageServiceAddSpy.calls.mostRecent().args).toEqual([{severity: 'info', summary: 'discovery_document_loaded'}]);

    fixture.destroy();
  });

  it('shoud gracefully destroy without having been initialized', () => {
    fixture.destroy();
  });
});
