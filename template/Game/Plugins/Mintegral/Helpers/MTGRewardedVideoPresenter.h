#import <Foundation/Foundation.h>

NS_ASSUME_NONNULL_BEGIN

@class WebGameController;

@interface MTGRewardedVideoPresenter : NSObject

- (void)presentFromWebGameController:(WebGameController *)viewController
                              unitID:(NSString *)unitID
                            rewardId:(nullable NSString *)rewardId
                              userId:(nullable NSString *)userId
                           callbacks:(NSDictionary<NSString *, NSString *> *)callbacks;

@end

NS_ASSUME_NONNULL_END
