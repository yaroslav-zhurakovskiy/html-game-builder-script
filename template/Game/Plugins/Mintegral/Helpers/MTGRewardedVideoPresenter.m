#import "MTGRewardedVideoPresenter.h"

#import <MTGSDK/MTGSDK.h>
#import <MTGSDKReward/MTGRewardAdManager.h>

#import "Game-Swift.h"

@interface MTGRewardedVideoPresenter () <MTGRewardAdLoadDelegate, MTGRewardAdShowDelegate>

@property (nonatomic, weak) WebGameController *viewController;
@property (nonatomic, strong) MTGRewardAdManager * adManager;
@property (nonatomic, strong) NSDictionary<NSString *, NSString *> *callbacks;

@property (nonnull, copy) NSString *rewardId;
@property (nonnull, copy) NSString *userId;
@end

@implementation MTGRewardedVideoPresenter

- (void)presentFromWebGameController:(WebGameController *)viewController
                              unitID:(NSString *)unitID
                            rewardId:(NSString *)rewardId
                              userId:(NSString *)userId
                           callbacks:( NSDictionary<NSString *, NSString *> *)callbacks
{
    self.viewController = viewController;
    self.callbacks = callbacks;
    self.userId = userId;
    self.rewardId = rewardId;
    
    if (!self.adManager) {
        self.adManager = [[MTGRewardAdManager alloc] init];
    }
    
    [self.adManager loadVideo:unitID delegate:self];
}

- (void)onVideoAdLoadSuccess:(NSString *)unitId {
    [self.adManager showVideo:unitId
                 withRewardId:self.rewardId
                       userId:self.userId
                     delegate:self viewController:self.viewController];
}

- (void)onVideoAdShowFailed:(NSString *)unitId withError:(NSError *)error {
    NSDictionary *param = @{
        @"error": @{
                @"code": @(error.code),
                @"msg": error.localizedDescription
        }
    };
    NSString *callback = self.callbacks[CallbackName.onFail];
    if (callback) {
        [self.viewController invokeCallback:callback param:param];
    }
}

- (void)onVideoAdLoadFailed:(NSString *)unitId error:(NSError *)error {
    NSDictionary *param = @{
        @"error": @{
                @"code": @(error.code),
                @"msg": error.localizedDescription
        }
    };
    NSString *callback = self.callbacks[CallbackName.onFail];
    if (callback) {
        [self.viewController invokeCallback:callback param:param];
    }
}

- (void)onVideoAdShowSuccess:(NSString *)unitId {
    NSString *callback = self.callbacks[CallbackName.onShown];
    if (callback) {
        [self.viewController invokeCallback:callback param:nil];
    }
}

- (void)onVideoAdDidClosed:(NSString *)unitId {
    NSString *callback = self.callbacks[CallbackName.onDismissed];
    if (callback) {
        [self.viewController invokeCallback:callback param:nil];
    }
}

- (void)onVideoAdClicked:(NSString *)unitId {
    NSString *callback = self.callbacks[CallbackName.onClicked];
    if (callback) {
        [self.viewController invokeCallback:callback param:nil];
    }
}

@end
