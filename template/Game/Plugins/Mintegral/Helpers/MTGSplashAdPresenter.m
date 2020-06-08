#import "MTGSplashAdPresenter.h"

#import <MTGSDK/MTGSDK.h>
#import <MTGSDKSplash/MTGSplashAD.h>

#import "Game-Swift.h"

@interface MTGSplashAdPresenter () <MTGSplashADDelegate>

@property (nonatomic, strong) MTGSplashAD *splashAD;
@property (nonatomic, weak) WebGameController *viewController;
@property (nonatomic, copy) NSDictionary *callbacks;

@end

@implementation MTGSplashAdPresenter

- (void)presentFromWebGameController:(WebGameController *)viewController
                              unitID:(NSString *)unitID
                           countdown:(NSUInteger)countdown
                           allowSkip:(BOOL)allowSkip
                           callbacks:(NSDictionary<NSString *, NSString *> *)callbacks
{
    self.splashAD = [[MTGSplashAD alloc] initWithUnitID:unitID
                                              countdown:countdown
                                              allowSkip:allowSkip
                                         customViewSize:CGSizeZero
                                   preferredOrientation:MTGInterfaceOrientationAll];
    self.splashAD.delegate = self;
    
    UIWindow *keyWindow = [[UIApplication sharedApplication] keyWindow];
    [self.splashAD loadAndShowInKeyWindow:keyWindow customView:nil timeout:60000];
}

- (void)splashAD:(nonnull MTGSplashAD *)splashAD timeLeft:(NSUInteger)time {
    
}

- (void)splashADDidClick:(nonnull MTGSplashAD *)splashAD {
    NSString *callback = self.callbacks[CallbackName.onClicked];
    if (callback) {
        [self.viewController invokeCallback:callback param:nil];
    }
}

- (void)splashADDidClose:(nonnull MTGSplashAD *)splashAD {
    NSString *callback = self.callbacks[CallbackName.onDismissed];
    if (callback) {
        [self.viewController invokeCallback:callback param:nil];
    }
    [GameTimer notifyRestart];
}

- (void)splashADDidLeaveApplication:(nonnull MTGSplashAD *)splashAD {
    
}

- (void)splashADLoadFail:(nonnull MTGSplashAD *)splashAD error:(nonnull NSError *)error {
    NSDictionary *param = @{
        @"error": @{@"code": @(error.code), @"msg": error.localizedDescription}
    };
    
    NSString *callback = self.callbacks[CallbackName.onFail];
    if (callback) {
        [self.viewController invokeCallback:callback param:param];
    }
}

- (void)splashADLoadSuccess:(nonnull MTGSplashAD *)splashAD {
    
}

- (void)splashADPreloadFail:(nonnull MTGSplashAD *)splashAD error:(nonnull NSError *)error {
    NSDictionary *param = @{
        @"error": @{@"code": @(error.code), @"msg": error.localizedDescription}
    };
    
    NSString *callback = self.callbacks[CallbackName.onFail];
    if (callback) {
        [self.viewController invokeCallback:callback param:param];
    }
}

- (void)splashADPreloadSuccess:(nonnull MTGSplashAD *)splashAD {
    
}

- (void)splashADShowFail:(nonnull MTGSplashAD *)splashAD error:(nonnull NSError *)error {
    NSDictionary *param = @{
        @"error": @{@"code": @(error.code), @"msg": error.localizedDescription}
    };
    
    NSString *callback = self.callbacks[CallbackName.onFail];
    if (callback) {
        [self.viewController invokeCallback:callback param:param];
    }
}

- (void)splashADShowSuccess:(nonnull MTGSplashAD *)splashAD {
    NSString *callback = self.callbacks[CallbackName.onShown];
    if (callback) {
        [self.viewController invokeCallback:callback param:nil];
    }
}

- (void)splashADWillClose:(nonnull MTGSplashAD *)splashAD {
    
}

@end
