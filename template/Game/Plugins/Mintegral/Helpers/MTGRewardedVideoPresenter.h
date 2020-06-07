#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@class WebGameController;

@interface MTGRewardedVideoPresenter : NSObject

- (void)presentFromWebGameController:(WebGameController *)viewController
                              unitID:(NSString *)unitID
                            rewardId:(NSString *)rewardId
                              userId:(NSString *)userId
                           callbacks:( NSDictionary<NSString *, NSString *> *)callbacks;

@end

NS_ASSUME_NONNULL_END
